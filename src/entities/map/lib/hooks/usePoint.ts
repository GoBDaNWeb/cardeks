import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useTypedSelector } from '@/shared/lib';

import { setAddress, setCoords, setSelectAddress } from '../../model';
import {
	changePointImage,
	containsArray,
	createPlacemark,
	getImage,
	getPointInfo,
	swapItems
} from '../helpers';

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
	} = useTypedSelector(state => state.map);
	const { getLocation } = useTypedSelector(store => store.settingsMapMenu);
	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);
	const { activeMenu } = useTypedSelector(state => state.menu);
	const { isSuccess } = useTypedSelector(state => state.newRouteModal);

	const getAddress = coords => {
		ymaps.geocode(coords).then(function (res) {
			const firstGeoObject = res.geoObjects.get(0);
			const address = firstGeoObject.getAddressLine();
			dispatch(setAddress(address));
			// dispatch(setCoords(coords));
		});
	};

	const handleSelectCoords = e => {
		const coords = e.get('coords');
		getAddress(coords);
		setTimeout(() => {
			dispatch(setSelectAddress(false));
		}, 300);
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
			let myPlacemark = createPlacemark({ ymaps, coords, pointId, pointIndex });

			dispatch(setCoords([...routeCoords, coords]));

			map.geoObjects.add(myPlacemark);
			setPointCollection(prevCollection => [...prevCollection, myPlacemark]);
		}
	};

	const handleAddPoint = e => {
		if (e) {
			const coords = e.get('coords');
			addPoint(coords);
		} else if (selectedAddress && !isSelectAddress && !buildSearch) {
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
			pointCollection.forEach((point, index) => {
				changePointImage(point, index, getImage(index));
			});
			setPointCollection(pointCollection);
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

	// добавляем метку при выборе с помощью dropdown
	useEffect(() => {
		if (buildSearch) {
			handleAddPoint();
		}
	}, [buildSearch]);

	useEffect(() => {
		handleAddPoint();
	}, [selectedAddress]);

	// добавляем метку и переносимся на нее при выборе в поиске
	useEffect(() => {
		if (map) {
			if (search) {
				map.geoObjects.remove(searchPoint);
				ymaps
					.geocode(searchValue, {
						results: 1
					})
					.then(function (res) {
						let firstGeoObject = res.geoObjects.get(0);
						let coords = firstGeoObject.geometry.getCoordinates();
						let myPlacemark = new ymaps.Placemark(coords, {
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

	// поулчаем местоположение пользователя и ставим метку
	useEffect(() => {
		if (map && getLocation) {
			var location = ymaps.geolocation.get();
			location.then(
				function (result) {
					// Добавление местоположения на карту.
					map.geoObjects.add(result.geoObjects);
					map.setCenter(result.geoObjects.position, 15);
				},
				function (err) {
					console.log('Ошибка: ' + err);
				}
			);
		}
	}, [getLocation]);

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
		if (activeMenu !== 'route' || mobileActiveMenu !== 'route') {
			handleClearPoints();
		}
	}, [activeMenu, mobileActiveMenu]);

	// удаление точек при выборе нового маршрута
	useEffect(() => {
		if (isSuccess) {
			handleClearPoints();
		}
	}, [isSuccess]);
};
