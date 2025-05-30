import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Loader from 'react-js-loader';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';
import { Map as MapType, ObjectManager } from 'yandex-maps';

import { setSelectedFilter } from '@/widgets/filters';

import { setActiveObject } from '@/entities/object-info';

import { useGetPointsQuery } from '@/shared/api';
import { getPointId, getQueryParams, useIndexedDB, useTypedSelector } from '@/shared/lib';
import { Feature, IPlacemark } from '@/shared/types';

import { createPoints, getVisibleMarkers, usePoint, useRoute } from '../lib';
import {
	handleWheel,
	setCategoryTotals,
	setCurrentCoords,
	setCurrentPointId,
	setFixedCenter,
	setIsUrlBuid,
	setMapLoading,
	setPanoramaOpen,
	setSelectAddress,
	setZoom
} from '../model';

import s from './map.module.scss';

interface MapObject {
	id: string;
	options: {
		iconImageHref: string;
		iconImageSize: [number, number];
		iconImageOffset: [number, number];
	};
	isDisabled?: boolean;
}

interface YandexMapObject {
	id: string;
	options: {
		iconImageHref: string;
		iconImageSize: [number, number];
		iconImageOffset: [number, number];
	};
	isDisabled?: boolean;
}

interface YandexMapEvent {
	get: (key: string) => string;
}

const DEFAULT_CENTER = [55.686736, 37.440496];
const CLUSTER_ICON = {
	href: '/images/cluster.svg',
	size: [35, 35],
	offset: [-35, -35]
};
const SELECTED_ICON_SIZE: [number, number] = [45, 65];
const SELECTED_ICON_OFFSET: [number, number] = [-20, -53];

