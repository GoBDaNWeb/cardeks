// import { useEffect, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import clsx from 'clsx';
// import points from '@/shared/config/points.json';
// import { useTypedSelector } from '@/shared/lib';
// import { usePoint, useRoute } from '../lib';
// import { handleWheel, setPanoramaOpen, setZoom } from '../model';
// import s from './map.module.scss';
// export const Map = () => {
// 	const [map, setMap] = useState(null);
// 	const [pointCollection, setPointCollection] = useState([]);
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
// 	// ининтим карту
// 	useEffect(() => {
// 		ymaps.ready(init);
// 	}, []);
// 	// хук который отвечает за маркеры на карте
// 	usePoint({ ymaps, map, pointCollection, setPointCollection });
// 	// хук который отвечает за построение маршрута
// 	useRoute({ ymaps, map, setPointCollection });
// 	// хук отвечающий за панораму
// 	useEffect(() => {
// 		if (map) {
// 			map.getPanoramaManager().then(function (manager) {
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
// 	// изменение типа карты
// 	useEffect(() => {
// 		if (map) {
// 			map.setType(mapType);
// 		}
// 	}, [mapType]);
// 	// изменения зума карты
// 	useEffect(() => {
// 		if (map && !isWheel) {
// 			map.setZoom(zoom, { checkZoomRange: true });
// 		}
// 	}, [map, zoom, isWheel]);
// 	const mapClass = clsx({ [s.select]: isSelectAddress, [s.panorama]: panoramaIsOpen });
// 	return <div id='map' className={mapClass} style={{ width: '100vw', height: '100vh' }} />;
// };
import { useMemo } from 'react';

import type { YMapLocationRequest } from 'ymaps3';

import points from '@/shared/config/points.json';
import {
	YMap,
	YMapClusterer,
	YMapDefaultFeaturesLayer,
	YMapDefaultMarker,
	YMapDefaultSchemeLayer,
	YMapMarker,
	clusterByGrid,
	reactify
} from '@/shared/lib';

import type { Feature } from '@yandex/ymaps3-clusterer';
import type { LngLat, LngLatBounds } from '@yandex/ymaps3-types';

const LOCATION: YMapLocationRequest = {
	center: [37.588144, 55.733842],
	zoom: 9
};

export const Map = () => {
	const seed = (s: number) => () => {
		s = Math.sin(s) * 10000;
		return s - Math.floor(s);
	};

	const rnd = seed(10000); // () => Math.random()

	// Generating random coordinates of a point [lng, lat] in a given boundary
	const getRandomPointCoordinates = (bounds: LngLatBounds): LngLat => [
		bounds[0][0] + (bounds[1][0] - bounds[0][0]) * rnd(),
		bounds[1][1] + (bounds[0][1] - bounds[1][1]) * rnd()
	];

	// A function that creates an array with parameters for each clusterer random point
	const getRandomPoints = (count: number, bounds: LngLatBounds): Feature[] => {
		return Array.from({ length: count }, (_, index) => ({
			type: 'Feature',
			id: index.toString(),
			geometry: { type: 'Point', coordinates: getRandomPointCoordinates(bounds) }
		}));
	};

	//@ts-ignore
	const gridSizedMethod = useMemo(() => clusterByGrid({ gridSize: 64 }), []);
	console.log('gridSizedMethod', gridSizedMethod);
	const marker = (feature: Feature) => (
		<YMapDefaultMarker
			//@ts-ignore
			iconName='landmark'
			key={feature.id}
			coordinates={feature.geometry.coordinates}
		/>
	);
	const cluster = (coordinates: LngLat, features: Feature[]) => {
		console.log(coordinates);
		console.log('features', features);
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

	console.log('cluster', cluster);
	return (
		<div id='map' style={{ width: '100vw', height: '100vh' }}>
			<YMap location={reactify.useDefault(LOCATION)}>
				<YMapDefaultSchemeLayer />
				<YMapDefaultFeaturesLayer />
				<YMapMarker coordinates={reactify.useDefault([37.588144, 55.733842])}></YMapMarker>
				<YMapClusterer
					marker={marker}
					cluster={cluster}
					method={gridSizedMethod}
					features={getRandomPoints(100, [
						[30.2729, 59.9558],
						[30.4179, 59.9212]
					])}
				/>
			</YMap>
		</div>
	);
};
