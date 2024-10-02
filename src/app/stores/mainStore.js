import { filtersReducer } from '@/widgets/filters';
import { menuReducer } from '@/widgets/menu-list';

import { downloadModalReducer } from '@/features/download-modal';
import { mailModalReducer } from '@/features/mail-modal';
import { reviewModalSlice } from '@/features/review-modal';
import { routeFormReducer } from '@/features/route-form';

import { guideModalSlice } from '@/entities/guide-modal';
import { mapReducer } from '@/entities/map';
import { newRouteModalReducer } from '@/entities/new-route-modal';

import { cardeksAPI } from '@/shared/api';

import { combineReducers, configureStore } from '@reduxjs/toolkit';

const mainReducer = combineReducers({
	map: mapReducer,
	menu: menuReducer,
	routeForm: routeFormReducer,
	reviewModal: reviewModalSlice,
	guideModal: guideModalSlice,
	newRouteModal: newRouteModalReducer,
	filters: filtersReducer,
	downloadModal: downloadModalReducer,
	mailModal: mailModalReducer,
	[cardeksAPI.reducerPath]: cardeksAPI.reducer
});

export const mainStore = configureStore({
	reducer: mainReducer,
	middleware: getDefaultMiddleware => getDefaultMiddleware().concat(cardeksAPI.middleware)
});
