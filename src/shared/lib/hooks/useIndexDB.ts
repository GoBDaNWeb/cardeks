import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { DBSchema, IDBPDatabase, openDB } from 'idb';

import { setCategoryTotals, setPoints } from '@/entities/map';

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
	const dispatch = useDispatch();
	const worker = new FilterWorker();

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

	// Сохранение данных в IndexedDB
	const saveData = async (data: Feature[]) => {
		if (!db) return;

		const tx = db.transaction('points', 'readwrite');
		const store = tx.objectStore('points');

		for (const item of data) {
			store.put(item);
		}

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
		const data = filteredData || (await getAllData()); // Берем либо уже отфильтрованные, либо все данные
		return data.filter(feature => {
			const { options, types, features, title, fuels: featureFuels, filters, terminals } = feature;

			const fuelsMatch = fuels.length === 0 || fuels.every(fuel => featureFuels[fuel.value]);
			const featuresMatch = featuresList.length === 0 || featuresList.every(f => features[f.value]);
			const azsOptionsMatch = azsTypes.length === 0 || azsTypes.some(type => types[type.value]);
			const matchingServices = addServices.length === 0 || filterObj(types, addServices);
			//@ts-ignore
			const matchingGate = !gateHeight || filters.gateHeight > gateHeight;
			const terminalMatch =
				terminal.trim().length === 0 || terminals?.some(t => t.trim() === terminal.trim());
			const titleMatch =
				!titleFilter ||
				titleFilter.length === 0 ||
				titleFilter.some((brand: string) => title.toLowerCase().includes(brand.toLowerCase()));

			const cardMatch =
				!card ||
				card.length === 0 ||
				(card === 'Лукойл'
					? ['Лукойл', 'Тебойл'].includes(title)
					: card === 'Кардекс'
						? !['Лукойл', 'Тебойл'].includes(title)
						: true);

			return (
				fuelsMatch &&
				featuresMatch &&
				titleMatch &&
				azsOptionsMatch &&
				matchingServices &&
				matchingGate &&
				terminalMatch &&
				cardMatch
			);
		});
	};

	// Фильтрация данных по типу через IndexedDB
	const filterDataByType = async (selectedFilter: number): Promise<Feature[]> => {
		if (!db) return [];
		const tx = db.transaction('points', 'readonly');
		const store = tx.objectStore('points');
		const data = await store.getAll();

		return new Promise(resolve => {
			worker.postMessage({ data, selectedFilter });
			worker.onmessage = event => resolve(event.data);
		});
	};

	const getBrands = async (): Promise<string[]> => {
		if (!isDbReady || !db) return [];

		const tx = db.transaction('points', 'readonly');
		const store = tx.objectStore('points');
		const data = await store.getAll();

		const uniqueTitles = new Set<string>();
		data.forEach(item => {
			const title = item.title?.trim();
			if (title) uniqueTitles.add(title);
		});

		return Array.from(uniqueTitles).sort((a, b) => a.localeCompare(b));
	};

	const getDataById = async (id: string): Promise<Feature | undefined> => {
		if (!db) return undefined;
		const tx = db.transaction('points', 'readonly');
		const store = tx.objectStore('points');
		return await store.get(id);
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
