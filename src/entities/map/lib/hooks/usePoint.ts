import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { IPointGeometry } from 'yandex-maps';

import { useTypedSelector } from '@/shared/lib';
import { IPlacemark } from '@/shared/types';

import { setAddress, setCoords, setSelectAddress } from '../../model';
import {
	changePointImage,
	containsArray,
	createPlacemark,
	getAddress,
	getImage,
	getPointInfo,
	swapItems
} from '../helpers';

type Coordinates = [number, number];

interface IUsePointProps {
	ymaps: any;
	map: any;
	pointCollection: IPlacemark[];
	setPointCollection: React.Dispatch<React.SetStateAction<IPlacemark[]>>;
}

export const usePoint = ({ ymaps, map, pointCollection, setPointCollection }: IUsePointProps) => {
	const [searchPoint, setSearchPoint] = useState<any>(null);

	const currentPointIdRef = useRef<string | null>(null);
	const dispatch = useDispatch();

	const {
		searchInfo: { search, searchValue, buildSearch },
		routeInfo: {
			isSelectAddress,
			currentPointId,
			routeCoords,
			currentCoords,
			swapPoints,
			deletePointId,
			selectedAddress,
			fieldsCount,
			isCursorPoint,
			getLocation: getLocationPoint
		}
	} = useTypedSelector(store => store.map);

	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);
	const { activeMenu } = useTypedSelector(state => state.menu);
	const { props: isSuccess } = useTypedSelector(state => state.modals);

	const addPoint = (coords: number[]) => {
		const pointId = currentPointIdRef.current;
		const existingMarker = pointCollection.find(point => {
			return getPointInfo(point, 'id') === pointId;
		});
		if (existingMarker) {
			const currentCoords = routeCoords.slice();
			const newCoords = containsArray(
				currentCoords,
				(existingMarker.geometry as IPointGeometry).getCoordinates(),
				coords
			);
			if (newCoords) {
				dispatch(setCoords(newCoords as Coordinates[]));
			}
			(existingMarker.geometry as IPointGeometry).setCoordinates(coords);
		} else {
			const pointIndex = pointId!.split('.')[1];
			if (pointId) {
				let myPlacemark = createPlacemark({
					ymaps,
					coords,
					pointId,
					pointIndex: parseInt(pointIndex)
				});

				dispatch(setCoords([...routeCoords, coords]));

				map.geoObjects.add(myPlacemark);
				setPointCollection(prevCollection => [...prevCollection, myPlacemark]);
			}
		}
	};

	// нахождениеадреса по координатам
	const handleSelectCoords = (e: any) => {
		const coords = e.get('coords');
		getAddress({ ymaps, coords, dispatch, setAddress });
		dispatch(setSelectAddress(false));
	};

	// функция добавления точки
	const handleAddPoint = (e?: any, pingPoint?: boolean) => {
		if (e && pingPoint && isCursorPoint) {
			const coords = e.get('coords');
			addPoint(coords);
		} else if (selectedAddress && !isSelectAddress && !buildSearch && !isCursorPoint) {
			ymaps.geocode(selectedAddress).then((res: any) => {
				if (!isSelectAddress) {
					const firstGeoObject = res.geoObjects.get(0);
					const coords = firstGeoObject.geometry.getCoordinates();
					addPoint(coords);
				}
			});
		}
	};

	// функция удаления точки
	const handleRemovePoint = (id: string) => {
		const deletedPoint = pointCollection.find(point => {
			return getPointInfo(point, 'id') === id;
		});
		const filteredPointCollection = pointCollection.filter(point => {
			return getPointInfo(point, 'id') !== id;
		});

		if (deletedPoint) {
			const filteredCoords = routeCoords.filter((coord: number[]) => {
				return coord !== (deletedPoint.geometry as IPointGeometry).getCoordinates();
			});
			filteredPointCollection.forEach((point, index) => {
				changePointImage(point, index, getImage(index));
			});
			if (filteredCoords) {
				dispatch(setCoords(filteredCoords as Coordinates[]));
			}
			map.geoObjects.remove(deletedPoint);
			setPointCollection(filteredPointCollection);
		} else {
			pointCollection.forEach((point, index) => {
				changePointImage(point, index, getImage(index));
			});
			setPointCollection(pointCollection);
		}
	};

	// удаления всех точек
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

	// добавление точки при поиске
	useEffect(() => {
		handleAddPoint(null, false);
	}, [buildSearch]);

	// добавление точки при нажатии на карту через построение маршрута
	useEffect(() => {
		if (selectedAddress) {
			handleAddPoint(null, false);
		}
	}, [selectedAddress, isSelectAddress]);

	// добавление точки при поиске
	useEffect(() => {
		if (map) {
			if (search) {
				map.geoObjects.remove(searchPoint);
				ymaps
					.geocode(searchValue, {
						results: 1
					})
					.then((res: any) => {
						const firstGeoObject = res.geoObjects.get(0);
						const coords = firstGeoObject.geometry.getCoordinates();
						const myPlacemark = new ymaps.Placemark(coords, {
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

	// свап точек маршрута на карте - "A" -> "B" = "B" -> "A"
	useEffect(() => {
		const firstInput = pointCollection.find(point => {
			return getPointInfo(point, 'index') == swapPoints[0];
		});
		const secondInput = pointCollection.find(point => {
			return getPointInfo(point, 'index') == swapPoints[1];
		});
		if (fieldsCount === pointCollection.length) {
			let tempCoordsArray = routeCoords.slice();
			if (firstInput && secondInput) {
				const firstPointCoords = (firstInput.geometry as IPointGeometry).getCoordinates();
				const secondPointCoords = (secondInput.geometry as IPointGeometry).getCoordinates();
				(firstInput.geometry as IPointGeometry).setCoordinates(secondPointCoords);
				(secondInput.geometry as IPointGeometry).setCoordinates(firstPointCoords);
				swapItems(tempCoordsArray, swapPoints);
				if (tempCoordsArray) {
					dispatch(setCoords(tempCoordsArray as Coordinates[]));
				}
			}
		} else {
			if (firstInput) {
				if (getPointInfo(firstInput, 'index') == swapPoints[0]) {
					changePointImage(firstInput, +swapPoints[0] + 1, getImage(+swapPoints[0] + 1));
				} else {
					changePointImage(firstInput, +swapPoints[0], getImage(+swapPoints[0]));
				}
			}
			if (secondInput) {
				if (getPointInfo(secondInput, 'index') == swapPoints[0]) {
					changePointImage(secondInput, +swapPoints[0] + 1, getImage(+swapPoints[0] + 1));
				} else {
					changePointImage(secondInput, +swapPoints[0], getImage(+swapPoints[0]));
				}
			}
		}
	}, [swapPoints]);

	// удаление точки
	useEffect(() => {
		if (deletePointId) {
			handleRemovePoint(deletePointId);
		}
	}, [deletePointId]);

	// добавление обработчика кликов на карту
	useEffect(() => {
		if (map) {
			const cursor = map.cursors.push('arrow');

			if (isSelectAddress && currentPointId) {
				cursor.setKey('crosshair');
				map.events.group().events.types.click = undefined;
				map.events.group().add('click', (e: any) => handleSelectCoords(e));
				map.events.group().add('click', (e: any) => handleAddPoint(e, true));
			} else {
				cursor.setKey('grab');

				map.events.remove('click');
				map.events.group().events.types.click = undefined;
			}
		}
	}, [isSelectAddress, currentPointId]);

	// поиск геолокации и добавление метки для посторения маршрута
	useEffect(() => {
		if (getLocationPoint && currentCoords.length) {
			getAddress({ ymaps, coords: currentCoords, dispatch, setAddress });
			setTimeout(() => {
				map.setCenter(...currentCoords, 15);
			}, 400);
			dispatch(setSelectAddress(false));
		}
	}, [getLocationPoint, currentCoords]);

	// удаление точек при закрытии меню маршрута
	useEffect(() => {
		if (activeMenu !== 'route' || mobileActiveMenu !== 'route') {
			handleClearPoints();
		}
	}, [activeMenu, mobileActiveMenu]);

	// удаление точек старого маршрута при построении нового
	useEffect(() => {
		if (isSuccess) {
			handleClearPoints();
		}
	}, [isSuccess]);
};
