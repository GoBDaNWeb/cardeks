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
	getImage,
	getPointInfo,
	swapItems
} from '../helpers';

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
			swapPoints,
			deletePointId,
			selectedAddress,
			fieldsCount
		}
	} = useTypedSelector(store => store.map);

	const { getLocation } = useTypedSelector(store => store.settingsMapMenu);
	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);
	const { activeMenu } = useTypedSelector(state => state.menu);
	const { isSuccess } = useTypedSelector(state => state.newRouteModal);

	const getAddress = (coords: number[]) => {
		ymaps.geocode(coords).then((res: any) => {
			const firstGeoObject = res.geoObjects.get(0);
			const address = firstGeoObject.getAddressLine();
			dispatch(setAddress(address));
		});
	};

	const handleSelectCoords = (e: any) => {
		const coords = e.get('coords');
		getAddress(coords);
		setTimeout(() => {
			dispatch(setSelectAddress(false));
		}, 300);
	};

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
			dispatch(setCoords(newCoords));
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
				console.log('myPlacemark', myPlacemark);
				dispatch(setCoords([...routeCoords, coords]));

				map.geoObjects.add(myPlacemark);
				setPointCollection(prevCollection => [...prevCollection, myPlacemark]);
			}
		}
	};

	const handleAddPoint = (e?: any) => {
		if (e) {
			const coords = e.get('coords');
			addPoint(coords);
		} else if (selectedAddress && !isSelectAddress && !buildSearch) {
			ymaps.geocode(selectedAddress).then((res: any) => {
				const firstGeoObject = res.geoObjects.get(0);
				const coords = firstGeoObject.geometry.getCoordinates();
				addPoint(coords);
			});
		}
	};

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

	useEffect(() => {
		if (buildSearch) {
			handleAddPoint();
		}
	}, [buildSearch]);

	useEffect(() => {
		handleAddPoint();
	}, [selectedAddress]);

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

				dispatch(setCoords(tempCoordsArray));
			}
		} else {
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

	useEffect(() => {
		if (map && getLocation) {
			const location = ymaps.geolocation.get();
			location.then(
				(result: any) => {
					map.geoObjects.add(result.geoObjects);
					map.setCenter(result.geoObjects.position, 15);
				},
				(err: any) => {
					console.log('Ошибка: ' + err);
				}
			);
		}
	}, [getLocation]);

	useEffect(() => {
		if (deletePointId) {
			handleRemovePoint(deletePointId);
		}
	}, [deletePointId]);

	useEffect(() => {
		if (map) {
			const cursor = map.cursors.push('arrow');

			if (isSelectAddress && currentPointId) {
				cursor.setKey('crosshair');
				map.events.group().events.types.click = undefined;
				map.events.group().add('click', (e: any) => handleSelectCoords(e));
				map.events.group().add('click', (e: any) => handleAddPoint(e));
			} else {
				cursor.setKey('grab');

				map.events.remove('click');
				map.events.group().events.types.click = undefined;
			}
		}
	}, [isSelectAddress, currentPointId]);

	useEffect(() => {
		if (activeMenu !== 'route' || mobileActiveMenu !== 'route') {
			handleClearPoints();
		}
	}, [activeMenu, mobileActiveMenu]);

	useEffect(() => {
		if (isSuccess) {
			handleClearPoints();
		}
	}, [isSuccess]);
};
