// @ts-nocheck
import { useEffect, useRef, useState } from 'react';

import { DBSchema, IDBPDatabase, openDB } from 'idb';

import { Feature, IList } from '@/shared/types';

import { filterObj } from '../helpers';
import FilterOptionsWorker from '../helpers/filterOptionsWorder?worker';
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
	const workerOprionsRef = useRef<Worker | null>(null);
	const [brandsCache, setBrandsCache] = useState<string[] | null>(null);

	useEffect(() => {
		setIsDbReady(true);
	}, []);

	useEffect(() => {
		workerRef.current = new FilterWorker();
		workerOprionsRef.current = new FilterOptionsWorker();
		return () => {
			workerRef.current?.terminate();
			workerOprionsRef.current?.terminate();
		};
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
		const data = filteredData || (await getAllData());
		console.log('fuels', fuels);
		return new Promise(resolve => {
			workerOprionsRef.current?.postMessage({
				data,
				fuels,
				featuresList,
				titleFilter,
				azsTypes,
				addServices,
				gateHeight,
				terminal,
				filteredData,
				card
			});
			workerOprionsRef.current!.onmessage = event => resolve(event.data);
		});
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
