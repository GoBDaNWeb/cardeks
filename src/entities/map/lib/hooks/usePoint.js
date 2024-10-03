import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getPointId } from '@/shared/lib';

import { setAddress, setCoords, setSelectAddress } from '../../model';
import { containsArray, createPlacemark, getImage, getPointInfo, swapItems } from '../helpers';

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
			selectedAddress,
			fieldsCount
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
		const existingMarker = pointCollection.find(point => {
			return getPointInfo(point, 'id') === pointId;
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
			return getPointInfo(point, 'id') === id;
		});
		const filteredPointCollection = pointCollection.filter(point => {
			return getPointInfo(point, 'id') !== id;
		});

		if (deletedPoint) {
			const filteredCoords = routeCoords.filter(coord => {
				return coord !== deletedPoint.geometry.getCoordinates();
			});
			filteredPointCollection.forEach((point, index) => {
				changePointImage(point, index, getImage(index));
			});
			dispatch(setCoords(filteredCoords));
			map.geoObjects.remove(deletedPoint);
			setPointCollection(filteredPointCollection);
		} else {
			const sortedPoints = pointCollection.sort(
				(a, b) => getPointInfo(a, 'index') - getPointInfo(b, 'index')
			);

			for (let i = 0; i < sortedPoints.length; i++) {
				sortedPoints[i].properties.set('id', getPointId(i));
			}

			sortedPoints.forEach((point, index) => {
				changePointImage(point, index, getImage(index));
			});
			setPointCollection(sortedPoints);
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
		if (fieldsCount === pointCollection.length) {
			let tempCoordsArray = routeCoords.slice();
			const firstInput = pointCollection.find(point => {
				return getPointInfo(point, 'index') == swapPoints[0];
			});
			const secondInput = pointCollection.find(point => {
				return getPointInfo(point, 'index') == swapPoints[1];
			});
			const firstPointCoords = firstInput.geometry.getCoordinates();
			const secondPointCoords = secondInput.geometry.getCoordinates();
			firstInput.geometry.setCoordinates(secondPointCoords);
			secondInput.geometry.setCoordinates(firstPointCoords);
			swapItems(tempCoordsArray, swapPoints);

			dispatch(setCoords(tempCoordsArray));
		} else {
			const firstInput = pointCollection.find(point => {
				return getPointInfo(point, 'index') == swapPoints[0];
			});
			const secondInput = pointCollection.find(point => {
				return getPointInfo(point, 'index') == swapPoints[1];
			});
			if (firstInput) {
				if (getPointInfo(firstInput, 'index') == swapPoints[0]) {
					changePointImage(firstInput, swapPoints[0] + 1, getImage(swapPoints[0] + 1));
				} else {
					changePointImage(firstInput, swapPoints[0], getImage(swapPoints[0]));
				}
			}
			if (secondInput) {
				if (getPointInfo(secondInput, 'index') == swapPoints[0]) {
					changePointImage(secondInput, swapPoints[0] + 1, getImage(swapPoints[0] + 1));
				} else {
					changePointImage(secondInput, swapPoints[0], getImage(swapPoints[0]));
				}
			}
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
