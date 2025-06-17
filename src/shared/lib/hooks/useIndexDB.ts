// @ts-nocheck
import { useEffect, useState } from 'react';

import { DBSchema } from 'idb';

import { Feature, IList } from '@/shared/types';

import { filterObj } from '../helpers';

import { db } from './db';

const ymaps = window.ymaps;

interface AppDB extends DBSchema {
	points: {
		key: string;
		value: Feature;
	};
}

const cache = new Map<string, Feature>();

export const useIndexedDB = () => {
	const [isDbReady, setIsDbReady] = useState(false);
	const [brandsCache, setBrandsCache] = useState<string[] | null>(null);

	useEffect(() => {
		setIsDbReady(true);
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
		selectedFilter: number,
		relatedProducts: boolean,
		points?: Feature[]
	): Promise<Feature[]> => {
		const applyFilters = (items: Feature[]) =>
			items.filter(
				({ types, features, title, fuels: featureFuels, filters, terminals, addittional }) => {
					return (
						(fuels.length === 0 || fuels.every(fuel => featureFuels?.[fuel.value])) &&
						(featuresList.length === 0 || featuresList.every(f => features?.[f.value])) &&
						(azsTypes.length === 0 || azsTypes.some(type => types?.[type.value])) &&
						(addServices.length === 0 || filterObj(types, addServices)) &&
						(!gateHeight || (filters?.gateHeight ?? 0) > gateHeight) &&
						(!terminal.trim() || terminals?.some(t => t.trim().includes(terminal.trim()))) &&
						(!titleFilter?.length ||
							titleFilter.some(brand => title.toLowerCase().includes(brand.toLowerCase()))) &&
						(!card ||
							card.length === 0 ||
							(card === 'Лукойл'
								? ['Лукойл', 'Тебойл'].includes(title)
								: card === 'Кардекс'
									? !['Лукойл', 'Тебойл'].includes(title)
									: true)) &&
						(!relatedProducts || addittional?.relatedProducts === relatedProducts)
					);
				}
			);

		const applySelectedFilter = (items: Feature[]) =>
			items.filter(item => {
				if (selectedFilter === 0) return item.types?.azs;
				if (selectedFilter === 1) return item.types?.tire;
				if (selectedFilter === 2) return item.types?.washing;
				return true;
			});

		if (points && points.length) {
			return applyFilters(applySelectedFilter(points));
		} else {
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
				({ types, features, title, fuels: featureFuels, filters, terminals, addittional }) => {
					return (
						(fuels.length === 0 || fuels.every(fuel => featureFuels?.[fuel.value])) &&
						(featuresList.length === 0 || featuresList.every(f => features?.[f.value])) &&
						(azsTypes.length === 0 || azsTypes.some(type => types?.[type.value])) &&
						(addServices.length === 0 || filterObj(types, addServices)) &&
						(!gateHeight || (filters?.gateHeight ?? 0) > gateHeight) &&
						(!terminal.trim() || terminals?.some(t => t.trim().includes(terminal.trim()))) &&
						(!titleFilter?.length ||
							titleFilter.some(brand => title.toLowerCase().includes(brand.toLowerCase()))) &&
						(!card ||
							card.length === 0 ||
							(card === 'Лукойл'
								? ['Лукойл', 'Тебойл'].includes(title)
								: card === 'Кардекс'
									? !['Лукойл', 'Тебойл'].includes(title)
									: true)) &&
						(!relatedProducts || addittional?.relatedProducts === relatedProducts)
					);
				}
			);

			return await query.toArray();
		}
	};

	const getBrands = async (): Promise<string[]> => {
		if (brandsCache) return brandsCache;
		const uniqueTitles = await db.points.orderBy('title').uniqueKeys();
		const sortedTitles = uniqueTitles.map(String).sort();
		setBrandsCache(sortedTitles);
		return sortedTitles;
	};

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
		getBrands,
		getDataById,
		isDbReady
	};
};
