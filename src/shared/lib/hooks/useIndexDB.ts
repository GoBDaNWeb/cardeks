import { useEffect, useState } from 'react';

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
		gateHeight?: number
	): Promise<Feature[]> => {
		if (!db) return [];

		const tx = db.transaction('points', 'readonly');
		const store = tx.objectStore('points');
		const result: Feature[] = [];

		let cursor = await store.openCursor();
		while (cursor) {
			const feature = cursor.value;
			const { options, types, features, title, fuels: featureFuels, filters } = feature;
			// Проверка топлива

			// Проверка соответствия топлива
			// const optionsMatch = fuels.length === 0 || fuels.every(fuel => options[fuel.value]);
			const fuelsMatch = fuels.length === 0 || fuels.every(fuel => featureFuels[fuel.value]);

			const featuresMatch =
				featuresList.length === 0 || featuresList.every(feature => features[feature.value]);

			// Проверка соответствия заголовка
			const titleMatch =
				titleFilter.length === 0 ||
				titleFilter.some((brand: string) => title.toLowerCase().includes(brand.toLowerCase()));
			// const titleMatch = !titleFilter || title.toLowerCase().includes(titleFilter.toLowerCase());

			// Проверка соответствия AZS типов
			const azsOptionsMatch = azsTypes.length === 0 || azsTypes.some(type => types[type.value]);

			// Проверка соответствия дополнительных сервисов
			const matchingServices = addServices.length === 0 || filterObj(types, addServices);

			//@ts-ignore
			const matchingGate = !gateHeight || filters.gateHeight > gateHeight;

			if (
				fuelsMatch &&
				featuresMatch &&
				titleMatch &&
				azsOptionsMatch &&
				matchingServices &&
				matchingGate
			) {
				result.push(feature);
			}

			cursor = await cursor.continue();
		}

		return result;
	};

	// Фильтрация данных по типу через IndexedDB
	const filterDataByType = async (
		selectedFilter: number,
		filtersIsOpen: boolean
	): Promise<Feature[]> => {
		if (!db) return [];
		const tx = db.transaction('points', 'readonly');
		const store = tx.objectStore('points');
		const data = await store.getAll();

		return new Promise(resolve => {
			worker.postMessage({ data, selectedFilter, filtersIsOpen });
			worker.onmessage = event => resolve(event.data);
		});
	};

	const getBrands = async (): Promise<string[]> => {
		if (!db) return [];

		const tx = db.transaction('points', 'readonly');
		const store = tx.objectStore('points');
		const data = await store.getAll();

		// Создаем Set для уникальных значений
		const uniqueTitles = new Set<string>();

		data.forEach(item => {
			const title = item.title?.trim(); // Убираем пробелы
			if (title) {
				uniqueTitles.add(title); // Добавляем только если не пустой
			}
		});

		// Преобразуем Set в массив и сортируем в алфавитном порядке
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
		getDataById
	};
};
