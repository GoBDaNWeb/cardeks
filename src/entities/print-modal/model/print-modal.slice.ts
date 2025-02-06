import { IModalState } from '@/shared/types';

import { createSlice } from '@reduxjs/toolkit';

interface IPrintModalState extends IModalState {
	isSuccess: boolean;
}
const initialState: IPrintModalState = {
	isOpen: false,
	isSuccess: false
};

const printModalSlice = createSlice({
	name: 'printModalSlice',
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

export const { handleOpenModal, handleSuccess } = printModalSlice.actions;
export default printModalSlice.reducer;
