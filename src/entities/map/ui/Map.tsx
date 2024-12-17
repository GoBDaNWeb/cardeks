import { useCallback, useEffect, useMemo, useState } from 'react';
import Loader from 'react-js-loader';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';
import { Map as MapType, ObjectManager } from 'yandex-maps';

import { useGetPointsQuery } from '@/shared/api';
import { useIndexedDB, useTypedSelector } from '@/shared/lib';
import { Feature, IPlacemark } from '@/shared/types';

import { createPoints, filterAzs, filterFeatures, usePoint, useRoute } from '../lib';
import {
	handleWheel,
	setIsUrlBuid,
	setMapLoading,
	setPanoramaOpen,
	setPoints,
	setTotalAzs,
	setTotalPoints,
	setTotalTire,
	setTotalViewAzs,
	setTotalViewPoints,
	setTotalViewTire,
	setTotalViewWashing,
	setTotalWashing,
	setZoom
} from '../model';

import s from './map.module.scss';

export const Map = () => {
	const ymaps = window.ymaps;
	const [features, setFeatures] = useState<Feature[]>([]);
	const [map, setMap] = useState<null | MapType>(null);
	const [objectManagerState, setObjectManagerState] = useState<ObjectManager | null>(null);
	const [pointCollection, setPointCollection] = useState<IPlacemark[]>([]);
	const dispatch = useDispatch();
	const { saveData, getAllData, filterDataByOptions, filterDataByType } = useIndexedDB();
	//@ts-ignore
	const { data, isLoading } = useGetPointsQuery();

	const {
		mapInfo: { zoom, isWheel, mapType, panorama, panoramaIsOpen, center, mapLoading },
		routeInfo: { isSelectAddress }
	} = useTypedSelector(state => state.map);

	const { selectedFilter, filtersIsOpen, filters } = useTypedSelector(state => state.filters);

	const azsArr = useMemo(() => {
		return data?.data ? createPoints(data.data) : [];
	}, [data?.data]);

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
			const visibleWashingPoints = visibleMarkers.filter(
				(marker: Feature) => marker.options.washing
			);
			const visibleTirePoints = visibleMarkers.filter((marker: Feature) => marker.options.tire);
			dispatch(setTotalViewTire(visibleTirePoints.length));
			dispatch(setTotalViewWashing(visibleWashingPoints.length));
			dispatch(setTotalViewPoints(visibleMarkers.length));
			dispatch(setTotalViewAzs(visibleMarkers.length));
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
		map.events.add('boundschange', () => {
			dispatch(setZoom(map.getZoom()));
			dispatch(handleWheel(true));
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
					options: Object.keys(marker.options).reduce(
						(acc, key) => {
							if (key !== 'washing' && key !== 'tire') {
								acc[key] = marker.options[key];
							}
							return acc;
						},
						{} as Record<string, number | boolean>
					)
				};
				return newObject;
			});
			const azsPoints = mappedAzsPoints.filter((marker: Feature) => {
				return Object.values(marker.options).some(value => value === true);
			});
			const washingPoints = features.filter((marker: Feature) => marker.options.washing);
			const tirePoints = features.filter((marker: Feature) => marker.options.tire);
			dispatch(setTotalPoints(features.length));
			dispatch(setTotalWashing(washingPoints.length));
			dispatch(setTotalTire(tirePoints.length));
			dispatch(setTotalAzs(azsPoints.length));
			map.events.add('boundschange', () => getVisibleMarkers(map, objectManager));
			getVisibleMarkers(map, objectManager);
			dispatch(setMapLoading(false));
		}
	}, [isLoading, map, features]);
	const filter = useCallback(async () => {
		if (objectManagerState && map) {
			objectManagerState.removeAll();
			const filteredData = await filterDataByType(selectedFilter, filtersIsOpen);
			getVisibleMarkers(map, objectManagerState);
			objectManagerState.add(filteredData);
		}
	}, [selectedFilter, filtersIsOpen]);

	useEffect(() => {
		if (map && objectManagerState) {
			filter();
		}
	}, [filter, map]);

	useEffect(() => {
		const fetch = async () => {
			await saveData(createPoints(data.data));
			const allData = await getAllData();
			setFeatures(allData);
		};
		if (!isLoading) {
			fetch();
		}
	}, [isLoading]);

	useEffect(() => {
		if (!objectManagerState) return;

		const hasActiveFilters =
			filters.fuelFilters.length > 0 ||
			filters.brandTitle ||
			filters.addServices.length > 0 ||
			filters.gateHeight;

		if (hasActiveFilters) {
			objectManagerState.removeAll();
			const filteredPoints = filterFeatures(
				azsArr,
				filters.fuelFilters,
				filters.brandTitle,
				[],
				filters.addServices,
				filters.gateHeight
			);
			objectManagerState.add(filteredPoints);
		} else {
			filter();
		}
	}, [
		filters.fuelFilters,
		filters.brandTitle,
		filters.addServices,
		filters.gateHeight,
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
