import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	isOpen: false,
	isSuccess: false
};

const newRouteModalSlice = createSlice({
	name: 'newRouteModalSlice',
	initialState,
	reducers: {
		handleOpenModal(state, action) {
			state.isOpen = action.payload;
		},
		handleSuccess(state, action) {
			state.isSuccess = action.payload;
		}
	}
});

export const { handleOpenModal, handleSuccess } = newRouteModalSlice.actions;
export default newRouteModalSlice.reducer;
