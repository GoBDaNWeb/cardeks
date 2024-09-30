import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import clsx from 'clsx';

import points from '@/shared/config/points.json';

import { usePoint, useRoute } from '../lib';
import { handleWheel, setZoom } from '../model';

import s from './map.module.scss';

export const Map = () => {
	const [map, setMap] = useState(null);
	const [pointCollection, setPointCollection] = useState([]);

	const dispatch = useDispatch();
	const {
		mapInfo: { zoom, isWheel, mapType },
		routeInfo: { isSelectAddress }
	} = useSelector(state => state.map);

	const ymaps = window.ymaps;

	const init = () => {
		let map = new ymaps.Map('map', {
			center: [55.686736, 37.440496],
			zoom
		});
		const objectManager = new ymaps.ObjectManager({
			clusterize: true,
			geoObjectOpenBalloonOnClick: false,
			clusterOpenBalloonOnClick: false
		});

		map.geoObjects.add(objectManager);
		objectManager.add(points);

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

	// ининтим карту
	useEffect(() => {
		ymaps.ready(init);
	}, []);

	// хук который отвечает за маркеры на карте
	usePoint({ ymaps, map, pointCollection, setPointCollection });

	// хук который отвечает за построение маршрута
	useRoute({ ymaps, map, setPointCollection });

	// изменение типа карты
	useEffect(() => {
		if (map) {
			map.setType(mapType);
		}
	}, [mapType]);

	// изменения зума карты
	useEffect(() => {
		if (map && !isWheel) {
			map.setZoom(zoom, { checkZoomRange: true });
		}
	}, [map, zoom, isWheel]);

	const mapClass = clsx({ [s.select]: isSelectAddress });

	return <div id='map' className={mapClass} style={{ width: '100vw', height: '100vh' }} />;
};
