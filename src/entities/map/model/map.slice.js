import { getQueryParams } from '@/shared/lib';

import { createSlice } from '@reduxjs/toolkit';

const queryRoutes = getQueryParams(window.location.href).routes;

const initialState = {
	mapInfo: {
		zoom: 8,
		isWheel: false,
		mapType: 'yandex#map',
		panorama: false,
		panoramaIsOpen: false
	},
	routeInfo: {
		isSelectAddress: false,
		selectedAddress: '',
		routeCoords: [],
		currentPointId: null,
		pointFields: [],
		swapPoints: [],
		deletePointId: null,
		buildRoute: queryRoutes ? true : false,
		changeRoute: false,
		routeIsChanged: false,
		routeIsBuilded: false,
		routeAddresses: [],
		routeTime: '',
		routeLength: ''
	}
};

const mapSlice = createSlice({
	name: 'mapSlice',
	initialState,
	reducers: {
		setZoom(state, action) {
			state.mapInfo.zoom = action.payload;
		},
		handleWheel(state, action) {
			state.mapInfo.isWheel = action.payload;
		},
		setMapType(state, action) {
			state.mapInfo.mapType = action.payload;
		},
		setSelectAddress(state, action) {
			state.routeInfo.isSelectAddress = action.payload;
		},
		setAddress(state, action) {
			state.routeInfo.selectedAddress = action.payload;
		},
		setCoords(state, action) {
			state.routeInfo.routeCoords = action.payload;
		},
		setCurrentPointId(state, action) {
			state.routeInfo.currentPointId = action.payload;
		},
		setPointFields(state, action) {
			state.routeInfo.pointFields = action.payload;
		},
		setSwapPoints(state, action) {
			state.routeInfo.swapPoints = action.payload;
		},
		setDeletePointId(state, action) {
			state.routeInfo.deletePointId = action.payload;
		},
		setBuildRoute(state, action) {
			state.routeInfo.buildRoute = action.payload;
		},
		setRouteBuilded(state, action) {
			state.routeInfo.routeIsBuilded = action.payload;
		},
		setRouteAddresses(state, action) {
			state.routeInfo.routeAddresses = action.payload;
		},
		// setRouteAddresses(state, action) {
		// 	state.routeInfo.routeAddresses = [...state.routeInfo.routeAddresses, action.payload];
		// },
		clearRouteAddresses(state) {
			state.routeInfo.routeAddresses = [];
		},
		setRouteTime(state, action) {
			state.routeInfo.routeTime = action.payload;
		},
		setRouteLength(state, action) {
			state.routeInfo.routeLength = action.payload;
		},
		setChangeRoute(state, action) {
			state.routeInfo.changeRoute = action.payload;
		},
		setRouteChanged(state, action) {
			state.routeInfo.routeIsChanged = action.payload;
		},
		setPanorama(state, action) {
			state.mapInfo.panorama = action.payload;
		},
		setPanoramaOpen(state, action) {
			state.mapInfo.panoramaIsOpen = action.payload;
		}
	}
});

export const {
	setZoom,
	handleWheel,
	setMapType,
	setSelectAddress,
	setCoords,
	setAddress,
	setPointFields,
	setSwapPoints,
	setCurrentPointId,
	setDeletePointId,
	setBuildRoute,
	setRouteAddresses,
	setRouteBuilded,
	setRouteTime,
	setRouteLength,
	clearRouteAddresses,
	setChangeRoute,
	setRouteChanged,
	setPanorama,
	setPanoramaOpen
} = mapSlice.actions;
export default mapSlice.reducer;