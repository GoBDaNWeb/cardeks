import { useCallback, useEffect, useState } from 'react';
import Loader from 'react-js-loader';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';
import { Map as MapType, ObjectManager } from 'yandex-maps';

import { setSelectedFilter } from '@/widgets/filters';

import { setActiveObject } from '@/entities/object-info';

import { useGetPointsQuery, useGetTerminalsQuery } from '@/shared/api';
import { getQueryParams, useIndexedDB, useTypedSelector } from '@/shared/lib';
import { Feature, IPlacemark } from '@/shared/types';

import { createPoints, getVisibleMarkers, mergeData, usePoint, useRoute } from '../lib';
import {
	handleWheel,
	setCategoryTotals,
	setFixedCenter,
	setIsUrlBuid,
	setMapLoading,
	setPanoramaOpen,
	setZoom
} from '../model';

import s from './map.module.scss';

export const CustomMap = () => {
	const ymaps = window.ymaps;
	const [features, setFeatures] = useState<Feature[]>([]);
	const [map, setMap] = useState<null | MapType>(null);
	const [objectManagerState, setObjectManagerState] = useState<ObjectManager | null>(null);
	const [pointCollection, setPointCollection] = useState<IPlacemark[]>([]);
	const { selectedFilterParam } = getQueryParams();

	const dispatch = useDispatch();
	const { saveData, getAllData, filterDataByType, filterDataByOptions } = useIndexedDB();

	const { data, isLoading } = useGetPointsQuery();
	const { data: terminalsList, isLoading: isLoadingTerminal } = useGetTerminalsQuery();

	const {
		mapInfo: { zoom, isWheel, mapType, panorama, panoramaIsOpen, center, mapLoading },
		routeInfo: { isSelectAddress }
	} = useTypedSelector(state => state.map);

	const { selectedFilter, filtersIsOpen, filters } = useTypedSelector(state => state.filters);

	const init = () => {
		const params = new URLSearchParams(window.location.search);
		const centerParam = params.get('center');
		const centerArray = centerParam?.split('-').map(Number);
		let geolocation = ymaps.geolocation;
		let map = new ymaps.Map('map', {
			center: centerArray ? centerArray : [55.686736, 37.440496],
			zoom
		});

		const objectManager = new ymaps.ObjectManager({
			clusterize: true,
			geoObjectOpenBalloonOnClick: true,
			gridSize: 64,
			clusterOpenBalloonOnClick: true,
			clusterIcons: [
				{
					href: '/images/cluster.svg',
					size: [20, 20],
					offset: [-20, -20]
				}
			],
			clusterIconContentLayout: '',
			clusterIconColor: '#2d9bef'
		});
		setObjectManagerState(objectManager);
		setMap(map);
		map.container.getElement().style.cursor = 'pointer';
		map.controls.remove('searchControl');
		map.controls.remove('geolocationControl');
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
		const GeolocationButtonLayout = ymaps.templateLayoutFactory.createClass(
			'<button class="custom-geolocation-button"></button>',
			{
				build: function () {
					//@ts-ignore
					GeolocationButtonLayout.superclass.build.call(this);
					//@ts-ignore
					this.getElement().addEventListener('click', this.onClick.bind(this));
				},
				onClick: function () {
					//@ts-ignore
					this.events.fire('click');
				},
				clear: function () {
					//@ts-ignore
					this.getElement().removeEventListener('click', this.onClick);
					//@ts-ignore
					GeolocationButtonLayout.superclass.clear.call(this);
				}
			}
		);
		var geolocationButton = new ymaps.control.Button({
			options: {
				layout: GeolocationButtonLayout
			}
		});
		map.controls.add(geolocationButton, {
			float: 'none',
			position: {
				bottom: '118px',
				left: '24px'
			}
		});

		geolocationButton.events.add('click', function () {
			geolocation
				.get({
					provider: 'browser',
					mapStateAutoApply: true
				})
				.then(function (result) {
					//@ts-ignore
					result.geoObjects.options.set('preset', 'islands#redCircleIcon');
					map.geoObjects.add(result.geoObjects);
				});
		});
	};

	const filter = useCallback(async () => {
		if (objectManagerState && map) {
			objectManagerState.removeAll();
			const filteredDataType = await filterDataByType(selectedFilter);
			const hasActiveFilters =
				filters.features.length > 0 ||
				filters.fuelFilters.length > 0 ||
				filters.brandTitles.length > 0 ||
				filters.addServices.length > 0 ||
				filters.gateHeight ||
				filters.terminal.length > 0 ||
				filters.card.length;
			if (hasActiveFilters) {
				const filteredData = await filterDataByOptions(
					filters.fuelFilters,
					filters.features,
					filters.brandTitles,
					[],
					filters.addServices,
					filters.gateHeight,
					filters.terminal,
					filteredDataType,
					filters.card
				);
				objectManagerState.removeAll();
				objectManagerState.add(filteredData);
				getVisibleMarkers(map, objectManagerState, dispatch);
			} else {
				objectManagerState.removeAll();
				objectManagerState.add(filteredDataType);
				getVisibleMarkers(map, objectManagerState, dispatch);
			}
		}
	}, [
		objectManagerState,
		selectedFilter,
		filters.fuelFilters,
		filters.features,
		filters.brandTitles,
		filters.addServices,
		filters.gateHeight,
		filters.terminal,
		filters.card
	]);

	useEffect(() => {
		if (ymaps) {
			ymaps.ready(init);
			if (window.location.search.length > 0) {
				dispatch(setIsUrlBuid(true));
			}
		}
	}, [ymaps]);

	useEffect(() => {
		const applyFilters = async () => {
			await filter();
		};

		if (!isLoading && map && features.length > 0 && objectManagerState) {
			map.geoObjects.add(objectManagerState);
			objectManagerState.add(features);

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
			map.events.add('boundschange', () => getVisibleMarkers(map, objectManagerState, dispatch));
			getVisibleMarkers(map, objectManagerState, dispatch);
			dispatch(setMapLoading(false));

			if (selectedFilterParam !== null) {
				dispatch(setSelectedFilter(+selectedFilterParam));
				setTimeout(() => {
					objectManagerState.removeAll();
					applyFilters();
				}, 0);
			}
		}
	}, [features, objectManagerState]);

	useEffect(() => {
		if (!map || !objectManagerState) return;

		const applyFilters = async () => {
			await filter();
		};

		if (selectedFilter !== null || filtersIsOpen) {
			applyFilters();
		}
	}, [filter, map, selectedFilter]);

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
	}, [isLoading, isLoadingTerminal]);

	useEffect(() => {
		if (!objectManagerState) return;

		const applyFilters = async () => {
			await filter();
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
		filters.card
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
