import { createSlice } from '@reduxjs/toolkit';

interface ISettings {
	openSettings: boolean;
	getLocation: boolean;
}

const initialState: ISettings = {
	openSettings: false,
	getLocation: false
};

const settingsMapMenuSlice = createSlice({
	name: 'mobileMenuSlice',
	initialState,
	reducers: {
		setOpenSettings(state, action) {
			state.openSettings = action.payload;
		},
		setGetLocation(state, action) {
			state.getLocation = action.payload;
		}
	}
});

export const { setOpenSettings, setGetLocation } = settingsMapMenuSlice.actions;
export default settingsMapMenuSlice.reducer;
