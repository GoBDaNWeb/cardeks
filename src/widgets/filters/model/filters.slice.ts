import { IList } from '@/shared/types';

import { createSlice } from '@reduxjs/toolkit';

type FiltersType = {
	fuelFilters: IList[];
	features: IList[];
	brandTitles: string[];
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
		brandTitles: [],
		addServices: [],
		features: [],
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
		setBrandTitles(state, action) {
			state.filters.brandTitles = action.payload;
		},
		setGateHeight(state, action) {
			state.filters.gateHeight = action.payload;
		},
		setFeatures(state, action) {
			state.filters.features = action.payload;
		}
	}
});

export const {
	setSelectedFilter,
	setOpenFilters,
	setFuelFilters,
	setAddServices,
	setGateHeight,
	setBrandTitles,
	setFeatures
} = filters.actions;
export default filters.reducer;
