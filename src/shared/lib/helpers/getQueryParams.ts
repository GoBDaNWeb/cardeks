export const getQueryParams = (url?: string) => {
	const params = new URLSearchParams(window.location.search);
	const zoomParam = params.get('zoom');
	const routes = params.get('routes');
	const brands = params.get('brands');
	const addServices = params.get('addServices');
	const selectedFilterParam = params.get('selectedFilter');
	const terminal = params.get('terminal');
	const features = params.get('features');
	const fuels = params.get('fuels');
	const card = params.get('card');
	const gateHeight = params.get('gateHeight');
	const separator = '|';

	const fuelsParam = fuels?.split(';').map(entry => {
		const [title, value] = entry.split(separator).map(decodeURIComponent);
		return { title, value };
	});
	const featuresParam = features?.split(';').map(entry => {
		const [title, value] = entry.split(separator).map(decodeURIComponent);
		return { title, value };
	});

	const routesParam = routes?.split(';').map((str: any) => {
		return str.split('-').map(Number);
	});
	const brandsParam = brands?.split('-');
	const addServicesParam = addServices?.split('-');
	const terminalParam = terminal;
	const gateHeightParam = gateHeight;
	const cardParam = card;

	return {
		routesParam,
		zoomParam,
		fuelsParam,
		brandsParam,
		selectedFilterParam,
		addServicesParam,
		terminalParam,
		featuresParam,
		gateHeightParam,
		cardParam
	};
};
