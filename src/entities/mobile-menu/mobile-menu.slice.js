import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	activeMenu: null // search/filters/objects/route
};

const mobileMenuSlice = createSlice({
	name: 'mobileMenuSlice',
	initialState,
	reducers: {
		setActiveMenu(state, action) {
			state.activeMenu = action.payload;
		}
	}
});

export const { setActiveMenu } = mobileMenuSlice.actions;
export default mobileMenuSlice.reducer;
