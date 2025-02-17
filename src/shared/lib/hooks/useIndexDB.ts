import { useEffect, useRef, useState } from 'react';

import { DBSchema, IDBPDatabase, openDB } from 'idb';

import { Feature, IList } from '@/shared/types';

import { filterObj } from '../helpers';
import FilterWorker from '../helpers/filterWorker?worker';

// Определение схемы для IndexedDB
interface AppDB extends DBSchema {
	points: {
		key: string;
		value: Feature; // Гарантируем наличие id
	};
}

export const useIndexedDB = () => {
	const [db, setDb] = useState<IDBPDatabase<AppDB> | null>(null);
	const [isDbReady, setIsDbReady] = useState(false);
	const workerRef = useRef<Worker | null>(null);
	const [brandsCache, setBrandsCache] = useState<string[] | null>(null);

	// Инициализация базы данных
	useEffect(() => {
		const initDB = async () => {
			const database = await openDB<AppDB>('azsDatabase', 1, {
				upgrade(db) {
					if (!db.objectStoreNames.contains('points')) {
						db.createObjectStore('points', { keyPath: 'id' });
					}
				}
			});
			setDb(database);
			setIsDbReady(true);
		};

		initDB();
	}, []);

	// Инициализация воркера
	useEffect(() => {
		workerRef.current = new FilterWorker();
		return () => {
			workerRef.current?.terminate(); // Освобождаем воркер при размонтировании
		};
	}, []);

	// Сохранение данных в IndexedDB
	const saveData = async (data: Feature[]) => {
		if (!db) return;

		const tx = db.transaction('points', 'readwrite');
		const store = tx.objectStore('points');

		await Promise.all(data.map(item => store.put(item))); // Параллельная запись
		await tx.done;
	};

	// Получение всех данных из IndexedDB
	const getAllData = async (): Promise<Feature[]> => {
		if (!db) return [];
		const tx = db.transaction('points', 'readonly');
		const store = tx.objectStore('points');
		return await store.getAll();
	};

	// Фильтрация данных на уровне IndexedDB
	const filterDataByOptions = async (
		fuels: IList[] = [],
		featuresList: IList[] = [],
		titleFilter?: any,
		azsTypes: IList[] = [],
		addServices: string[] = [],
		gateHeight?: number,
		terminal: string = '',
		filteredData?: Feature[],
		card?: string
	): Promise<Feature[]> => {
		const data = filteredData || (await getAllData());

		return data.filter(
			({ types, features, title, fuels: featureFuels, filters, terminals }) =>
				(fuels.length === 0 || fuels.every(fuel => featureFuels[fuel.value])) &&
				(featuresList.length === 0 || featuresList.every(f => features[f.value])) &&
				(azsTypes.length === 0 || azsTypes.some(type => types[type.value])) &&
				(addServices.length === 0 || filterObj(types, addServices)) &&
				//@ts-ignore
				(!gateHeight || filters?.gateHeight > gateHeight) &&
				(terminal.trim().length === 0 || terminals?.some(t => t.trim() === terminal.trim())) &&
				(!titleFilter ||
					titleFilter.length === 0 ||
					titleFilter.some((brand: string) => title.toLowerCase().includes(brand.toLowerCase()))) &&
				(!card ||
					card.length === 0 ||
					(card === 'Лукойл'
						? ['Лукойл', 'Тебойл'].includes(title)
						: card === 'Кардекс'
							? !['Лукойл', 'Тебойл'].includes(title)
							: true))
		);
	};

	// Фильтрация данных по типу через IndexedDB
	const filterDataByType = async (selectedFilter: number): Promise<Feature[]> => {
		if (!db || !workerRef.current) return [];
		const tx = db.transaction('points', 'readonly');
		const store = tx.objectStore('points');
		const data = await store.getAll();

		return new Promise(resolve => {
			workerRef.current?.postMessage({ data, selectedFilter });
			workerRef.current!.onmessage = event => resolve(event.data);
		});
	};

	// Получение брендов из IndexedDB с кешированием
	const getBrands = async (): Promise<string[]> => {
		if (brandsCache) return brandsCache; // Возвращаем кешированные данные
		if (!isDbReady || !db) return [];

		const tx = db.transaction('points', 'readonly');
		const store = tx.objectStore('points');
		const data = await store.getAll();

		const uniqueTitles = Array.from(
			new Set(data.map(item => item.title?.trim()).filter(Boolean))
		).sort();

		setBrandsCache(uniqueTitles); // Кешируем результат
		return uniqueTitles;
	};

	// Получение данных по id из IndexedDB с кешированием
	const cache = new Map<string, Feature>();
	const getDataById = async (id: string): Promise<Feature | undefined> => {
		if (cache.has(id)) return cache.get(id);
		if (!db) return undefined;

		const tx = db.transaction('points', 'readonly');
		const store = tx.objectStore('points');
		const data = await store.get(id);

		if (data) cache.set(id, data); // Кешируем данные
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
