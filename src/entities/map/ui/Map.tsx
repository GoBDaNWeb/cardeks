// import { useEffect, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import clsx from 'clsx';
// import { Map as MapType } from 'yandex-maps';
// import points from '@/shared/config/points.json';
// import { useTypedSelector } from '@/shared/lib';
// import { IPlacemark } from '@/shared/types';
// import { usePoint, useRoute } from '../lib';
// import { handleWheel, setPanoramaOpen, setZoom } from '../model';
// import s from './map.module.scss';
// export const Map = () => {
// 	const [map, setMap] = useState<null | MapType>(null);
// 	const [pointCollection, setPointCollection] = useState<IPlacemark[]>([]);
// 	const dispatch = useDispatch();
// 	const {
// 		mapInfo: { zoom, isWheel, mapType, panorama, panoramaIsOpen },
// 		routeInfo: { isSelectAddress }
// 	} = useTypedSelector(state => state.map);
// 	const ymaps = window.ymaps;
// 	const init = () => {
// 		let map = new ymaps.Map('map', {
// 			center: [55.686736, 37.440496],
// 			zoom
// 		});
// 		const objectManager = new ymaps.ObjectManager({
// 			clusterize: true,
// 			geoObjectOpenBalloonOnClick: false,
// 			clusterOpenBalloonOnClick: false
// 		});
// 		map.geoObjects.add(objectManager);
// 		objectManager.add(points);
// 		setMap(map);
// 		map.container.getElement().style.cursor = 'pointer';
// 		map.controls.remove('searchControl');
// 		map.controls.remove('trafficControl');
// 		map.controls.remove('typeSelector');
// 		map.controls.remove('rulerControl');
// 		map.controls.remove('zoomControl');
// 		map.controls.add('rulerControl', {
// 			float: 'none',
// 			position: {
// 				top: '80px',
// 				left: '73px'
// 			}
// 		});
// 		map.events.add('boundschange', () => {
// 			dispatch(setZoom(map.getZoom()));
// 			dispatch(handleWheel(true));
// 		});
// 	};
// 	useEffect(() => {
// 		ymaps.ready(init);
// 	}, []);
// 	usePoint({ ymaps, map, pointCollection, setPointCollection });
// 	useRoute({ ymaps, map, setPointCollection });
// 	useEffect(() => {
// 		if (map) {
// 			map.getPanoramaManager().then(manager => {
// 				manager.events.add('openplayer', () => {
// 					dispatch(setPanoramaOpen(true));
// 				});
// 				manager.events.add('closeplayer', () => {
// 					dispatch(setPanoramaOpen(false));
// 				});
// 				if (panorama) {
// 					manager.enableLookup();
// 				} else {
// 					manager.disableLookup();
// 				}
// 			});
// 		}
// 	}, [panorama]);
// 	useEffect(() => {
// 		if (map) {
// 			map.setType(mapType);
// 		}
// 	}, [mapType]);
// 	useEffect(() => {
// 		if (map && !isWheel) {
// 			map.setZoom(zoom, { checkZoomRange: true });
// 		}
// 	}, [map, zoom, isWheel]);
// 	const mapClass = clsx({
// 		[s.select]: isSelectAddress,
// 		[s.panorama]: panoramaIsOpen
// 	});
// 	return <div id='map' className={mapClass} style={{ width: '100vw', height: '100vh' }} />;
// };
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { YMapCollection, type YMapLocationRequest } from 'ymaps3';

import { enLetter } from '@/shared/config';
import points from '@/shared/config/points.json';
import {
	YMap,
	YMapClusterer,
	YMapControls,
	YMapDefaultFeaturesLayer,
	YMapDefaultMarker,
	YMapDefaultSchemeLayer,
	YMapListener,
	YMapMarker,
	YMapZoomControl,
	clusterByGrid,
	reactify
} from '@/shared/lib';
import { getPointId, useTypedSelector } from '@/shared/lib';

import { containsArray, getPointInfo, swapItems } from '../lib';
import { setAddress, setCoords, setSelectAddress } from '../model';

import type { Feature } from '@yandex/ymaps3-clusterer';
import type { LngLat, LngLatBounds } from '@yandex/ymaps3-types';

