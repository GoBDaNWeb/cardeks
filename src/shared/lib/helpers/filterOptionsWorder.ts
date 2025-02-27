import { IList } from '@/shared/types';

self.onmessage = function (event) {
	const {
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
	} = event.data;

	type Options = {
		title: string;
		fuels: {
			[key: string]: boolean;
		};
		addServices: string[];
		terminals: string[];
		types: {
			[key: string]: boolean;
		};
		features: {
			[key: string]: boolean;
		};
		filters: {
			[key: string]: boolean;
		};
	};
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

	let resultData = data.filter(
		({ types, features, title, fuels: featureFuels, filters, terminals }: Options) =>
			(fuels.length === 0 || fuels.every((fuel: IList) => featureFuels[fuel.value])) &&
			(featuresList.length === 0 || featuresList.every((f: IList) => features[f.value])) &&
			(azsTypes.length === 0 || azsTypes.some((type: IList) => types[type.value])) &&
			((addServices && addServices.length === 0) || filterObj(types, addServices)) &&
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
	// Отправляем данные обратно в основной поток
	self.postMessage(resultData);
};
