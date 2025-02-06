import { Feature } from '@/shared/types';

interface FilterAzs {
	objectManagerState: any;
	azsArr: Feature[];
	selectedFilter: number;
	filtersIsOpen: boolean;
	handleLoading?: (bool: boolean) => void;
}
export const filterAzs = ({
	objectManagerState,
	azsArr,
	selectedFilter,
	filtersIsOpen,
	handleLoading
}: FilterAzs) => {
	if (handleLoading) {
		handleLoading(true);
	}
	objectManagerState.removeAll();
	let filteredPoints = azsArr;
	if (selectedFilter === 0 && filtersIsOpen) {
		filteredPoints = azsArr.filter((marker: Feature) => marker.types.azs);
	} else if (selectedFilter === 1 && filtersIsOpen) {
		filteredPoints = azsArr.filter((marker: Feature) => marker.types.tire);
	} else if (selectedFilter === 2 && filtersIsOpen) {
		filteredPoints = azsArr.filter((marker: Feature) => marker.types.washing);
	}
	objectManagerState.add(filteredPoints);
	if (handleLoading) {
		handleLoading(false);
	}
};