export const CustomMap = () => {
	const ymaps = window.ymaps;
	let geolocation = window.ymaps.geolocation;

	const [features, setFeatures] = useState<Feature[]>([]);
	const [map, setMap] = useState<null | MapType>(null);
	const [objectManagerState, setObjectManagerState] = useState<ObjectManager | null>(null);
	const [pointCollection, setPointCollection] = useState<IPlacemark[]>([]);
	const { selectedFilterParam } = getQueryParams();
	const previousObjectRef = useRef<MapObject | null>(null);
	const previousOptionsRef = useRef<MapObject['options'] | null>(null);
	const dispatch = useDispatch();
	const { saveData, getAllData, filterDataByOptions } = useIndexedDB();

	const { data, isLoading } = useGetPointsQuery();

	const {
		mapInfo: { zoom, isWheel, mapType, panorama, panoramaIsOpen, center, mapLoading },
		routeInfo: { isSelectAddress, isUrlBuild, buildRoute, getLocation, routeIsBuilding }
	} = useTypedSelector(state => state.map);

	const { selectedFilter, filtersIsOpen, clearFilters, filters } = useTypedSelector(
		state => state.filters
	);
	const { objectId: currentObjectId } = useTypedSelector(state => state.objectInfo);

	const init = useCallback(() => {
		const params = new URLSearchParams(window.location.search);
		const centerParam = params.get('center');
		const centerArray = centerParam?.split('-').map(Number);
		let map = new ymaps.Map('map', {
			center: centerArray ? centerArray : DEFAULT_CENTER,
			zoom
		});

		const objectManager = new ymaps.ObjectManager({
			clusterize: true,
			geoObjectOpenBalloonOnClick: true,
			gridSize: 64,
			clusterOpenBalloonOnClick: true,
			clusterIcons: [CLUSTER_ICON],
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
	}, [ymaps, zoom, dispatch]);

	useEffect(() => {
		if (map && geolocation) {
			const GeolocationButtonLayout = ymaps.templateLayoutFactory.createClass(
				'<button class="custom-geolocation-button" title="Геолокация"></button>',
				{
					build: function () {
						//@ts-ignore
						GeolocationButtonLayout.superclass.build.call(this);
					},
					clear: function () {
						//@ts-ignore
						GeolocationButtonLayout.superclass.clear.call(this);
					}
				}
			);

			const geolocationButton = new ymaps.control.Button({
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

			let currentGeolocationMarker: any = null;

			geolocationButton.events.add('click', function () {
				if ('geolocation' in navigator) {
					// Удаляем предыдущую метку, если она существует
					if (currentGeolocationMarker) {
						map.geoObjects.remove(currentGeolocationMarker);
						currentGeolocationMarker = null;
					}

					navigator.geolocation.getCurrentPosition(
						function (position) {
							const coords = [position.coords.latitude, position.coords.longitude];
							map.setCenter(coords, 14, { checkZoomRange: true });

							// Создаем новую метку и сохраняем ссылку на неё
							currentGeolocationMarker = new ymaps.Placemark(coords, {
								balloonContent: 'Вы здесь'
							});
							map.geoObjects.add(currentGeolocationMarker);
						},
						function (error) {
							console.error('Geolocation error:', error);
							console.error('Error code:', error.code);
							console.error('Error message:', error.message);
							alert('Не удалось определить местоположение: ');
						},
						{
							enableHighAccuracy: true,
							timeout: 5000,
							maximumAge: 0
						}
					);
				} else {
					console.error('Geolocation is not supported');
					alert('Геолокация не поддерживается вашим браузером.');
				}
			});
		}
	}, [map, geolocation]);

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

	const handleObjectClick = useCallback(
		(objectId: string) => {
			if (!objectManagerState) return;

			const targetObject = objectManagerState.objects.getById(objectId) as YandexMapObject;
			if (!targetObject || targetObject.isDisabled) return;

			if (previousObjectRef.current && previousObjectRef.current.id !== objectId) {
				const restoredObject = JSON.parse(JSON.stringify(previousObjectRef.current));
				restoredObject.options = { ...previousOptionsRef.current };

				objectManagerState.remove(previousObjectRef.current);
				setTimeout(() => {
					objectManagerState.add(restoredObject);
				}, 50);
			}

			previousObjectRef.current = JSON.parse(JSON.stringify(targetObject));
			previousOptionsRef.current = { ...targetObject.options };

			const newObject = JSON.parse(JSON.stringify(targetObject));
			newObject.options.iconImageHref = newObject.options.iconImageHref.replace(/(\.png)$/, 'r$1');
			newObject.options.iconImageSize = SELECTED_ICON_SIZE;
			newObject.options.iconImageOffset = SELECTED_ICON_OFFSET;
			newObject.isDisabled = true;

			objectManagerState.remove(targetObject);
			setTimeout(() => {
				objectManagerState.add(newObject);
			}, 50);
		},
		[objectManagerState]
	);

	const filter = useCallback(async () => {
		if (!objectManagerState || !map) return;

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
			selectedFilter,
			filters.relatedProducts
		);

		const azsPoints = filteredData;
		const washingPoints = filteredData.filter((marker: Feature) => marker.types.washing);
		const tirePoints = filteredData.filter((marker: Feature) => marker.types.tire);

		dispatch(setCategoryTotals({ category: 'azs', total: azsPoints.length }));
		dispatch(setCategoryTotals({ category: 'tire', total: tirePoints.length }));
		dispatch(setCategoryTotals({ category: 'washing', total: washingPoints.length }));

		objectManagerState.add(filteredData);
		getVisibleMarkers(map, objectManagerState, dispatch);
	}, [objectManagerState, map, selectedFilter, filters, dispatch]);

	useEffect(() => {
		if (objectManagerState && map) {
			// @ts-ignore - Yandex Maps types are incomplete
			objectManagerState.objects.overlays.events.add('click', function (e: YandexMapEvent) {
				const objectId = e.get('objectId');
				handleObjectClick(objectId);
			});

			if (currentObjectId === null && previousObjectRef.current) {
				const restoredObject = JSON.parse(JSON.stringify(previousObjectRef.current));
				restoredObject.options = { ...previousOptionsRef.current };

				objectManagerState.remove(previousObjectRef.current);
				setTimeout(() => {
					objectManagerState.add(restoredObject);
				}, 50);

				previousObjectRef.current = null;
				previousOptionsRef.current = null;
			}

			if (currentObjectId !== null) {
				const selectedObject = objectManagerState.objects.getById(
					currentObjectId
				) as YandexMapObject;

				if (selectedObject) {
					if (previousObjectRef.current && previousObjectRef.current.id !== currentObjectId) {
						const restoredObject = JSON.parse(JSON.stringify(previousObjectRef.current));
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
					updatedObject.options.iconImageSize = SELECTED_ICON_SIZE;
					updatedObject.options.iconImageOffset = SELECTED_ICON_OFFSET;

					objectManagerState.remove(selectedObject);
					setTimeout(() => {
						objectManagerState.add(updatedObject);
					}, 50);

					previousObjectRef.current = JSON.parse(JSON.stringify(selectedObject));
					previousOptionsRef.current = { ...selectedObject.options };
				}
			}
		}

		return () => {
			if (objectManagerState) {
				// @ts-ignore - Yandex Maps types are incomplete
				objectManagerState.objects.overlays.events.remove('click');
			}
		};
	}, [objectManagerState, map, currentObjectId, handleObjectClick]);

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
				const azsPoints = features;
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

	const mapClass = useMemo(
		() =>
			clsx({
				[s.select]: isSelectAddress,
				[s.panorama]: panoramaIsOpen
			}),
		[isSelectAddress, panoramaIsOpen]
	);

	return (
		<>
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
			{routeIsBuilding ? (
				<div className='route-loader'>
					<div className='route-loader-content'>
						<Loader type='bubble-ping' bgColor='#5dafee' color='#5dafee' size={240} />
						<p>Маршрут загружается</p>
					</div>
				</div>
			) : null}

			<div id='map' className={mapClass} style={{ width: '100%', height: '100%' }} />
		</>
	);
};
