export const getQueryParams = (url: string) => {
	const params: any = {};
	const queryString = url.split('?')[1];

	if (queryString) {
		queryString.split('&').forEach(param => {
			const [key, value] = param.split('=');
			params[key] = decodeURIComponent(value);
		});
	}

	return params;
};
