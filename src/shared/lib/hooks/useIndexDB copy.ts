// @ts-nocheck
import { useEffect, useRef, useState } from 'react';

import { DBSchema, IDBPDatabase, openDB } from 'idb';

import { Feature, IList } from '@/shared/types';

import { filterObj } from '../helpers';

import { db } from './db';

const ymaps = window.ymaps;
interface BoundingBox {
	minLat: number;
	maxLat: number;
	minLng: number;
	maxLng: number;
}

// Определение схемы для IndexedDB
interface AppDB extends DBSchema {
	points: {
		key: string;
		value: Feature; // Гарантируем наличие id
	};
}
const cache = new Map<string, Feature>();

const createWorker = () => {
	const workerCode = `
	  function getDistanceToLine(coords, lineCoords) {
		// Простая реализация расчета расстояния до линии
		let minDistance = Infinity;
		for (let i = 0; i < lineCoords.length - 1; i++) {
		  const dist = pointToLineDistance(
			coords,
			lineCoords[i],
			lineCoords[i+1]
		  );
		  if (dist < minDistance) minDistance = dist;
		}
		return minDistance;
	  }
  
	  function pointToLineDistance(point, lineStart, lineEnd) {
		// Реализация математики расчета расстояния
		const dx = lineEnd[0] - lineStart[0];
		const dy = lineEnd[1] - lineStart[1];
		
		const lengthSquared = dx * dx + dy * dy;
		if (lengthSquared === 0) return Math.hypot(
		  point[0] - lineStart[0], 
		  point[1] - lineStart[1]
		);
		
		let t = ((point[0] - lineStart[0]) * dx + 
				 (point[1] - lineStart[1]) * dy) / lengthSquared;
		t = Math.max(0, Math.min(1, t));
		
		return Math.hypot(
		  point[0] - (lineStart[0] + t * dx),
		  point[1] - (lineStart[1] + t * dy)
		);
	  }
  
	  self.onmessage = function({ data }) {
		const { batch, lineCoordsArray, threshold } = data;
		const results = [];
		
		for (const azs of batch) {
		  const { coordinates } = azs.geometry;
		  for (const lineCoords of lineCoordsArray) {
			const distance = getDistanceToLine(coordinates, lineCoords);
			if (distance < threshold) {
			  results.push(azs);
			  break;
			}
		  }
		}
		
		postMessage(results);
	  };
	`;

	const blob = new Blob([workerCode], { type: 'application/javascript' });
	return new Worker(URL.createObjectURL(blob));
};
export const useIndexedDB = () => {
	const [isDbReady, setIsDbReady] = useState(false);
	const [typeFilters, setTypeFilters] = useState([]);
	const [brandsCache, setBrandsCache] = useState<string[] | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const workerRef = useRef<Worker | null>(null);
	const routeCache = useRef(new Map<string, Feature[]>());
	const dataCache = useRef(new Map<string, Feature>());
	// Инициализация воркера
	useEffect(() => {
		workerRef.current = createWorker();
		return () => {
			workerRef.current?.terminate();
		};
	}, []);
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
		selectedFilter: number
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
			({ types, features, title, fuels: featureFuels, filters, terminals }) =>
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
							: true))
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

	const cache = new Map<string, Feature>();
	const getDataById = async (id: string): Promise<Feature | undefined> => {
		if (cache.has(id)) return cache.get(id);
		const data = await db.points.get(id);
		if (data) cache.set(id, data);
		return data;
	};

	// Получение bounding box маршрута
	const getRouteBoundingBox = (lines: any[], threshold: number): BoundingBox => {
		const coordinates = lines.flatMap(line => line.geometry.getCoordinates());
		const lats = coordinates.map(coord => coord[0]);
		const lngs = coordinates.map(coord => coord[1]);

		const expand = threshold / 30113200; // ~1 градус = 111.32 км
		return {
			minLat: Math.min(...lats) - expand,
			maxLat: Math.max(...lats) + expand,
			minLng: Math.min(...lngs) - expand,
			maxLng: Math.max(...lngs) + expand
		};
	};

	// Пакетная обработка данных
	const processInBatches = async <T, R>(
		data: T[],
		batchSize: number,
		processFn: (batch: T[]) => Promise<R[]>,
		updateProgress?: (progress: number) => void
	) => {
		const results: R[] = [];
		const totalBatches = Math.ceil(data.length / batchSize);

		for (let i = 0; i < data.length; i += batchSize) {
			const batch = data.slice(i, i + batchSize);
			const batchResults = await processFn(batch);
			results.push(...batchResults);

			updateProgress?.(((i + batchSize) / data.length) * 100);

			// Даем браузеру возможность обработать события
			await new Promise(resolve => setTimeout(resolve, 0));
		}

		return results;
	};

	// Фильтрация АЗС по маршруту с использованием Web Worker
	const filterAzsByRoute = async (
		azsData: Feature[],
		lines: any[],
		threshold: number
	): Promise<Feature[]> => {
		return new Promise(resolve => {
			if (!workerRef.current) return resolve([]);

			// Преобразуем линии в простые массивы координат
			const lineCoordsArray = lines.map(line => line.geometry.getCoordinates());

			const results: Feature[] = [];
			const batchSize = 2000;
			const totalBatches = Math.ceil(azsData.length / batchSize);
			let processedBatches = 0;

			workerRef.current.onmessage = ({ data }: { data: Feature[] }) => {
				results.push(...data);
				processedBatches++;
				setProgress((processedBatches / totalBatches) * 100);

				if (processedBatches === totalBatches) {
					resolve(results);
				}
			};

			// Отправляем только простые данные
			for (let i = 0; i < azsData.length; i += batchSize) {
				const batch = azsData.slice(i, i + batchSize);
				workerRef.current.postMessage({
					batch,
					lineCoordsArray, // Простые данные вместо сложных объектов
					threshold
				});
			}
		});
	};

	// Основная функция поиска АЗС по маршруту
	const getAzsOnRoute = async (
		azsArr: Feature[] | undefined,
		lines: any,
		threshold: number = 500,
		firstRouteCoord: number[]
	): Promise<Feature[]> => {
		if (!firstRouteCoord || !lines) return [];
		setIsProcessing(true);
		setProgress(0);

		try {
			const linesArr = lines.toArray();
			if (!linesArr.length) return [];

			// 1. Проверяем кэш
			const cacheKey = `${lines.hash}-${threshold}-${firstRouteCoord.join(',')}`;
			if (routeCache.current.has(cacheKey)) {
				return routeCache.current.get(cacheKey)!;
			}

			// 2. Фильтрация по bounding box
			const bbox = getRouteBoundingBox(linesArr, threshold);
			let azsData: Feature[];

			if (azsArr?.length) {
				azsData = azsArr.filter(azs => {
					const [lat, lng] = azs.geometry.coordinates;
					return (
						lat >= bbox.minLat && lat <= bbox.maxLat && lng >= bbox.minLng && lng <= bbox.maxLng
					);
				});
			} else {
				azsData = await db.points
					.where('[geometry.coordinates.lat+geometry.coordinates.lng]')
					.between([bbox.minLat, bbox.minLng], [bbox.maxLat, bbox.maxLng])
					.toArray();
			}

			// 3. Параллельная обработка в Web Worker
			const filteredAzs = await filterAzsByRoute(azsData, linesArr, threshold);

			// 4. Добавляем расстояния (основной поток)
			const results = await processInBatches(
				filteredAzs,
				1000,
				async batch => {
					return batch.map(azs => ({
						...azs,
						distance: window.ymaps.coordSystem.geo.getDistance(
							firstRouteCoord,
							azs.geometry.coordinates
						)
					}));
				},
				setProgress
			);

			// 5. Кэшируем и возвращаем результаты
			routeCache.current.set(cacheKey, results);
			return results;
		} finally {
			setIsProcessing(false);
		}
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
