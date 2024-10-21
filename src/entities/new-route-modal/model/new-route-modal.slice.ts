import { IModalState } from '@/shared/types';

import { createSlice } from '@reduxjs/toolkit';

interface IRouteModalState extends IModalState {
	isSuccess: boolean;
}
const initialState: IRouteModalState = {
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
