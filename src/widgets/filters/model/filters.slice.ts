import { IList } from '@/shared/types';

import { createSlice } from '@reduxjs/toolkit';

type FiltersType = {
	fuelFilters: IList[];
	brandTitle: string;
	addServices: string[];
	gateHeight: number | null;
};

interface IFilters {
	selectedFilter: number;
	filtersIsOpen: boolean;
	filters: FiltersType;
}
const initialState: IFilters = {
	selectedFilter: 0,
	filtersIsOpen: false,
	filters: {
		fuelFilters: [],
		brandTitle: '',
		addServices: [],
		gateHeight: null
	}
};

const filters = createSlice({
	name: 'filtersSlice',
	initialState,
	reducers: {
		setSelectedFilter(state, action) {
			state.selectedFilter = action.payload;
		},
		setOpenFilters(state, action) {
			state.filtersIsOpen = action.payload;
		},
		setFuelFilters(state, action) {
			state.filters.fuelFilters = action.payload;
		},
		setAddServices(state, action) {
			state.filters.addServices = action.payload;
		},
		setBrandTitle(state, action) {
			state.filters.brandTitle = action.payload;
		},
		setGateHeight(state, action) {
			state.filters.gateHeight = action.payload;
		}
	}
});

export const {
	setSelectedFilter,
	setOpenFilters,
	setFuelFilters,
	setAddServices,
	setGateHeight,
	setBrandTitle
} = filters.actions;
export default filters.reducer;
