import { Feature, IList } from '@/shared/types';

self.onmessage = async function (event) {
	const {
		withFilters,
		features,
		lines,
		threshold,
		routeCoords,
		filters,
		filteredDataType,
		selectedFilter
	} = event.data;
	let filteredData;
	const filterObj = (obj: any, filterArray: any) => {
		for (const key in obj) {
			if (filterArray.includes(key)) {
				if (obj[key] !== true) {
					return false;
				}
			} else {
				if (obj[key] !== false) {
					return false;
				}
			}
		}
		return true;
	};

	const filterByType = async (features: Feature[], selectedFilter: number) => {
		let filteredData = features;
		if (selectedFilter === 0) {
			filteredData = features.filter((item: Feature) => item.types?.azs);
		} else if (selectedFilter === 1) {
			filteredData = features.filter((item: Feature) => item.types?.tire);
		} else if (selectedFilter === 2) {
			filteredData = features.filter((item: Feature) => item.types?.washing);
		}
		// Если нет результатов, вернуть все объекты
		if (filteredData.length === 0) {
			filteredData = features;
		}
		return filteredData;
	};
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
		const data: Feature[] = features;

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
	const filtered = async () => {
		const filteredDataType = await filterByType(features, selectedFilter);
		const filteredData = await filterDataByOptions(
			filters.fuelFilters,
			filters.features,
			filters.brandTitles,
			[],
			filters.addServices,
			filters.gateHeight,
			filters.terminal,
			filteredDataType,
			filters.card
		);
		return filteredData;
	};
	if (withFilters) {
		const newFilteredPoints = await filtered();

		filteredData = newFilteredPoints;
	} else {
		filteredData = 10;
	}
	self.postMessage(filteredData);
};
