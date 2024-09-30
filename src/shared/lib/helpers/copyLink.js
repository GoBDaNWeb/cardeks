import { toast } from 'react-toastify';

import { getQueryParams } from '@/shared/lib';

const notify = () =>
	toast.success('Ссылка скопирована', {
		position: 'bottom-right',
		autoClose: 1500
	});

export const handleCopyLink = routeAddresses => {
	const currentHref = `${window.location.href}?`;
	const routes = `routes=${routeAddresses.join(';')}`;
	const resultLink = currentHref + routes;
	console.log(window.location);
	console.log(decodeURIComponent(window.location.search));
	console.log(getQueryParams(window.location.href));
	// navigator.clipboard.writeText(resultLink);
	navigator.clipboard.writeText(encodeURI(resultLink));
	notify();
};
