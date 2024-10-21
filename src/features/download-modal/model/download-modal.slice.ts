import { IModalState } from '@/shared/types';

import { createSlice } from '@reduxjs/toolkit';

const initialState: IModalState = {
	isOpen: false
};

const downloadModalSlice = createSlice({
	name: 'downloadModalSlice',
	initialState,
	reducers: {
		handleOpenModal(state, action) {
			state.isOpen = action.payload;
		}
	}
});

export const { handleOpenModal } = downloadModalSlice.actions;
export default downloadModalSlice.reducer;
