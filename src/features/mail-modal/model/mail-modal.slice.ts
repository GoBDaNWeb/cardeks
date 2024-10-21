import { IModalState } from '@/shared/types';

import { createSlice } from '@reduxjs/toolkit';

const initialState: IModalState = {
	isOpen: false
};

const mailModalSlice = createSlice({
	name: 'mailModalSlice',
	initialState,
	reducers: {
		handleOpenModal(state, action) {
			state.isOpen = action.payload;
		}
	}
});

export const { handleOpenModal } = mailModalSlice.actions;
export default mailModalSlice.reducer;
