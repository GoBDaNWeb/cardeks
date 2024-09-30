import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	activeMenu: null
};

const menuSlice = createSlice({
	name: 'menuSlice',
	initialState,
	reducers: {
		setActiveMenu(state, action) {
			state.activeMenu = action.payload;
		},
		clearActiveMenu(state) {
			state.activeMenu = null;
		}
	}
});

export const { setActiveMenu, clearActiveMenu } = menuSlice.actions;
export default menuSlice.reducer;
