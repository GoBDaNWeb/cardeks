import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	selectedFilter: 0,
	filtersIsOpen: false
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
		}
	}
});

export const { setSelectedFilter, setOpenFilters } = filters.actions;
export default filters.reducer;
