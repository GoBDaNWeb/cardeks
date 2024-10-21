import { IModalState } from '@/shared/types';

import { createSlice } from '@reduxjs/toolkit';

const initialState: IModalState = {
	isOpen: false
};

const reviewModalSlice = createSlice({
	name: 'reviewModalSlice',
	initialState,
	reducers: {
		handleOpenModal(state, action) {
			state.isOpen = action.payload;
		}
	}
});

export const { handleOpenModal } = reviewModalSlice.actions;
export default reviewModalSlice.reducer;
