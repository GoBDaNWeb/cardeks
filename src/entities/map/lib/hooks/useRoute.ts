import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setActiveMenu } from '@/widgets/menu-list';

import { getQueryParams, useTypedSelector } from '@/shared/lib';

import {
	clearRouteAddresses,
	setCoords,
	setRouteAddresses,
	setRouteBuilded,
	setRouteChanged,
	setRouteLength,
	setRouteTime
} from '../../model';
import { createPlacemark } from '../helpers';

interface IUseRouteProps {
	ymaps: any;
	map: any;
	setPointCollection: React.Dispatch<React.SetStateAction<any[]>>;
}

export const useRoute = ({ ymaps, map, setPointCollection }: IUseRouteProps) => {
	const [addressesCollection, setAddressesCollection] = useState<string[]>([]);
	const [routeCoordsState, setRouteCoordsState] = useState<number[][]>([]);

	const dispatch = useDispatch();

	const {
		routeInfo: { routeCoords, buildRoute, routeIsChanged }
	} = useTypedSelector(state => state.map);

	const multiRouteRef = useRef<any>(null);

	const handleBuildRoute = (condition: boolean, urlBuild: boolean, routesArr: string[]) => {
		if (map) {
			if (multiRouteRef.current) {
				map.geoObjects.remove(multiRouteRef.current);
			}

			if (condition) {
				let multiRoute = new ymaps.multiRouter.MultiRoute(
					{
						referencePoints: routesArr
					},
					{
						boundsAutoApply: true,
						routeActiveStrokeWidth: 6,
						wayPointVisible: false,
						routeActiveStrokeShowLabels: false,
						routeActiveStrokeColor: '5DAFEE'
					}
				);

				map.geoObjects.add(multiRoute);
				multiRouteRef.current = multiRoute;

				multiRoute.model.events.add('update', (e: any) => {
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

					if (urlBuild) {
						dispatch(setActiveMenu('route'));
						dispatch(setRouteAddresses(routesArr));
						routesArr.forEach((address, index) => {
							ymaps
								.geocode(address, { results: 1 })
								.then((res: any) => {
									let firstGeoObject = res.geoObjects.get(0);
									let coords = firstGeoObject.geometry.getCoordinates();
									const myPlacemark = createPlacemark({ ymaps, coords, index });
									setRouteCoordsState(prevCoords => [...prevCoords, coords]);
									map.geoObjects.add(myPlacemark);
									setPointCollection(prevCollection => [...prevCollection, myPlacemark]);
								})
								.catch((error: any) => {
									console.error('Ошибка геокодирования:', error);
								});
						});
					} else {
						dispatch(setRouteAddresses(addressesCollection));
					}
				});
			} else {
				if (multiRouteRef.current) {
					map.geoObjects.remove(multiRouteRef.current);
					multiRouteRef.current = null;
					dispatch(clearRouteAddresses());
					dispatch(setCoords([]));
				}
			}
		}
	};

	useEffect(() => {
		const queryRoutes = getQueryParams(window.location.href).routes;
		if (queryRoutes) {
			const condition = queryRoutes && buildRoute;
			const queryRoutesArray = queryRoutes.split(';');
			handleBuildRoute(condition, true, queryRoutesArray);
		}
	}, [map, buildRoute]);

	useEffect(() => {
		dispatch(setCoords(routeCoordsState));
	}, [routeCoordsState, dispatch]);

	useEffect(() => {
		const condition = buildRoute || routeIsChanged;
		handleBuildRoute(condition, false, routeCoords);
	}, [buildRoute, routeIsChanged]);

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
