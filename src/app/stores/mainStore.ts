import { filtersReducer } from '@/widgets/filters';
import { menuReducer } from '@/widgets/menu-list';
import { settingsMapMenuReducer } from '@/widgets/settings-map-menu';

import { routeFormReducer } from '@/features/route-form';

import { mapReducer } from '@/entities/map';
import { mobileMenuReducer } from '@/entities/mobile-menu';
import { objectInfoReducer } from '@/entities/object-info';

import { cardeksAPI, cardeksPointsAPI, cardeksRoutePoints } from '@/shared/api';
import { modalReducer } from '@/shared/ui';

import { combineReducers, configureStore } from '@reduxjs/toolkit';

const mainReducer = combineReducers({
	map: mapReducer,
	menu: menuReducer,
	routeForm: routeFormReducer,
	filters: filtersReducer,
	mobileMenu: mobileMenuReducer,
	settingsMapMenu: settingsMapMenuReducer,
	objectInfo: objectInfoReducer,
	modals: modalReducer,
	[cardeksAPI.reducerPath]: cardeksAPI.reducer,
	[cardeksPointsAPI.reducerPath]: cardeksPointsAPI.reducer,
	[cardeksRoutePoints.reducerPath]: cardeksRoutePoints.reducer
});

export const mainStore = configureStore({
	reducer: mainReducer,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware().concat(
			cardeksAPI.middleware,
			cardeksPointsAPI.middleware,
			cardeksRoutePoints.middleware
		)
});

export type RootState = ReturnType<typeof mainStore.getState>;
