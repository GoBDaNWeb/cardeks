import { MapTypes } from '@/shared/types';

interface ILayers {
	title: string;
	type: MapTypes;
}

export const layers: ILayers[] = [
	{
		title: 'Схема',
		type: 'yandex#map'
	},
	{
		title: 'Спутник',
		type: 'yandex#satellite'
	},
	{
		title: 'Гибрид',
		type: 'yandex#hybrid'
	}
];
