import { Dispatch } from 'redux';

import { Feature } from '@/shared/types';

import { setCategoryTotals, setPoints } from '../../model';

export const getVisibleMarkers = async (map: any, objectManagerState: any, dispatch: Dispatch) => {
	if (!objectManagerState) return;
	const bounds = map.getBounds();

	const filteredMarkers: Feature[] = objectManagerState.objects.getAll();
	const visibleMarkers = filteredMarkers.filter(marker => {
		const coordinates = marker.geometry.coordinates;
		return (
			bounds[0][0] <= coordinates[0] &&
			coordinates[0] <= bounds[1][0] &&
			bounds[0][1] <= coordinates[1] &&
			coordinates[1] <= bounds[1][1]
		);
	});

	const visibleAzsPoints = visibleMarkers.filter(marker => marker.types?.azs);
	const visibleWashingPoints = visibleMarkers.filter(marker => marker.types?.washing);
	const visibleTirePoints = visibleMarkers.filter(marker => marker.types?.tire);

	dispatch(setCategoryTotals({ category: 'azs', totalView: visibleAzsPoints.length }));
	dispatch(setCategoryTotals({ category: 'points', totalView: visibleMarkers.length }));
	dispatch(setCategoryTotals({ category: 'washing', totalView: visibleWashingPoints.length }));
	dispatch(setCategoryTotals({ category: 'tire', totalView: visibleTirePoints.length }));
	dispatch(setPoints(visibleMarkers));
};
