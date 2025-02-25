// @ts-nocheck
import { useEffect, useRef, useState } from 'react';

import { DBSchema, IDBPDatabase, openDB } from 'idb';

import { Feature, IList } from '@/shared/types';

import { filterObj } from '../helpers';
import FilterWorker from '../helpers/filterWorker?worker';

import { db } from './db';

// Определение схемы для IndexedDB
interface AppDB extends DBSchema {
	points: {
		key: string;
		value: Feature; // Гарантируем наличие id
	};
}

export const useIndexedDB = () => {
	const [isDbReady, setIsDbReady] = useState(false);
	const workerRef = useRef<Worker | null>(null);
	const [brandsCache, setBrandsCache] = useState<string[] | null>(null);

	useEffect(() => {
		setIsDbReady(true);
	}, []);

	useEffect(() => {
		workerRef.current = new FilterWorker();
		return () => workerRef.current?.terminate();
	}, []);

	const saveData = async (data: Feature[]) => {
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
		filteredData?: Feature[],
		card?: string
	): Promise<Feature[]> => {
		let query = db.points.toCollection();

		// Фильтрация по видам топлива
		if (fuels.length > 0) {
			query = query.filter(item =>
				fuels.every(f => item.fuels?.[f.value as keyof typeof item.fuels] === true)
			);
		}

		// Фильтрация по особенностям
		if (featuresList.length > 0) {
			query = query.filter(item =>
				featuresList.every(f => item.features?.[f.value as keyof typeof item.features] === true)
			);
		}

		// Фильтрация по типам АЗС
		if (azsTypes.length > 0) {
			query = query.filter(item =>
				azsTypes.every(t => item.types?.[t.value as keyof typeof item.types] === true)
			);
		}

		// Фильтрация по высоте ворот
		if (gateHeight) {
			query = query.filter(item => (item.filters?.gateHeight ?? 0) >= gateHeight);
		}

		// Фильтрация по терминалу
		if (terminal.trim()) {
			const trimmedTerminal = terminal.trim();
			query = query.filter(item => item.terminals?.includes(trimmedTerminal));
		}

		// Фильтрация по названию бренда
		if (titleFilter?.length) {
			query = query.filter(item =>
				titleFilter.some(brand => item.title.toLowerCase().includes(brand.toLowerCase()))
			);
		}

		// Фильтрация по типу карты
		if (card) {
			query = query.filter(item => {
				if (card === 'Лукойл') {
					return ['Лукойл', 'Тебойл'].includes(item.title);
				} else if (card === 'Кардекс') {
					return !['Лукойл', 'Тебойл'].includes(item.title);
				}
				return true;
			});
		}

		return await query.toArray();
	};
	const filterDataByType = async (selectedFilter: number): Promise<Feature[]> => {
		const data = await db.points.toArray();
		return new Promise(resolve => {
			workerRef.current?.postMessage({ data, selectedFilter });
			workerRef.current!.onmessage = event => resolve(event.data);
		});
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

	return {
		saveData,
		getAllData,
		filterDataByOptions,
		filterDataByType,
		getBrands,
		getDataById,
		isDbReady
	};
};
