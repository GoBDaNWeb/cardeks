import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { enLetter } from '@/shared/config';
import { getPointId } from '@/shared/lib';

import { setAddress, setCoords, setSelectAddress } from '../../model';
import { containsArray, createPlacemark } from '../helpers';

export const usePoint = ({ ymaps, map, pointCollection, setPointCollection }) => {
	const [searchPoint, setSearchPoint] = useState(null);

	const currentPointIdRef = useRef(null);
	const dispatch = useDispatch();

	const {
		searchInfo: { search, searchValue, buildSearch },
		routeInfo: {
			isSelectAddress,
			currentPointId,
			routeCoords,
			swapPoints,
			deletePointId,
			selectedAddress
		}
	} = useSelector(state => state.map);

	const { activeMenu } = useSelector(state => state.menu);
	const { isSuccess } = useSelector(state => state.newRouteModal);

	const getAddress = coords => {
		ymaps.geocode(coords).then(function (res) {
			const firstGeoObject = res.geoObjects.get(0);
			const address = firstGeoObject.getAddressLine();
			dispatch(setAddress(address));
			// dispatch(setCoords(coords));
		});
	};

	const handleSelectCoords = e => {
		dispatch(setSelectAddress(false));
		const coords = e.get('coords');
		getAddress(coords);
	};

	const changePointImage = (point, index, newImageUrl) => {
		point.properties.set('id', getPointId(index));
		point.properties.set('balloonContent', `index:  ${index}`);
		point.options.set({
			iconImageHref: newImageUrl,
			iconImageSize: [30, 34],
			iconImageOffset: [-16, -38]
		});
	};

	const addPoint = coords => {
		const pointId = currentPointIdRef.current;
		const existingMarker = pointCollection.find(function (marker) {
			return marker.properties.get('id') === pointId;
		});

		if (existingMarker) {
			const currentCoords = routeCoords.slice();
			const newCoords = containsArray(
				currentCoords,
				existingMarker.geometry.getCoordinates(),
				coords
			);
			dispatch(setCoords(newCoords));
			existingMarker.geometry.setCoordinates(coords);
		} else {
			const pointIndex = pointId.split('.')[1];
			var myPlacemark = createPlacemark({ ymaps, coords, pointId, pointIndex });

			dispatch(setCoords([...routeCoords, coords]));

			map.geoObjects.add(myPlacemark);
			setPointCollection(prevCollection => [...prevCollection, myPlacemark]);
		}
	};

	const handleAddPoint = e => {
		if (e) {
			const coords = e.get('coords');
			addPoint(coords);
		} else {
			ymaps.geocode(selectedAddress).then(res => {
				const firstGeoObject = res.geoObjects.get(0);
				const coords = firstGeoObject.geometry.getCoordinates();
				addPoint(coords);
			});
		}
	};

	const handleRemovePoint = id => {
		const deletedPoint = pointCollection.find(point => {
			return point.properties.get('id') === id;
		});
		const filteredPointCollection = pointCollection.filter(point => {
			return point.properties.get('id') !== id;
		});

		if (deletedPoint) {
			const filteredCoords = routeCoords.filter(coord => {
				return coord !== deletedPoint.geometry.getCoordinates();
			});
			filteredPointCollection.forEach((point, index) => {
				changePointImage(
					point,
					index,
					`/images/points/point${enLetter.split('')[index].toUpperCase()}.png`
				);
			});
			dispatch(setCoords(filteredCoords));
			map.geoObjects.remove(deletedPoint);
			setPointCollection(filteredPointCollection);
		}
	};

	const handleClearPoints = () => {
		if (map) {
			pointCollection.forEach(marker => {
				map.geoObjects.remove(marker);
			});
			setPointCollection([]);
		}
	};

	useEffect(() => {
		currentPointIdRef.current = currentPointId;
	}, [currentPointId]);

	useEffect(() => {
		if (buildSearch) {
			handleAddPoint();
		}
	}, [buildSearch]);

	useEffect(() => {
		if (map) {
			if (search) {
				map.geoObjects.remove(searchPoint);
				ymaps
					.geocode(searchValue, {
						results: 1
					})
					.then(function (res) {
						var firstGeoObject = res.geoObjects.get(0);
						var coords = firstGeoObject.geometry.getCoordinates();
						var myPlacemark = new ymaps.Placemark(coords, {
							hintContent: searchValue,
							balloonContent: searchValue
						});

						map.geoObjects.add(myPlacemark);
						setSearchPoint(myPlacemark);

						map.setCenter(coords, 15);
					});
			}
		}
	}, [search]);

	// меняем точки на карте местами
	useEffect(() => {
		if (
			pointCollection.length > 0 &&
			pointCollection[swapPoints[1]] &&
			pointCollection[swapPoints[0]]
		) {
			let tempCoordsArray = routeCoords.slice();
			const firstPointCoords = pointCollection[swapPoints[0]].geometry.getCoordinates();
			const secondPointCoords = pointCollection[swapPoints[1]].geometry.getCoordinates();
			pointCollection[swapPoints[0]].geometry.setCoordinates(secondPointCoords);
			pointCollection[swapPoints[1]].geometry.setCoordinates(firstPointCoords);

			[tempCoordsArray[swapPoints[0]], tempCoordsArray[swapPoints[1]]] = [
				tempCoordsArray[swapPoints[1]],
				tempCoordsArray[swapPoints[0]]
			];
			dispatch(setCoords(tempCoordsArray));
		}
	}, [swapPoints]);

	// удаление точки маршрута с карты
	useEffect(() => {
		if (deletePointId) {
			handleRemovePoint(deletePointId);
		}
	}, [deletePointId]);

	// отслеживание добавления точек на карту и координат
	useEffect(() => {
		if (map) {
			let cursor = map.cursors.push('arrow');

			if (isSelectAddress && currentPointId) {
				cursor.setKey('crosshair');
				map.events.group().events.types.click = undefined;
				map.events.group().add('click', e => handleSelectCoords(e));
				map.events.group().add('click', e => handleAddPoint(e));
			} else {
				cursor.setKey('grab');

				map.events.remove('click');
				map.events.group().events.types.click = undefined;
			}
		}
	}, [isSelectAddress, currentPointId]);

	// удаление точек маршрута при закрытии окна построения маршрута
	useEffect(() => {
		if (activeMenu !== 'route') {
			handleClearPoints();
		}
	}, [activeMenu]);

	// удаление точек при выборе нового маршрута
	useEffect(() => {
		if (isSuccess) {
			handleClearPoints();
		}
	}, [isSuccess]);
};
