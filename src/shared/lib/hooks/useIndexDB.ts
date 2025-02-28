// @ts-nocheck
import { useEffect, useRef, useState } from 'react';

import { DBSchema, IDBPDatabase, openDB } from 'idb';

import { Feature, IList } from '@/shared/types';

import { filterObj } from '../helpers';
import FilterWorker from '../helpers/filterWorker?worker';

import { db } from './db';

const ymaps = window.ymaps;

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
				(!titleFilter?.length ||
					titleFilter.some(brand => title.toLowerCase().includes(brand.toLowerCase()))) &&
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

	const getAzsOnRoute = async (
		azsArr?: Feature[],
		lines: any,
		threshold: number = 500,
		firstRouteCoord: number[]
	): Promise<Feature[]> => {
		if (!firstRouteCoord || !lines) return [];
		const linesArr = lines.toArray(); // Вызываем один раз!
		const filteredAzs =
			azsArr && azsArr.length > 0 ? azsArr : await db.points.filter(el => el.geometry).toArray();
		const mappedFiltered = await Promise.all(
			filteredAzs
				.filter(el =>
					linesArr.some(
						line => line.geometry.getClosest(el.geometry.coordinates).distance < threshold
					)
				)
				.map(async item => ({
					...item,
					distance: ymaps.coordSystem.geo.getDistance(firstRouteCoord, item.geometry.coordinates)
				}))
		);

		return mappedFiltered;
	};

	return {
		saveData,
		getAllData,
		filterDataByOptions,
		filterDataByType,
		getBrands,
		getDataById,
		isDbReady,
		getAzsOnRoute
	};
};
