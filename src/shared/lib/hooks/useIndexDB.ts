import { useEffect, useState } from 'react';

import { DBSchema, openDB } from 'idb';

import { Feature, IList } from '@/shared/types';

import { filterObj } from '../helpers';

// Определение схемы для базы данных
interface AppDB extends DBSchema {
	points: {
		key: string; // ID элемента
		value: Feature; // Данные, которые мы сохраняем
	};
}

export const useIndexedDB = () => {
	const [db, setDb] = useState<IDBDatabase | null>(null);

	// Инициализация базы данных
	useEffect(() => {
		const initDB = async () => {
			const database = await openDB<AppDB>('azsDatabase', 1, {
				upgrade(db) {
					db.createObjectStore('points', {
						keyPath: 'id',
						autoIncrement: false
					});
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

		data.forEach(item => {
			store.put(item); // Сохраняем данные в объект store
		});

		await tx.done;
	};

	// Получение всех данных из IndexedDB
	const getAllData = async (): Promise<Feature[]> => {
		if (!db) return [];

		const tx = db.transaction('points', 'readonly');
		const store = tx.objectStore('points');

		return await store.getAll(); // Получаем все данные
	};

	// Фильтрация данных по первому примеру
	const filterDataByOptions = async (
		filters: IList[] = [],
		titleFilter?: string,
		azsTypes: IList[] = [],
		addServices: string[] = [],
		gateHeight?: number
	): Promise<Feature[]> => {
		const data = await getAllData();
		return data.filter(item => {
			const { options, types, title } = item;

			// Проверка соответствия топлива
			const optionsMatch = filters.length === 0 || filters.every(filter => options[filter.value]);

			// Проверка соответствия заголовка
			const titleMatch = !titleFilter || title.toLowerCase().includes(titleFilter.toLowerCase());

			// Проверка соответствия AZS типов
			const azsOptionsMatch = azsTypes.length === 0 || azsTypes.some(type => options[type.value]);

			// Проверка соответствия дополнительных сервисов
			const matchingServices = addServices.length === 0 || filterObj(types, addServices);

			//@ts-ignore
			const matchingGate = !gateHeight || options.gateHeight > gateHeight;

			// Возвращаем результат проверки
			return optionsMatch && titleMatch && azsOptionsMatch && matchingServices && matchingGate;
		});
	};

	// Фильтрация данных по второму примеру
	const filterDataByType = async (
		selectedFilter: number,
		filtersIsOpen: boolean
	): Promise<Feature[]> => {
		const data = await getAllData();
		let filteredPoints = data;
		if (selectedFilter === 0 && filtersIsOpen) {
			filteredPoints = data.filter(item => item.types.azs);
		} else if (selectedFilter === 1 && filtersIsOpen) {
			filteredPoints = data.filter(item => item.options.tire);
		} else if (selectedFilter === 2 && filtersIsOpen) {
			filteredPoints = data.filter(item => item.options.washing);
		}

		return filteredPoints;
	};

	return {
		saveData,
		getAllData,
		filterDataByOptions,
		filterDataByType
	};
};
