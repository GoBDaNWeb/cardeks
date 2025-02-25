import { Feature } from '@/shared/types';

const ymaps = window.ymaps;

export const getAzsOnRoute = async (
	azsArr: Feature[],
	lines: any,
	threshold: number = 500,
	firstRouteCoord: number[]
) => {
	if (!firstRouteCoord) {
		return [];
	}
	const filtered = azsArr.filter(el => {
		const coords = el.geometry.coordinates;

		const isNearSomeRoute = lines.toArray().some((line: any) => {
			const closest = line.geometry.getClosest(coords);
			return closest.distance < threshold;
		});
		return isNearSomeRoute;
	});
	const mappedFiltered = await Promise.all(
		filtered.map(async item => {
			const distance = ymaps.coordSystem.geo.getDistance(
				firstRouteCoord,
				item.geometry.coordinates
			);
			return { ...item, distance };
		})
	);

	return mappedFiltered;
};
