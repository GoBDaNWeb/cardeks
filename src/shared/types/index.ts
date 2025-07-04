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
	terminals?: string[];
	types: {
		[key: string]: boolean;
	};
	options: {
		[key: string]: boolean | number;
	};
	fuels: {
		[key: string]: boolean | number;
	};
	filters: {
		[key: string]: boolean | number;
	};
	features: {
		[key: string]: boolean | number;
	};
	addittional: {
		[key: string]: boolean | number;
	};
	isDisabled?: boolean;
	distance?: number;
	address?: string;
	region?: string;
	town?: string;
}
export interface IList {
	title: string;
	value: string;
}
export interface IBrand {
	name: string;
}
export interface IGPX {
	lat: number;
	lon: number;
	name: string;
}
export type ModalName = 'guide' | 'new-route' | 'download' | 'mail' | 'print' | 'review';
export type ModalProps = {
	isSucces?: boolean;
};

export interface IModal {
	currentModal: ModalName | null;
	props: ModalProps;
}
