export const getQueryParams = () => {
	const params = new URLSearchParams(window.location.search);
	const separator = '|';

	return {
		routesParam: params
			.get('routes')
			?.split(';')
			.map(str => str.split('-').map(Number)),
		zoomParam: params.get('zoom'),
		fuelsParam: params
			.get('fuels')
			?.split(';')
			.map(entry => {
				const [title, value] = entry.split(separator).map(decodeURIComponent);
				return { title, value };
			}),
		brandsParam: params.get('brands'),
		selectedFilterParam: params.get('selectedFilter'),
		addServicesParam: params.get('addServices')?.split('-'),
		terminalParam: params.get('terminal'),
		featuresParam: params
			.get('features')
			?.split(';')
			.map(entry => {
				const [title, value] = entry.split(separator).map(decodeURIComponent);
				return { title, value };
			}),
		gateHeightParam: params.get('gateHeight'),
		cardParam: params.get('card')
	};
};
