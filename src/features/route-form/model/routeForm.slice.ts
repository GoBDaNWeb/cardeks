import { createSlice } from '@reduxjs/toolkit';

interface IRouteForm {
	filterActive: boolean;
}
const initialState: IRouteForm = {
	filterActive: false
};

const routeForm = createSlice({
	name: 'routeFormSlice',
	initialState,
	reducers: {
		setFilterActive(state, action) {
			state.filterActive = action.payload;
		}
	}
});

export const { setFilterActive } = routeForm.actions;
export default routeForm.reducer;
