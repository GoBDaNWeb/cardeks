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
type ResultsType = {
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
	results?: ResultsType[];
}
export interface IPlacemark {
	geometry: number[] | object | IPointGeometry;
	properties: IClusterPlacemarkProperties;
	options?: IClusterPlacemarkOptions;
}
