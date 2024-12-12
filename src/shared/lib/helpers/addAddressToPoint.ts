import { Feature } from '@/shared/types';

const ymaps = window.ymaps;

export const addAddressToPoint = async (azsArr: Feature[]) => {
	const mappedFiltered = await Promise.all(
		azsArr.map(async item => {
			const address = await ymaps.geocode(item.geometry.coordinates).then((res: any) => {
				const firstGeoObject = res.geoObjects.get(0);
				const address = firstGeoObject.getAddressLine();
				return address;
			});
			return { ...item, address };
		})
	);
	return mappedFiltered;
};
