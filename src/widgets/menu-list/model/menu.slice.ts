import { ActiveMenu } from '@/shared/types';

import { createSlice } from '@reduxjs/toolkit';

interface IMenu {
	activeMenu: ActiveMenu;
}
const initialState: IMenu = {
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
