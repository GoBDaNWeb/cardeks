import { useCallback, useEffect, useRef, useState } from 'react';
import Loader from 'react-js-loader';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';
import { Map as MapType, ObjectManager } from 'yandex-maps';

import { setSelectedFilter } from '@/widgets/filters';

import { setActiveObject } from '@/entities/object-info';

import { useGetPointsQuery, useGetTerminalsQuery } from '@/shared/api';
import { getPointId, getQueryParams, useIndexedDB, useTypedSelector } from '@/shared/lib';
import { Feature, IPlacemark } from '@/shared/types';

import { createPoints, getVisibleMarkers, mergeData, usePoint, useRoute } from '../lib';
import {
	handleWheel,
	setCategoryTotals,
	setCoords,
	setCurrentCoords,
	setCurrentPointId,
	setFixedCenter,
	setIsUrlBuid,
	setMapLoading,
	setPanoramaOpen,
	setSearch,
	setSelectAddress,
	setZoom
} from '../model';

import s from './map.module.scss';

export const CustomMap = () => {
	const ymaps = window.ymaps;
	let geolocation = window.ymaps.geolocation;

	const [features, setFeatures] = useState<Feature[]>([]);
	const [map, setMap] = useState<null | MapType>(null);
	const [objectManagerState, setObjectManagerState] = useState<ObjectManager | null>(null);
	const [pointCollection, setPointCollection] = useState<IPlacemark[]>([]);
	const { selectedFilterParam } = getQueryParams();
	const previousObjectRef = useRef(null);
	const previousOptionsRef = useRef(null);
	const dispatch = useDispatch();
	const { saveData, getAllData, filterDataByOptions } = useIndexedDB();

	const { data, isLoading } = useGetPointsQuery();
	const { data: terminalsList, isLoading: isLoadingTerminal } = useGetTerminalsQuery();

	const {
		mapInfo: { zoom, isWheel, mapType, panorama, panoramaIsOpen, center, mapLoading },
		routeInfo: { isSelectAddress, isUrlBuild, buildRoute, getLocation }
	} = useTypedSelector(state => state.map);

	const { selectedFilter, filtersIsOpen, clearFilters, filters } = useTypedSelector(
		state => state.filters
	);
	const { objectId: currenctObjectId } = useTypedSelector(state => state.objectInfo);

	const init = () => {
		const params = new URLSearchParams(window.location.search);
		const centerParam = params.get('center');
		const centerArray = centerParam?.split('-').map(Number);
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
		map.controls.remove('fullscreenControl');
		map.controls.remove('typeSelector');
		map.controls.remove('rulerControl');
		map.controls.remove('zoomControl');
		map.controls.remove('expandControl');
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
				bottom: '104px',
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

	useEffect(() => {
		if (getLocation) {
			geolocation
				.get({
					provider: 'browser',
					mapStateAutoApply: true
				})
				.then(function (result) {
					dispatch(setSelectAddress(true));
					dispatch(setCurrentPointId(getPointId(0)));
					//@ts-ignore
					dispatch(setCurrentCoords([result.geoObjects.position]));
				})
				.catch(e => {
					console.log(e);
				});
		}
	}, [getLocation]);

	const filter = useCallback(async () => {
		if (objectManagerState && map) {
			objectManagerState.removeAll();

			const filteredData = await filterDataByOptions(
				filters.fuelFilters,
				filters.features,
				filters.brandTitles,
				[],
				filters.addServices,
				filters.gateHeight,
				filters.terminal,
				filters.card,
				selectedFilter
			);
			const azsPoints = filteredData.filter((marker: Feature) => {
				return Object.values(marker.fuels).some(value => value === true);
			});
			const washingPoints = filteredData.filter((marker: Feature) => marker.types.washing);
			const tirePoints = filteredData.filter((marker: Feature) => marker.types.tire);
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
			objectManagerState.removeAll();
			objectManagerState.add(filteredData);
			getVisibleMarkers(map, objectManagerState, dispatch);
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
		if (objectManagerState && map) {
			//@ts-ignore
			objectManagerState.objects.overlays.events.add('click', function (e) {
				const objectId = e.get('objectId');
				const targetObject = objectManagerState.objects.getById(objectId);

				if (!targetObject) return;
				//@ts-ignore
				if (targetObject.isDisabled) return;
				//@ts-ignore
				if (previousObjectRef.current && previousObjectRef.current.id !== objectId) {
					const restoredObject = JSON.parse(JSON.stringify(previousObjectRef.current));
					//@ts-ignore
					restoredObject.options = { ...previousOptionsRef.current };

					objectManagerState.remove(previousObjectRef.current);
					setTimeout(() => {
						objectManagerState.add(restoredObject);
					}, 50);
				}

				previousObjectRef.current = JSON.parse(JSON.stringify(targetObject));
				//@ts-ignore
				previousOptionsRef.current = { ...targetObject.options };

				const newObject = JSON.parse(JSON.stringify(targetObject));
				newObject.options.iconImageHref = newObject.options.iconImageHref.replace(
					/(\.png)$/,
					'r$1'
				);
				newObject.options.iconImageSize = [45, 65];
				newObject.options.iconImageOffset = [-20, -53];
				newObject.isDisabled = true;

				objectManagerState.remove(targetObject);
				setTimeout(() => {
					objectManagerState.add(newObject);
				}, 50);
			});
			if (currenctObjectId === null && previousObjectRef.current) {
				const restoredObject = JSON.parse(JSON.stringify(previousObjectRef.current));
				//@ts-ignore
				restoredObject.options = { ...previousOptionsRef.current };

				objectManagerState.remove(previousObjectRef.current);
				setTimeout(() => {
					objectManagerState.add(restoredObject);
				}, 50);

				previousObjectRef.current = null;
				previousOptionsRef.current = null;
			}

			if (currenctObjectId !== null) {
				const selectedObject = objectManagerState.objects.getById(currenctObjectId);

				if (selectedObject) {
					if (previousObjectRef.current && previousObjectRef.current.id !== currenctObjectId) {
						const restoredObject = JSON.parse(JSON.stringify(previousObjectRef.current));
						//@ts-ignore
						restoredObject.options = { ...previousOptionsRef.current };

						objectManagerState.remove(previousObjectRef.current);
						setTimeout(() => {
							objectManagerState.add(restoredObject);
						}, 50);
					}

					const updatedObject = JSON.parse(JSON.stringify(selectedObject));
					updatedObject.options.iconImageHref = updatedObject.options.iconImageHref.replace(
						/(\.png)$/,
						'r$1'
					);
					updatedObject.options.iconImageSize = [45, 65];
					updatedObject.options.iconImageOffset = [-20, -53];

					objectManagerState.remove(selectedObject);
					setTimeout(() => {
						objectManagerState.add(updatedObject);
					}, 50);

					previousObjectRef.current = JSON.parse(JSON.stringify(selectedObject));
					//@ts-ignore
					previousOptionsRef.current = { ...selectedObject.options };
				}
			}
		}

		return () => {
			if (objectManagerState) {
				//@ts-ignore
				objectManagerState.objects.overlays.events.remove('click');
			}
		};
	}, [objectManagerState, map, currenctObjectId]);

	useEffect(() => {
		if (ymaps) {
			ymaps.ready(init);
			if (window.location.search.includes('routes')) {
				dispatch(setIsUrlBuid(true));
			}
		}
	}, [ymaps]);

	useEffect(() => {
		const applyFilters = async () => {
			await filter();
		};

		if (!isLoading && map && features.length > 0 && objectManagerState) {
			objectManagerState.add(features);

			map.geoObjects.add(objectManagerState);

			dispatch(setMapLoading(false));

			if (!isUrlBuild && !buildRoute) {
				const azsPoints = features.filter((marker: Feature) => {
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

				if (selectedFilterParam !== null) {
					dispatch(setSelectedFilter(+selectedFilterParam));
					setTimeout(() => {
						objectManagerState.removeAll();
						applyFilters();
					}, 0);
				}
			}
		}
	}, [features, objectManagerState, isUrlBuild, buildRoute]);

	useEffect(() => {
		if (!map || !objectManagerState) return;

		const applyFilters = async () => {
			await filter();
		};

		if ((selectedFilter !== null || filtersIsOpen) && !isUrlBuild && !buildRoute) {
			applyFilters();
		}
	}, [filter, map, selectedFilter, isUrlBuild]);

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
		if (clearFilters) {
			applyFilters();
		}
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
		filters.card,
		clearFilters
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
