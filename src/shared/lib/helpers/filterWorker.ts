import { Feature } from '@/shared/types';

self.onmessage = function (event) {
	const { data, selectedFilter } = event.data;
	let filteredData = data;
	if (selectedFilter === 0) {
		filteredData = data.filter((item: Feature) => item.types?.azs);
	} else if (selectedFilter === 1) {
		filteredData = data.filter((item: Feature) => item.types?.tire);
	} else if (selectedFilter === 2) {
		filteredData = data.filter((item: Feature) => item.types?.washing);
	}
	// Если нет результатов, вернуть все объекты
	if (filteredData.length === 0) {
		filteredData = data;
	}
	// Отправляем данные обратно в основной поток
	self.postMessage(filteredData);
};
