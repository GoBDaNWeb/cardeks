import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setOpenFilters } from '@/widgets/filters';
import { setActiveMenu } from '@/widgets/menu-list';

import { useFindAzsOnRouteMutation, useGetTerminalsQuery } from '@/shared/api';
import { useLazyGetTerminalsQuery } from '@/shared/api/cardeksPoints';
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

type Coordinates = [number, number];

interface IUseRouteProps {
	ymaps: any;
	map: any;
	setPointCollection: React.Dispatch<React.SetStateAction<any[]>>;
	features: Feature[];
	objectManagerState: any;
}

interface IFindAzsData {
	radius: number;
	points: Coordinates[];
}

export const useRoute = ({
	ymaps,
	map,
	setPointCollection,
	features,
	objectManagerState
}: IUseRouteProps) => {
	const [addressesCollection, setAddressesCollection] = useState<string[]>([]);
	const [routeCoordsState, setRouteCoordsState] = useState<Coordinates[]>([]);

	const dispatch = useDispatch();
	const { filterDataByOptions } = useIndexedDB();

	const {
		routeInfo: { routeCoords, buildRoute, routeIsChanged, pointsOnRoute, isUrlBuild }
	} = useTypedSelector(state => state.map);
	const { selectedFilter, filters } = useTypedSelector(state => state.filters);
	const { addSettings, withFilters } = useTypedSelector(state => state.routeForm);
	const { routesParam } = getQueryParams();
	const [fetchTerminals, { data: terminalsList }] = useLazyGetTerminalsQuery();
	// const { data: terminalsList } = useGetTerminalsQuery();
	const multiRouteRef = useRef<any>(null);
	const [fetchAzs, { isLoading }] = useFindAzsOnRouteMutation();

	useEffect(() => {
		dispatch(setRouteIsBuilding(isLoading));
	}, [isLoading]);

	// функция фильтра точек азс
	const filtered = async (points?: Feature[]) => {
		return await filterDataByOptions(
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
	};

	// Получение адреса по координатам
	const getAddressByCoords = async (coord: Coordinates): Promise<string> => {
		const res = await ymaps.geocode(coord);
		const firstGeoObject = res.geoObjects.get(0);
		return firstGeoObject.getAddressLine();
	};

	// Обработка точек на маршруте
	const handleRoutePoints = async (lines: any, threshold: number) => {
		try {
			const result = await fetchTerminals().unwrap();
			if (!lines || !lines.toArray().length) return;

			const linesArr = lines.toArray()[0].geometry.getCoordinates() as Coordinates[];
			const findAzsData: IFindAzsData = {
				radius: threshold,
				points: linesArr
			};

			const currentAzs = await fetchAzs(findAzsData).unwrap();
			const mergedData = mergeData(currentAzs.data, result.data);
			const points = createPoints(mergedData);

			if (points.length > 0 && objectManagerState) {
				if (withFilters) {
					const newFilteredPoints = await filtered(points);
					dispatch(setPointsOnRoute(newFilteredPoints));
				} else {
					dispatch(setPointsOnRoute(points));
				}
			}
		} catch (e) {
			console.error('Ошибка при загрузке:', e);
		}
	};

	// Создание и настройка маршрута
	const createMultiRoute = (routesArr: Coordinates[]) => {
		return new ymaps.multiRouter.MultiRoute(
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
	};

	// функция построения маршрута
	const handleBuildRoute = async (
		condition: boolean,
		urlBuild: boolean,
		routesArr: Coordinates[]
	) => {
		const threshold = addSettings.includes(2) ? 200 : 500;
		if (!map) return;

		if (multiRouteRef.current) {
			map.geoObjects.remove(multiRouteRef.current);
		}

		if (!condition) {
			if (multiRouteRef.current) {
				objectManagerState.add(features);
				map.geoObjects.remove(multiRouteRef.current);
				multiRouteRef.current = null;
				dispatch(clearRouteAddresses());
				dispatch(setCoords([]));
			}
			return;
		}

		let lineGeoObjects;
		let lines: any = null;
		const multiRoute = createMultiRoute(routesArr);
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
					dispatch(setRouteTime(activeRoute.properties.get('duration').text));
					dispatch(setRouteLength(activeRoute.properties.get('distance').text));
				}

				dispatch(setRouteBuilded(true));
				dispatch(setRouteChanged(false));
				dispatch(setOpenFilters(false));
				dispatch(setMapLoading(false));
				resolve('route');
			});
		});

		await routePromise;

		if (urlBuild && features) {
			await handleUrlBuild(routesArr, lines, threshold);
		} else {
			await handleRoutePoints(lines, threshold);
			dispatch(setRouteAddresses(addressesCollection));
		}
	};

	// Обработка построения маршрута из URL
	const handleUrlBuild = async (routesArr: Coordinates[], lines: any, threshold: number) => {
		dispatch(setActiveMenu('route'));
		dispatch(setRouteAddresses(addressesCollection));
		objectManagerState.removeAll();

		setRouteCoordsState([...routesArr]);

		const addresses = await Promise.all(routesArr.map(coord => getAddressByCoords(coord)));
		dispatch(setRouteAddresses(addresses));

		routesArr.forEach((coords, index) => {
			const myPlacemark = createPlacemark({ ymaps, coords, index });
			map.geoObjects.add(myPlacemark);
			setPointCollection(prevCollection => [...prevCollection, myPlacemark]);
		});

		await handleRoutePoints(lines, threshold);
	};

	useEffect(() => {
		if (objectManagerState && pointsOnRoute) {
			objectManagerState.removeAll();
			objectManagerState.add(pointsOnRoute);
		}
	}, [pointsOnRoute]);

	useEffect(() => {
		dispatch(setCoords(routeCoordsState));
	}, [routeCoordsState, dispatch]);

	useEffect(() => {
		const condition = buildRoute || routeIsChanged;
		handleBuildRoute(condition, false, routeCoords as Coordinates[]);
	}, [buildRoute, routeIsChanged]);

	useEffect(() => {
		if (routesParam && objectManagerState && isUrlBuild && features.length) {
			const condition = routesParam && buildRoute;
			handleBuildRoute(condition, true, routesParam as Coordinates[]);
		}
	}, [map, buildRoute, objectManagerState, isUrlBuild, features]);

	useEffect(() => {
		if (routeCoords.length > 1) {
			Promise.all(routeCoords.map((coord: Coordinates) => getAddressByCoords(coord))).then(
				addresses => {
					setAddressesCollection(addresses);
				}
			);
		}
	}, [routeCoords]);
};
