import Dexie, { Table } from 'dexie';

export interface DataItem {
	id: string;
	name: string;
	flags: number[];
	latitude: number;
	longitude: number;
}

// Определение базы данных
class AppDatabase extends Dexie {
	dataItems!: Table<DataItem, string>;

	constructor() {
		super('AppDatabase');
		this.version(1).stores({
			dataItems: 'id'
		});
	}
}

export const db = new AppDatabase();
