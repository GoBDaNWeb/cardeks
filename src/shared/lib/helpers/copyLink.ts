import { toast } from 'react-toastify';

import { getQueryParams } from '@/shared/lib';

const notify = () =>
	toast.success('Ссылка скопирована', {
		position: 'bottom-right',
		autoClose: 1500
	});

export const handleCopyLink = (routeCoords: number[]) => {
	const currentHref = `${window.location.origin}?`;
	const result = routeCoords
		//@ts-ignore
		.map(pair => pair.join('-'))
		.join(';');
	const routes = `routes=${result}`;
	const resultLink = currentHref + routes;
	console.log(window.location);
	console.log(decodeURIComponent(window.location.search));
	console.log(getQueryParams(window.location.href));
	// navigator.clipboard.writeText(resultLink);
	navigator.clipboard.writeText(encodeURI(resultLink));
	notify();
};
