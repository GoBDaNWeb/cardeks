import { createSlice } from '@reduxjs/toolkit';

type Filters = {
	brandTitles: string;
	azsTypes: number[];
};
interface IRouteForm {
	filterActive: boolean;
	addSettings: number[];
	withFilters: boolean;
	filters: Filters;
}
const initialState: IRouteForm = {
	filterActive: false,
	addSettings: [],
	withFilters: true,
	filters: {
		brandTitles: '',
		azsTypes: []
	}
};

const routeForm = createSlice({
	name: 'routeFormSlice',
	initialState,
	reducers: {
		setFilterActive(state, action) {
			state.filterActive = action.payload;
		},
		setAddSettings(state, action) {
			state.addSettings = action.payload;
		},
		setBrandTitles(state, action) {
			state.filters.brandTitles = action.payload;
		},
		setWithFilters(state, action) {
			state.withFilters = action.payload;
		},
		setAzsTypes(state, action) {
			state.filters.azsTypes = action.payload;
		},
		clearFilters(state) {
			state.filters.brandTitles = '';
			state.filters.azsTypes = [];
		}
	}
});

export const {
	setFilterActive,
	setBrandTitles,
	setAddSettings,
	setWithFilters,
	setAzsTypes,
	clearFilters
} = routeForm.actions;
export default routeForm.reducer;
