import { useCallback, useEffect, useState } from 'react';
import Loader from 'react-js-loader';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';
import { Map as MapType, ObjectManager } from 'yandex-maps';

import { setActiveObject } from '@/entities/object-info';

import { useGetPointsQuery, useGetTerminalsQuery } from '@/shared/api';
import { useIndexedDB, useTypedSelector } from '@/shared/lib';
import { Feature, IPlacemark } from '@/shared/types';

import { createPoints, usePoint, useRoute } from '../lib';
import {
	handleWheel,
	setCategoryTotals,
	setCenter,
	setFixedCenter,
	setIsUrlBuid,
	setMapLoading,
	setPanoramaOpen,
	setPoints,
	setZoom
} from '../model';

import s from './map.module.scss';

export const CustomMap = () => {
	const ymaps = window.ymaps;
	const [features, setFeatures] = useState<Feature[]>([]);
	const [map, setMap] = useState<null | MapType>(null);
	const [objectManagerState, setObjectManagerState] = useState<ObjectManager | null>(null);
	const [pointCollection, setPointCollection] = useState<IPlacemark[]>([]);
	const dispatch = useDispatch();
	const { saveData, getAllData, filterDataByType, filterDataByOptions } = useIndexedDB();

	const { data, isLoading } = useGetPointsQuery();
	const { data: terminalsList, isLoading: isLoadingTerminal } = useGetTerminalsQuery();

	const {
		mapInfo: { zoom, isWheel, mapType, panorama, panoramaIsOpen, center, mapLoading },
		routeInfo: { isSelectAddress }
	} = useTypedSelector(state => state.map);

	const { selectedFilter, filtersIsOpen, filters } = useTypedSelector(state => state.filters);

	const getVisibleMarkers = useCallback(
		(map: MapType, objectManager: any) => {
			const bounds = map.getBounds();
			const visibleMarkers = objectManager.objects.getAll().filter((marker: Feature) => {
				const coordinates = marker.geometry.coordinates;
				return (
					bounds[0][0] <= coordinates[0] &&
					coordinates[0] <= bounds[1][0] &&
					bounds[0][1] <= coordinates[1] &&
					coordinates[1] <= bounds[1][1]
				);
			});
			const visibleWashingPoints = visibleMarkers.filter((marker: Feature) => marker.types.washing);
			const visibleTirePoints = visibleMarkers.filter((marker: Feature) => marker.types.tire);

			dispatch(
				setCategoryTotals({
					category: 'azs',
					totalView: visibleMarkers.length
				})
			);
			dispatch(
				setCategoryTotals({
					category: 'points',
					totalView: visibleMarkers.length
				})
			);
			dispatch(
				setCategoryTotals({
					category: 'washing',
					totalView: visibleWashingPoints.length
				})
			);
			dispatch(
				setCategoryTotals({
					category: 'tire',
					totalView: visibleTirePoints.length
				})
			);
			dispatch(setPoints(visibleMarkers));
		},
		[dispatch]
	);

	const init = () => {
		let map = new ymaps.Map('map', {
			center: [55.686736, 37.440496],
			zoom
		});

		setMap(map);
		map.container.getElement().style.cursor = 'pointer';
		map.controls.remove('searchControl');
		map.controls.remove('trafficControl');
		map.controls.remove('typeSelector');
		map.controls.remove('rulerControl');
		map.controls.remove('zoomControl');
		map.controls.add('rulerControl', {
			float: 'none',
			position: {
				top: '80px',
				left: '73px'
			}
		});
		map.events.add('boundschange', e => {
			dispatch(setFixedCenter(e.get('newCenter')));
			dispatch(setZoom(map.getZoom()));
			dispatch(handleWheel(true));
		});
		map.geoObjects.events.add('click', function (e) {
			dispatch(setActiveObject(e.get('objectId')));
		});
	};

	useEffect(() => {
		ymaps.ready(init);
		if (window.location.search.length > 0) {
			dispatch(setIsUrlBuid(true));
		}
	}, []);

	useEffect(() => {
		if (!isLoading && map) {
			const objectManager = new ymaps.ObjectManager({
				clusterize: true,
				geoObjectOpenBalloonOnClick: true,
				gridSize: 128,
				clusterOpenBalloonOnClick: true
			});
			map.geoObjects.add(objectManager);
			objectManager.add(features);
			setObjectManagerState(objectManager);
			const mappedAzsPoints = features.map((marker: Feature) => {
				const newObject = {
					...marker,
					options: Object.keys(marker.types).reduce(
						(acc, key) => {
							if (key !== 'washing' && key !== 'tire') {
								acc[key] = marker.types[key];
							}
							return acc;
						},
						{} as Record<string, number | boolean>
					)
				};
				return newObject;
			});
			const azsPoints = mappedAzsPoints.filter((marker: Feature) => {
				return Object.values(marker.fuels).some(value => value === true);
			});
			const washingPoints = features.filter((marker: Feature) => marker.types.washing);
			const tirePoints = features.filter((marker: Feature) => marker.types.tire);
			dispatch(
				setCategoryTotals({
					category: 'azs',
					total: azsPoints.length
				})
			);
			dispatch(
				setCategoryTotals({
					category: 'tire',
					total: tirePoints.length
				})
			);
			dispatch(
				setCategoryTotals({
					category: 'washing',
					total: washingPoints.length
				})
			);
			dispatch(
				setCategoryTotals({
					category: 'points',
					total: features.length
				})
			);
			map.events.add('boundschange', () => getVisibleMarkers(map, objectManager));
			getVisibleMarkers(map, objectManager);
			dispatch(setMapLoading(false));
		}
	}, [isLoading, map, features]);

	const filter = useCallback(async () => {
		if (objectManagerState && map) {
			const filteredData = await filterDataByType(selectedFilter, filtersIsOpen);
			if (filteredData) {
				objectManagerState.removeAll();
				objectManagerState.add(filteredData);
				getVisibleMarkers(map, objectManagerState);
			}
		}
	}, [selectedFilter, filtersIsOpen]);

	const filterOptions = useCallback(async () => {
		if (objectManagerState && map) {
			objectManagerState.removeAll();
			const filteredData = await filterDataByOptions(
				filters.fuelFilters,
				filters.features,
				filters.brandTitles,
				[],
				filters.addServices,
				filters.gateHeight,
				filters.terminal
			);

			objectManagerState.add(filteredData);
			getVisibleMarkers(map, objectManagerState);
		}
	}, [
		filters.fuelFilters,
		filters.features,
		filters.brandTitles,
		filters.addServices,
		filters.gateHeight,
		filters.terminal
	]);

	useEffect(() => {
		if (!map || !objectManagerState) return;

		if (selectedFilter !== null || filtersIsOpen) {
			filter();
		}
	}, [filter, map, selectedFilter, filtersIsOpen]);

	const mergeData = (data1: any[][], data2: any[][]) => {
		const data2Map = new Map(data2.map(item => [item[0], { address: item[1], list: item[2] }]));

		return data1.map(item => {
			const id = item[0];
			const extraData = data2Map.get(id) || { address: '', list: [] }; // Подставляем пустые значения, если совпадения нет
			return [...item, extraData.address, extraData.list]; // Добавляем новые данные в конец массива
		});
	};

	useEffect(() => {
		const fetch = async () => {
			const mergedData = mergeData(data.data, terminalsList.data);
			await saveData(createPoints(mergedData));
			const allData = await getAllData();

			setFeatures(allData);
		};
		if (!isLoading && !isLoadingTerminal) {
			fetch();
		}
	}, [isLoading]);

	useEffect(() => {
		if (!objectManagerState) return;

		const hasActiveFilters =
			filters.features.length > 0 ||
			filters.fuelFilters.length > 0 ||
			filters.brandTitles.length > 0 ||
			filters.addServices.length > 0 ||
			filters.gateHeight ||
			filters.terminal.length > 0;

		const applyFilters = async () => {
			if (hasActiveFilters) {
				await filterOptions();
			} else {
				await filter();
			}
		};

		applyFilters();
	}, [
		filters.fuelFilters,
		filters.brandTitles,
		filters.addServices,
		filters.gateHeight,
		filters.features,
		filters.terminal,
		objectManagerState,
		features,
		selectedFilter,
		filtersIsOpen
	]);

	usePoint({ ymaps, map, pointCollection, setPointCollection });
	useRoute({ ymaps, map, setPointCollection, features, objectManagerState });

	useEffect(() => {
		if (map) {
			map.getPanoramaManager().then(manager => {
				manager.events.add('openplayer', () => dispatch(setPanoramaOpen(true)));
				manager.events.add('closeplayer', () => dispatch(setPanoramaOpen(false)));
				if (panorama) {
					manager.enableLookup();
				} else {
					manager.disableLookup();
				}
			});
		}
	}, [panorama, map]);

	useEffect(() => {
		if (map) {
			map.setType(mapType);
		}
	}, [mapType, map]);

	useEffect(() => {
		if (map && !isWheel) {
			map.setZoom(zoom, { checkZoomRange: true });
		}
	}, [map, zoom, isWheel]);

	useEffect(() => {
		if (map && center.length > 0) {
			map.setCenter(center);
			map.setZoom(16);
		}
	}, [center, map]);

	const mapClass = clsx({
		[s.select]: isSelectAddress,
		[s.panorama]: panoramaIsOpen
	});

	return (
		<div>
			{mapLoading ? (
				<div
					style={{
						width: '100vw',
						height: '100vh',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<Loader type='bubble-ping' bgColor='#5dafee' color='#5dafee' size={240} />
				</div>
			) : null}

			<div id='map' className={mapClass} style={{ width: '100vw', height: '100vh' }} />
		</div>
	);
};
