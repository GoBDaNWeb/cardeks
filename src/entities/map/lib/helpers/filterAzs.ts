import { Feature } from '@/shared/types';

interface FilterAzs {
	objectManagerState: any;
	azsArr: Feature[];
	selectedFilter: number;
	filtersIsOpen: boolean;
}
export const filterAzs = ({
	objectManagerState,
	azsArr,
	selectedFilter,
	filtersIsOpen
}: FilterAzs) => {
	objectManagerState.removeAll();
	let filteredPoints = azsArr;
	if (selectedFilter === 0 && filtersIsOpen) {
		filteredPoints = azsArr.filter((marker: Feature) => marker.types.azs);
	} else if (selectedFilter === 1 && filtersIsOpen) {
		filteredPoints = azsArr.filter((marker: Feature) => marker.options.tire);
	} else if (selectedFilter === 2 && filtersIsOpen) {
		filteredPoints = azsArr.filter((marker: Feature) => marker.options.washing);
	}

	objectManagerState.add(filteredPoints);
};
