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
const cache = new Map<string, Feature>();

export const useIndexedDB = () => {
	const [isDbReady, setIsDbReady] = useState(false);
	const [typeFilters, setTypeFilters] = useState([]);
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
		filteredData?: Feature[],
		card?: string
	): Promise<Feature[]> => {
		let query = db.points;

		if (fuels.length) query = query.where('fuels').anyOf(fuels.map(f => f.value));
		if (featuresList.length) query = query.where('features').anyOf(featuresList.map(f => f.value));
		if (azsTypes.length) query = query.where('types').anyOf(azsTypes.map(t => t.value));
		if (gateHeight) query = query.where('filters.gateHeight').above(gateHeight);
		if (terminal.trim()) query = query.where('terminals').equals(terminal.trim());
		if (titleFilter?.length)
			query = query.filter(({ title }) =>
				titleFilter.some(brand => title.toLowerCase().includes(brand.toLowerCase()))
			);
		if (card) {
			query = query.filter(({ title }) =>
				card === 'Лукойл'
					? ['Лукойл', 'Тебойл'].includes(title)
					: card === 'Кардекс'
						? !['Лукойл', 'Тебойл'].includes(title)
						: true
			);
		}

		return await query.toArray();
	};
	const filterDataByType = async (selectedFilter: number): Promise<Feature[]> => {
		const data = await db.points.toArray();
		const promise = new Promise(resolve => {
			workerRef.current?.postMessage({ data, selectedFilter });
			workerRef.current!.onmessage = event => resolve(event.data);
		});
		setTypeFilters(await promise);
		return promise;
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