const LOCATION: YMapLocationRequest = {
	center: [37.588144, 55.733842],
	zoom: 9
};
type MarkerType = {
	coord: LngLat;
	id: string;
	index: number | string;
};
export const Map = () => {
	const map = useRef(null);
	console.log(map);
	const [markersList, setMarkersList] = useState<MarkerType[]>([]);
	const {
		routeInfo: {
			isSelectAddress,
			routeCoords,
			swapPoints,
			fieldsCount,
			currentPointId,
			deletePointId
		}
	} = useTypedSelector(state => state.map);
	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);
	const { activeMenu } = useTypedSelector(state => state.menu);
	const dispatch = useDispatch();

	// тест для кластеризации
	const seed = (s: number) => () => {
		s = Math.sin(s) * 10000;
		return s - Math.floor(s);
	};
	const rnd = seed(10000); // () => Math.random()
	const getRandomPointCoordinates = (bounds: LngLatBounds): LngLat => [
		bounds[0][0] + (bounds[1][0] - bounds[0][0]) * rnd(),
		bounds[1][1] + (bounds[0][1] - bounds[1][1]) * rnd()
	];
	const getRandomPoints = (count: number, bounds: LngLatBounds): Feature[] => {
		return Array.from({ length: count }, (_, index) => ({
			type: 'Feature',
			id: index.toString(),
			geometry: { type: 'Point', coordinates: getRandomPointCoordinates(bounds) }
		}));
	};

	//@ts-ignore
	const gridSizedMethod = useMemo(() => clusterByGrid({ gridSize: 64 }), []);

	const defaultMarker = (feature: Feature) => (
		<YMapDefaultMarker
			//@ts-ignore
			iconName='landmark'
			key={feature.id}
			coordinates={feature.geometry.coordinates}
		/>
	);
	const cluster = (coordinates: LngLat, features: Feature[]) => {
		return (
			<YMapMarker key={`${features[0].id}-${features.length}`} coordinates={coordinates}>
				<div className='circle'>
					<div className='circle-content'>
						<span className='circle-text'>{features.length}</span>
					</div>
				</div>
			</YMapMarker>
		);
	};

	const handleSetCoords = async (e: any) => {
		const existingMarker = markersList.find((point: MarkerType) => {
			return point.id === currentPointId;
		});
		const { coordinates } = e;

		if (isSelectAddress) {
			if (existingMarker) {
				const currentCoords = routeCoords.slice();
				//@ts-ignore
				const newCoords = containsArray(currentCoords, existingMarker.coord, coordinates);
				dispatch(setCoords(newCoords));
			} else {
				const text = await ymaps3.search({
					text: coordinates
				});
				dispatch(setAddress(`${text[0].properties.description} ${text[0].properties.name}`));
				dispatch(setCoords([...routeCoords, coordinates]));
				dispatch(setSelectAddress(false));
				const markerObj = {
					coord: coordinates,
					id: currentPointId,
					index: +currentPointId.split('.')[1]
				};
				setMarkersList(prevMarkersList => {
					const newMarkersList = [...prevMarkersList, markerObj];
					return newMarkersList;
				});
			}
		}
	};

	const handleRemovePoint = (id: string) => {
		const indexToRemove = markersList.findIndex(point => point.id === id);
		if (indexToRemove !== -1) {
			const newMarkersList = markersList.filter((_, index) => index !== indexToRemove);
			const newRouteCoords = routeCoords.filter(
				(_: number[], index: number) => index !== indexToRemove
			);

			newMarkersList.forEach((point, index) => {
				point.id = getPointId(index);
				point.index = index;
				point.coord = newRouteCoords[index];
			});
			// Обновляем состояние
			dispatch(setCoords(newRouteCoords));
			setMarkersList(newMarkersList);
		} else {
			markersList.forEach((point, index) => {
				point.id = getPointId(index);
				point.index = index;
			});
			setMarkersList(markersList);
		}
	};

	function swapItemsExceptCoord(array: MarkerType[]) {
		return array.map((item, index) => {
			const newItem = { ...item };
			newItem.id = array[1 - index].id;
			newItem.index = array[1 - index].index;
			return newItem;
		});
	}

	useEffect(() => {
		if (fieldsCount === markersList.length) {
			let tempCoordsArray = routeCoords.slice();

			const newArr = swapItemsExceptCoord(markersList);
			swapItems(tempCoordsArray, swapPoints);
			dispatch(setCoords(tempCoordsArray));
			setMarkersList(newArr);
		} else {
			const updatedMarkersList = markersList.map(point => {
				if (point.index == swapPoints[0]) {
					return {
						...point,
						index: swapPoints[0] + 1,
						id: getPointId(swapPoints[0] + 1)
					};
				} else if (point.index == swapPoints[1]) {
					return {
						...point,
						index: swapPoints[0],
						id: getPointId(swapPoints[0])
					};
				}
				return point;
			});

			setMarkersList(updatedMarkersList);
		}
	}, [swapPoints]);
	useEffect(() => {
		if (deletePointId) {
			handleRemovePoint(deletePointId);
		}
	}, [deletePointId]);

	useEffect(() => {
		if (activeMenu !== 'route' || mobileActiveMenu !== 'route') {
			setMarkersList([]);
		}
	}, [activeMenu, mobileActiveMenu]);
	return (
		<div id='map' style={{ width: '100vw', height: '100vh' }}>
			<YMap location={reactify.useDefault(LOCATION)} ref={map}>
				<YMapDefaultSchemeLayer />
				<YMapDefaultFeaturesLayer />

				{markersList.map((marker: MarkerType) => {
					return (
						<>
							{marker ? (
								<YMapMarker key={marker.id} coordinates={marker.coord}>
									<div className='marker-container'>
										<img
											src={`/images/points/point${enLetter[+marker.index].toUpperCase()}.png`}
											alt=''
										/>
									</div>
								</YMapMarker>
							) : null}
						</>
					);
				})}
				<YMapControls position='left'>
					<YMapZoomControl />
				</YMapControls>
				<YMapClusterer
					marker={defaultMarker}
					cluster={cluster}
					method={gridSizedMethod}
					features={getRandomPoints(100, [
						[37.11397532421875, 56.053325765098705],
						[38.218968401504604, 55.40243827841449]
					])}
				/>
				<YMapListener onFastClick={(_, e) => handleSetCoords(e)} />
			</YMap>
		</div>
	);
};
