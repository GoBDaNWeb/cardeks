import { toast } from 'react-toastify';

import { IList } from '@/shared/types';

const notify = () =>
	toast.success('Ссылка скопирована', {
		position: 'bottom-right',
		autoClose: 1500
	});

interface ICopyLink {
	routeCoords?: [number, number][];
	fixedCenter?: [number, number];
	zoom?: number;
	selectedFilter?: number | null;
	fuelFilters?: IList[];
	brandTitles?: string;
	addServices?: string[];
	terminal?: string;
	features?: IList[];
	gateHeight?: number;
	card?: string;
}

export const handleCopyLink = (params: ICopyLink) => {
	const currentHref = `${window.location.origin}?`;
	const urlParams = new URLSearchParams();
	const separator = '|';

	const addParam = (key: string, value: string | number) => {
		if (value !== undefined && value !== null) {
			urlParams.set(key, String(value));
		}
	};

	if (params.routeCoords?.length) {
		const routeResult = params.routeCoords.map(pair => pair.join('-')).join(';');
		addParam('routes', routeResult);
	}

	if (params.fixedCenter?.length === 2) {
		const centerResult = params.fixedCenter.join('-');
		addParam('center', centerResult);
	}

	if (params.zoom) {
		addParam('zoom', params.zoom);
	}
	if (params.selectedFilter !== null) {
		//@ts-ignore
		addParam('selectedFilter', params.selectedFilter);
	}

	if (params.fuelFilters?.length) {
		const fuelsResult = params.fuelFilters
			.map(fuel => `${encodeURIComponent(fuel.title)}${separator}${encodeURIComponent(fuel.value)}`)
			.join(';');
		addParam('fuels', fuelsResult);
	}
	if (params.brandTitles?.length) {
		const brandsResult = params.brandTitles;
		addParam('brands', brandsResult);
	}
	if (params.addServices?.length) {
		const addServicesResult = params.addServices.join('-');
		addParam('addServices', addServicesResult);
	}
	if (params.terminal?.length) {
		const terminalResult = params.terminal;
		addParam('terminal', terminalResult);
	}
	if (params.gateHeight) {
		const gateHeightResult = params.gateHeight;
		addParam('gateHeight', gateHeightResult);
	}
	if (params.card) {
		const cardResult = params.card;
		addParam('card', cardResult);
	}

	if (params.features?.length) {
		const featuresResult = params.features
			.map(
				feature =>
					`${encodeURIComponent(feature.title)}${separator}${encodeURIComponent(feature.value)}`
			)
			.join(';');
		addParam('features', featuresResult);
	}

	const resultLink = currentHref + urlParams.toString();

	navigator.clipboard.writeText(resultLink);

	notify();
};
