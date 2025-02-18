import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setActiveMenu } from '@/widgets/menu-list';

import { getQueryParams, useIndexedDB, useTypedSelector } from '@/shared/lib';
import { Feature } from '@/shared/types';

import {
	clearRouteAddresses,
	setCoords,
	setMapLoading,
	setPointsOnRoute,
	setRouteAddresses,
	setRouteBuilded,
	setRouteChanged,
	setRouteLength,
	setRouteTime
} from '../../model';
import { createPlacemark, getAzsOnRoute, routeToLineString } from '../helpers';

interface IUseRouteProps {
	ymaps: any;
	map: any;
	setPointCollection: React.Dispatch<React.SetStateAction<any[]>>;
	features: Feature[];
	objectManagerState: any;
}

export const useRoute = ({
	ymaps,
	map,
	setPointCollection,
	features,
	objectManagerState
}: IUseRouteProps) => {
	const [addressesCollection, setAddressesCollection] = useState<string[]>([]);
	const [routeCoordsState, setRouteCoordsState] = useState<number[][]>([]);
	const dispatch = useDispatch();
	const { filterDataByOptions } = useIndexedDB();
	const {
		routeInfo: { routeCoords, buildRoute, routeIsChanged, pointsOnRoute, isUrlBuild }
	} = useTypedSelector(state => state.map);
	const {
		addSettings,
		filters: { brandTitles, azsTypes },
		withFilters
	} = useTypedSelector(state => state.routeForm);
	const { routesParam } = getQueryParams();

	const multiRouteRef = useRef<any>(null);

	const filtered = async () => {
		const filteredData = await filterDataByOptions([], [], brandTitles, azsTypes);
		return filteredData;
	};

	// функция построения маршрута
	const handleBuildRoute = async (condition: boolean, urlBuild: boolean, routesArr: number[][]) => {
		// дальность точки от маршрута в мметрах
		const threshold = addSettings.includes(2) ? 200 : 500;
		if (map) {
			if (multiRouteRef.current) {
				map.geoObjects.remove(multiRouteRef.current);
			}

			if (condition) {
				let multiRoute = new ymaps.multiRouter.MultiRoute(
					{
						referencePoints: routesArr,
						params: {
							routingMode: 'auto',
							results: 1
						}
					},
					{
						boundsAutoApply: true,
						routeActiveStrokeWidth: 6,
						wayPointVisible: false,
						routeActiveStrokeShowLabels: false,
						routeActiveStrokeColor: '444444'
					}
				);
				map.geoObjects.add(multiRoute);
				multiRouteRef.current = multiRoute;
				if (addSettings.includes(0)) {
					multiRoute.model.setParams({ avoidTrafficJams: true }, true);
				}
				multiRoute.model.events.add('update', async () => {
					if (objectManagerState) {
						objectManagerState.removeAll();
					}
					var lineGeoObjects = multiRoute
						.getRoutes()
						.toArray()
						.map((route: any) => new ymaps.Polyline(routeToLineString(route)));

					var lines = new ymaps.GeoObjectCollection(
						{ children: lineGeoObjects },
						{ visible: false }
					);
					map.geoObjects.add(lines);

					const routes = multiRoute.getRoutes();

					if (routes.getLength() > 0) {
						const activeRoute = routes.get(0);

						const time = activeRoute.properties.get('duration').text;
						const length = activeRoute.properties.get('distance').text;
						dispatch(setRouteTime(time));
						dispatch(setRouteLength(length));
					}
					dispatch(setRouteBuilded(true));
					dispatch(setRouteChanged(false));

					if (urlBuild && features) {
						dispatch(setMapLoading(true));
						dispatch(setActiveMenu('route'));
						dispatch(setRouteAddresses(addressesCollection));
						objectManagerState.removeAll();

						const azsOnRoute = await getAzsOnRoute(features, lines, threshold, routesArr[0]);
						if (azsOnRoute) {
							objectManagerState.add(azsOnRoute);
							dispatch(setPointsOnRoute(azsOnRoute));
						}
						setRouteCoordsState([...routesArr]);

						const geocodePromises = routesArr.map((coord: number[]) => {
							return ymaps.geocode(coord).then((res: any) => {
								const firstGeoObject = res.geoObjects.get(0);
								const address = firstGeoObject.getAddressLine();
								return address;
							});
						});

						Promise.all(geocodePromises).then(addresses => {
							dispatch(setRouteAddresses(addresses));
							dispatch(setMapLoading(false));
						});
						routesArr.forEach((coords, index) => {
							const myPlacemark = createPlacemark({ ymaps, coords, index });
							map.geoObjects.add(myPlacemark);
							setPointCollection(prevCollection => [...prevCollection, myPlacemark]);
						});
					} else {
						filtered();
						const newFilteredPoints = await filtered();
						const azsOnRoute = await getAzsOnRoute(
							withFilters ? newFilteredPoints : features,
							lines,
							threshold,
							routeCoords[0]
						);
						if (azsOnRoute && objectManagerState) {
							objectManagerState.add(azsOnRoute);
							dispatch(setPointsOnRoute(azsOnRoute));
						}
						dispatch(setRouteAddresses(addressesCollection));
					}
				});
			} else {
				if (multiRouteRef.current) {
					objectManagerState.add(features);
					map.geoObjects.remove(multiRouteRef.current);
					multiRouteRef.current = null;
					dispatch(clearRouteAddresses());
					dispatch(setCoords([]));
				}
			}
		}
	};

	useEffect(() => {
		if (objectManagerState && pointsOnRoute) {
			objectManagerState.removeAll();
			objectManagerState.add(pointsOnRoute);
		}
	}, [pointsOnRoute]);

	// обновление координат
	useEffect(() => {
		dispatch(setCoords(routeCoordsState));
	}, [routeCoordsState, dispatch]);

	// построение маршрута
	useEffect(() => {
		const condition = buildRoute || routeIsChanged;
		handleBuildRoute(condition, false, routeCoords);
	}, [buildRoute, routeIsChanged]);

	// построение маршрута по данным из url
	useEffect(() => {
		if (routesParam && objectManagerState && isUrlBuild && features.length) {
			const condition = routesParam && buildRoute;
			handleBuildRoute(condition, true, routesParam);
		}
	}, [map, buildRoute, objectManagerState, isUrlBuild, features]);

	// получение адресов по координатам
	useEffect(() => {
		if (routeCoords.length > 1) {
			const geocodePromises = routeCoords.map((coord: number[]) => {
				return ymaps.geocode(coord).then((res: any) => {
					const firstGeoObject = res.geoObjects.get(0);
					const address = firstGeoObject.getAddressLine();
					return address;
				});
			});

			Promise.all(geocodePromises).then(addresses => {
				setAddressesCollection(addresses);
			});
		}
	}, [routeCoords]);
};
