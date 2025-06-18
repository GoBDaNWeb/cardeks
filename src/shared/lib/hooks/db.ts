import Dexie from 'dexie';

import { Feature } from '@/shared/types';

export interface DataItem {
	id: string;
	name: string;
	flags: number[];
	latitude: number;
	longitude: number;
}

// Определение базы данных
class AppDatabase extends Dexie {
	points: Dexie.Table<Feature, string>;

	constructor() {
		super('azsDatabase');
		this.version(1).stores({
			points:
				'id, title, fuels, features, types, filters.gateHeight, *terminals, *geometry.coordinates.lat, *geometry.coordinates.lng, [geometry.coordinates.lat+geometry.coordinates.lng] '
		});
		this.points = this.table('points');
	}
}

export const db = new AppDatabase();
