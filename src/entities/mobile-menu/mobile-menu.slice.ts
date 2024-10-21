import { ActiveMenu } from '@/shared/types';

import { createSlice } from '@reduxjs/toolkit';

interface IMenuState {
	activeMenu: ActiveMenu; // Указывает на тип открытого меню
}
const initialState: IMenuState = {
	activeMenu: null
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
