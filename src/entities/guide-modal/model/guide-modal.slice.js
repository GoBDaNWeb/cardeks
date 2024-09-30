import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	isOpen: false
};

const guideModalSlice = createSlice({
	name: 'guideModalSlice',
	initialState,
	reducers: {
		handleOpenModal(state, action) {
			state.isOpen = action.payload;
		}
	}
});

export const { handleOpenModal } = guideModalSlice.actions;
export default guideModalSlice.reducer;
