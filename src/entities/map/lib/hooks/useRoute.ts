import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setOpenFilters } from '@/widgets/filters';
import { setActiveMenu } from '@/widgets/menu-list';

import { useFindAzsOnRouteMutation, useGetTerminalsQuery } from '@/shared/api';
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
	setRouteIsBuilding,
	setRouteLength,
	setRouteTime
} from '../../model';
import { createPlacemark, createPoints, mergeData, routeToLineString } from '../helpers';

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
	const { selectedFilter, filters } = useTypedSelector(state => state.filters);
	const { addSettings, withFilters } = useTypedSelector(state => state.routeForm);
	const { routesParam } = getQueryParams();

	const { data: terminalsList } = useGetTerminalsQuery();

	const multiRouteRef = useRef<any>(null);

	const [fetchAzs, { isLoading }] = useFindAzsOnRouteMutation();

	useEffect(() => {
		dispatch(setRouteIsBuilding(isLoading));
	}, [isLoading]);

	const filtered = async (points?: Feature[]) => {
		const filteredData = await filterDataByOptions(
			filters.fuelFilters,
			filters.features,
			filters.brandTitles,
			[],
			filters.addServices,
			filters.gateHeight,
			filters.terminal,
			filters.card,
			selectedFilter,
			filters.relatedProducts,
			points
		);
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
				let lineGeoObjects;
				//@ts-ignore
				let lines;
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
				const routePromise = new Promise(resolve => {
					multiRoute.model.events.add('update', async () => {
						if (objectManagerState) {
							objectManagerState.removeAll();
						}
						lineGeoObjects = multiRoute
							.getRoutes()
							.toArray()
							.map((route: any) => new ymaps.Polyline(routeToLineString(route)));

						lines = new ymaps.GeoObjectCollection({ children: lineGeoObjects }, { visible: false });
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
						dispatch(setOpenFilters(false));
						dispatch(setMapLoading(false));
						resolve('route');
					});
				});
				routePromise.then(async res => {
					if (urlBuild && features) {
						dispatch(setActiveMenu('route'));
						dispatch(setRouteAddresses(addressesCollection));
						objectManagerState.removeAll();

						setRouteCoordsState([...routesArr]);
						// dispatch(setCoords(routesArr));
						const geocodePromises = routesArr.map((coord: number[]) => {
							return ymaps.geocode(coord).then((res: any) => {
								const firstGeoObject = res.geoObjects.get(0);
								const address = firstGeoObject.getAddressLine();
								return address;
							});
						});

						Promise.all(geocodePromises).then(addresses => {
							dispatch(setRouteAddresses(addresses));
						});
						routesArr.forEach((coords, index) => {
							const myPlacemark = createPlacemark({ ymaps, coords, index });
							map.geoObjects.add(myPlacemark);
							setPointCollection(prevCollection => [...prevCollection, myPlacemark]);
						});
						if (withFilters) {
							// @ts-ignore
							const linesArr = lines.toArray()[0].geometry.getCoordinates();
							const findAzsData = {
								radius: threshold,
								points: linesArr
							};
							const currentAzs = await fetchAzs(findAzsData).unwrap();
							const mergedData = mergeData(currentAzs.data, terminalsList.data);

							const points = createPoints(mergedData);
							const newFilteredPoints = await filtered(points);

							if (points.length > 0 && objectManagerState) {
								dispatch(setPointsOnRoute(newFilteredPoints));
							}
						} else {
							//@ts-ignore
							const linesArr = lines.toArray()[0].geometry.getCoordinates();
							const findAzsData = {
								radius: threshold,
								points: linesArr
							};
							const currentAzs = await fetchAzs(findAzsData).unwrap();
							const mergedData = mergeData(currentAzs.data, terminalsList.data);

							const points = createPoints(mergedData);

							if (points.length > 0 && objectManagerState) {
								dispatch(setPointsOnRoute(points));
							}
						}
					} else {
						if (withFilters) {
							// @ts-ignore
							const linesArr = lines.toArray()[0].geometry.getCoordinates();
							const findAzsData = {
								radius: threshold,
								points: linesArr
							};
							const currentAzs = await fetchAzs(findAzsData).unwrap();
							const mergedData = mergeData(currentAzs.data, terminalsList.data);

							const points = createPoints(mergedData);
							const newFilteredPoints = await filtered(points);

							if (points.length > 0 && objectManagerState) {
								dispatch(setPointsOnRoute(newFilteredPoints));
							}
						} else {
							//@ts-ignore
							const linesArr = lines.toArray()[0].geometry.getCoordinates();
							const findAzsData = {
								radius: threshold,
								points: linesArr
							};
							const currentAzs = await fetchAzs(findAzsData).unwrap();
							const mergedData = mergeData(currentAzs.data, terminalsList.data);

							const points = createPoints(mergedData);

							if (points.length > 0 && objectManagerState) {
								dispatch(setPointsOnRoute(points));
							}
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
