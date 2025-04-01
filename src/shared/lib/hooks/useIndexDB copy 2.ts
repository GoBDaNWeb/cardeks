// @ts-nocheck
import { useEffect, useRef, useState } from 'react';

import { DBSchema } from 'idb';

import { Feature, IList } from '@/shared/types';

import { filterObj } from '../helpers';

import { db } from './db';

const ymaps = window.ymaps;

interface AppDB extends DBSchema {
	points: {
		key: string;
		value: Feature;
	};
}

const cache = new Map<string, Feature>();

export const useIndexedDB = () => {
	const [isDbReady, setIsDbReady] = useState(false);
	const [typeFilters, setTypeFilters] = useState([]);
	const [brandsCache, setBrandsCache] = useState<string[] | null>(null);

	useEffect(() => {
		setIsDbReady(true);
	}, []);

	const saveData = async (data: Feature[]) => {
		cache.clear();
		await db.points.bulkPut(data);
	};

	const getAllData = async (): Promise<Feature[]> => {
		return await db.points.toArray();
	};

	const filterDataByOptions = async (
		fuels: IList[] = [],
		featuresList: IList[] = [],
		titleFilter?: string[],
		azsTypes: IList[] = [],
		addServices: string[] = [],
		gateHeight?: number,
		terminal: string = '',
		card?: string,
		selectedFilter: number,
		relatedProducts: boolean
	): Promise<Feature[]> => {
		let query = db.points.toCollection();
		if (selectedFilter !== null) {
			query = query.filter(item => {
				if (selectedFilter === 0) return item.types?.azs;
				if (selectedFilter === 1) return item.types?.tire;
				if (selectedFilter === 2) return item.types?.washing;
				return true;
			});
		}
		query = query.filter(
			({ types, features, title, fuels: featureFuels, filters, terminals, addittional }) => {
				return (
					(fuels.length === 0 || fuels.every(fuel => featureFuels?.[fuel.value])) &&
					(featuresList.length === 0 || featuresList.every(f => features?.[f.value])) &&
					(azsTypes.length === 0 || azsTypes.some(type => types?.[type.value])) &&
					(addServices.length === 0 || filterObj(types, addServices)) &&
					(!gateHeight || (filters?.gateHeight ?? 0) > gateHeight) &&
					(!terminal.trim() || terminals?.some(t => t.trim() === terminal.trim())) &&
					(!titleFilter?.length || title.toLowerCase().includes(titleFilter.toLowerCase())) &&
					(!card ||
						card.length === 0 ||
						(card === 'Лукойл'
							? ['Лукойл', 'Тебойл'].includes(title)
							: card === 'Кардекс'
								? !['Лукойл', 'Тебойл'].includes(title)
								: true)) &&
					addittional?.relatedProducts === relatedProducts
				);
			}
		);
		return await query.toArray();
	};

	const getBrands = async (): Promise<string[]> => {
		if (brandsCache) return brandsCache;
		const uniqueTitles = await db.points.orderBy('title').uniqueKeys();
		const sortedTitles = uniqueTitles.map(String).sort();
		setBrandsCache(sortedTitles);
		return sortedTitles;
	};

	const getDataById = async (id: string): Promise<Feature | undefined> => {
		if (cache.has(id)) return cache.get(id);
		const data = await db.points.get(id);
		if (data) cache.set(id, data);
		return data;
	};

	/**
	 * Оптимизированная функция поиска АЗС на маршруте с использованием Web Worker.
	 * Вынос вычислительно тяжёлой фильтрации в отдельный поток помогает не блокировать UI.
	 */
	const getAzsOnRoute = async (
		azsArr: Feature[] | undefined,
		line: any, // TODO: заменить any на конкретный тип
		threshold: number = 500,
		firstRouteCoord: number[]
	): Promise<Feature[]> => {
		if (!firstRouteCoord || !line) return [];

		const linesArr = line.toArray();
		if (!linesArr.length) return [];

		// Получаем данные АЗС: либо из переданного массива, либо из базы
		const azsData = azsArr?.length ? azsArr : await db.points.filter(el => el.geometry).toArray();
		if (!azsData.length) return [];

		// Извлекаем координаты полилинии маршрута.
		// Если метод getCoordinates существует, используем его, иначе предполагаем наличие свойства coordinates.
		const routeGeometry = linesArr[0].geometry;
		const polyline: number[][] =
			typeof routeGeometry.getCoordinates === 'function'
				? routeGeometry.getCoordinates()
				: routeGeometry.coordinates;

		// Определяем код воркера как строку
		const workerCode = `
			self.onmessage = function(e) {
				const { azsData, polyline, threshold, firstRouteCoord } = e.data;

				// Функция для перевода градусов в радианы
				function toRad(value) {
					return value * Math.PI / 180;
				}

				// Вычисление расстояния по формуле гаверсина (в метрах)
				function haversineDistance(coord1, coord2) {
					const R = 6371000; // радиус Земли в метрах
					const lat1 = toRad(coord1[0]);
					const lat2 = toRad(coord2[0]);
					const dLat = toRad(coord2[0] - coord1[0]);
					const dLon = toRad(coord2[1] - coord1[1]);
					const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
						Math.cos(lat1) * Math.cos(lat2) *
						Math.sin(dLon / 2) * Math.sin(dLon / 2);
					const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
					return R * c;
				}

				// Вычисление расстояния от точки до отрезка
				function pointToSegmentDistance(point, segStart, segEnd) {
					const [x, y] = point;
					const [x1, y1] = segStart;
					const [x2, y2] = segEnd;
					const A = x - x1;
					const B = y - y1;
					const C = x2 - x1;
					const D = y2 - y1;
					const dot = A * C + B * D;
					const lenSq = C * C + D * D;
					let param = -1;
					if (lenSq !== 0) {
						param = dot / lenSq;
					}
					let xx, yy;
					if (param < 0) {
						xx = x1;
						yy = y1;
					} else if (param > 1) {
						xx = x2;
						yy = y2;
					} else {
						xx = x1 + param * C;
						yy = y1 + param * D;
					}
					return haversineDistance(point, [xx, yy]);
				}

				// Вычисление минимального расстояния от точки до полилинии
				function pointToPolylineDistance(point, polyline) {
					let minDistance = Infinity;
					for (let i = 0; i < polyline.length - 1; i++) {
						const segStart = polyline[i];
						const segEnd = polyline[i + 1];
						const d = pointToSegmentDistance(point, segStart, segEnd);
						if (d < minDistance) {
							minDistance = d;
						}
					}
					return minDistance;
				}

				const result = [];
				for (let item of azsData) {
					const point = item.geometry.coordinates;
					const distanceToLine = pointToPolylineDistance(point, polyline);
					if (distanceToLine < threshold) {
						// Вычисляем расстояние от первой координаты маршрута до точки
						item.distance = haversineDistance(firstRouteCoord, point);
						result.push(item);
					}
				}
				self.postMessage(result);
			};
		`;

		// Создаём Blob с кодом воркера и инициализируем воркер
		const blob = new Blob([workerCode], { type: 'application/javascript' });
		const worker = new Worker(URL.createObjectURL(blob));

		// Обёртка в Promise для ожидания ответа от воркера
		const result: Feature[] = await new Promise((resolve, reject) => {
			worker.onmessage = event => {
				resolve(event.data);
				worker.terminate();
			};
			worker.onerror = error => {
				reject(error);
				worker.terminate();
			};
			worker.postMessage({ azsData, polyline, threshold, firstRouteCoord });
		});
		return result;
	};

	return {
		saveData,
		getAllData,
		filterDataByOptions,
		getBrands,
		getDataById,
		isDbReady,
		getAzsOnRoute
	};
};
