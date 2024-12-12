import { createSlice } from '@reduxjs/toolkit';

type Filters = {
	brandTitle: string;
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
		brandTitle: '',
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
		setBrandTitle(state, action) {
			state.filters.brandTitle = action.payload;
		},
		setWithFilters(state, action) {
			state.withFilters = action.payload;
		},
		setAzsTypes(state, action) {
			state.filters.azsTypes = action.payload;
		},
		clearFilters(state) {
			state.filters.brandTitle = '';
			state.filters.azsTypes = [];
		}
	}
});

export const {
	setFilterActive,
	setBrandTitle,
	setAddSettings,
	setWithFilters,
	setAzsTypes,
	clearFilters
} = routeForm.actions;
export default routeForm.reducer;
