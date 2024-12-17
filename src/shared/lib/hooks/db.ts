import Dexie, { Table } from 'dexie';

// Тип данных
export interface DataItem {
	id: string; // Первый элемент массива
	name: string; // Второй элемент массива
	flags: number[]; // Остальные элементы, кроме координат
	latitude: number;
	longitude: number;
}

// Определение базы данных
class AppDatabase extends Dexie {
	dataItems!: Table<DataItem, string>; // Таблица с id как ключом

	constructor() {
		super('AppDatabase');
		this.version(1).stores({
			dataItems: 'id' // Индексируем id
		});
	}
}

export const db = new AppDatabase();
