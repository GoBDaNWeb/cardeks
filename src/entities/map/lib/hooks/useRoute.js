import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setActiveMenu } from '@/widgets/menu-list';

import { getQueryParams } from '@/shared/lib';

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

export const useRoute = ({ ymaps, map, setPointCollection }) => {
	const [addressesColletion, setAddressesCollection] = useState([]);
	const [routeCoordsState, setRouteCoordsState] = useState([]);
	const dispatch = useDispatch();

	const {
		routeInfo: { routeCoords, buildRoute, routeIsChanged }
	} = useSelector(state => state.map);

	const multiRouteRef = useRef(null);

	const handleBuildRoute = (condition, urlBuild, routesArr) => {
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
				multiRoute.model.events.add('update', e => {
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
								.geocode(address, {
									results: 1
								})
								.then(function (res) {
									let firstGeoObject = res.geoObjects.get(0);
									let coords = firstGeoObject.geometry.getCoordinates();
									const myPlacemark = createPlacemark({ ymaps, coords, index });
									setRouteCoordsState(prevCoords => [...prevCoords, coords]);
									map.geoObjects.add(myPlacemark);
									setPointCollection(prevCollection => [...prevCollection, myPlacemark]);
								})
								.catch(error => {
									console.error('Ошибка геокодирования:', error);
								});
						});
					} else {
						dispatch(setRouteAddresses(addressesColletion));
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

	// отрисосываем маршрут из данных в url
	useEffect(() => {
		const queryRoutes = getQueryParams(window.location.href).routes;
		if (queryRoutes) {
			const condition = queryRoutes && buildRoute;
			const queryRoutesArray = queryRoutes.split(';');
			handleBuildRoute(condition, true, queryRoutesArray);
		}
	}, [map, buildRoute]);

	// при отрисовке маршрута по url складываем коорлинаты точек
	useEffect(() => {
		dispatch(setCoords(routeCoordsState));
	}, [routeCoordsState, dispatch]);

	// строим маршрут
	useEffect(() => {
		const condition = buildRoute || routeIsChanged;
		handleBuildRoute(condition, false, routeCoords);
	}, [buildRoute, routeIsChanged]);

	// получение адресов из координат
	useEffect(() => {
		if (routeCoords.length > 1) {
			const geocodePromises = routeCoords.map(coord => {
				return ymaps.geocode(coord).then(function (res) {
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
