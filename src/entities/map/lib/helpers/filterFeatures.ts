import { filterObj } from '@/shared/lib';
import { Feature, IList } from '@/shared/types';

export const filterFeatures = (
	features: Feature[],
	filters: IList[] = [],
	titleFilter?: string,
	azsTypes: IList[] = [],
	addServices: string[] = [],
	gateHeight?: number
): Feature[] => {
	return features.filter(feature => {
		const { options, types, title } = feature;

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
