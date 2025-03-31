import { getQueryParams } from '@/shared/lib';
import { IList } from '@/shared/types';

import { createSlice } from '@reduxjs/toolkit';

const {
	fuelsParam,
	brandsParam,
	addServicesParam,
	terminalParam,
	featuresParam,
	gateHeightParam,
	cardParam
} = getQueryParams();
type FiltersType = {
	fuelFilters: IList[];
	features: IList[];
	brandTitles: string;
	addServices: string[];
	gateHeight: number | null;
	terminal: string;
	card: string;
	relatedProducts: boolean;
};

interface IFilters {
	selectedFilter: number | null;
	filtersIsOpen: boolean;
	clearFilters: boolean;
	filters: FiltersType;
}
const initialState: IFilters = {
	selectedFilter: null,
	filtersIsOpen: false,
	clearFilters: false,
	filters: {
		card: cardParam ? cardParam : '',
		fuelFilters: fuelsParam && fuelsParam.length > 0 ? fuelsParam : [],
		brandTitles: brandsParam && brandsParam.length > 0 ? brandsParam : '',
		addServices: addServicesParam && addServicesParam.length > 0 ? addServicesParam : [],
		features: featuresParam && featuresParam.length > 0 ? featuresParam : [],
		gateHeight: gateHeightParam ? +gateHeightParam : null,
		terminal: terminalParam && terminalParam ? terminalParam : '',
		relatedProducts: false
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
		setСlearFilters(state, action) {
			state.clearFilters = action.payload;
		},
		setFuelFilters(state, action) {
			state.filters.fuelFilters = action.payload;
		},
		setAddServices(state, action) {
			state.filters.addServices = action.payload;
		},
		setRelatedProducts(state, action) {
			state.filters.relatedProducts = action.payload;
		},
		setBrandTitles(state, action) {
			state.filters.brandTitles = action.payload;
		},
		setGateHeight(state, action) {
			state.filters.gateHeight = action.payload;
		},
		setFeatures(state, action) {
			state.filters.features = action.payload;
		},
		setTerminal(state, action) {
			state.filters.terminal = action.payload;
		},
		setCard(state, action) {
			state.filters.card = action.payload;
		}
	}
});

export const {
	setSelectedFilter,
	setOpenFilters,
	setСlearFilters,
	setFuelFilters,
	setAddServices,
	setGateHeight,
	setBrandTitles,
	setFeatures,
	setTerminal,
	setCard,
	setRelatedProducts
} = filters.actions;
export default filters.reducer;
