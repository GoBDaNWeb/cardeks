import { IClusterPlacemarkOptions, IClusterPlacemarkProperties, IPointGeometry } from 'yandex-maps';

export type FieldType = {
	name: string;
	value: string;
	onChange: () => void;
	onBlur: () => void;
};
export type ActiveMenu = 'search' | 'filters' | 'objects' | 'route' | null;
export type MapTypes = 'yandex#map' | 'yandex#satellite' | 'yandex#hybrid';

export interface IModalState {
	isOpen: boolean;
}
export type ResultsType = {
	distance: {
		text: string;
		value: number;
	};
	tags: string[];
	title: {
		text: string;
	};
	subtitle?: {
		text: string;
	};
};
export interface IAddresses {
	suggest_reqid: string;
	results: ResultsType[];
}
export interface IPlacemark {
	geometry: number[] | object | IPointGeometry;
	properties: IClusterPlacemarkProperties;
	options?: IClusterPlacemarkOptions;
}
export interface Feature {
	type: string;
	id: number;
	title: string;
	geometry: { type: string; coordinates: [number, number] };
	properties: {
		balloonContent: string;
		clusterCaption: string;
		hintContent: string;
	};
	types: {
		[key: string]: boolean;
	};
	options: {
		[key: string]: boolean | number;
	};
	distance?: number;
	address?: string;
}
export interface IList {
	title: string;
	value: string;
}
