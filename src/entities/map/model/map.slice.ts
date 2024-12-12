import { getQueryParams } from '@/shared/lib';
import { Feature, MapTypes } from '@/shared/types';

import { createSlice } from '@reduxjs/toolkit';

const queryRoutes = getQueryParams(window.location.href).routes;

interface ISearchInfo {
	search: boolean;
	searchValue: string;
	buildSearch: boolean;
}

interface IMapInfo {
	zoom: number;
	isWheel: boolean;
	mapType: MapTypes;
	panorama: boolean;
	panoramaIsOpen: boolean;
	totalPoints: number;
	totalViewPoints: number;
	totalWashing: number;
	totalViewWashing: number;
	totalTire: number;
	totalViewTire: number;
	totalAzsPoints: number;
	totalViewAzsPoints: number;
	points: Feature[];
	center: number[];
	mapLoading: boolean;
}

interface IRouteInfo {
	isSelectAddress: boolean;
	selectedAddress: string;
	routeCoords: number[][];
	currentPointId: string | null;
	fieldsCount: number;
	swapPoints: string[];
	deletePointId: string | null;
	buildRoute: boolean;
	changeRoute: boolean;
	routeIsChanged: boolean;
	routeIsBuilded: boolean;
	routeAddresses: string[];
	routeTime: string;
	routeLength: string;
	azsOnRoute: number;
	pointsOnRoute: number;
	isUrlBuild: boolean;
}

interface IRootState {
	searchInfo: ISearchInfo;
	mapInfo: IMapInfo;
	routeInfo: IRouteInfo;
}

const initialState: IRootState = {
	searchInfo: {
		search: false,
		searchValue: '',
		buildSearch: false
	},
	mapInfo: {
		zoom: 8,
		isWheel: false,
		mapType: 'yandex#map',
		panorama: false,
		panoramaIsOpen: false,
		totalPoints: 0,
		totalViewPoints: 0,
		totalWashing: 0,
		totalViewWashing: 0,
		totalTire: 0,
		totalViewTire: 0,
		totalAzsPoints: 0,
		totalViewAzsPoints: 0,
		points: [],
		center: [],
		mapLoading: true
	},
	routeInfo: {
		isSelectAddress: false,
		selectedAddress: '',
		routeCoords: [],
		currentPointId: null,
		fieldsCount: 2,
		swapPoints: [],
		deletePointId: null,
		buildRoute: queryRoutes ? true : false,
		changeRoute: false,
		routeIsChanged: false,
		routeIsBuilded: false,
		routeAddresses: [],
		routeTime: '',
		routeLength: '',
		azsOnRoute: 0,
		pointsOnRoute: 0,
		isUrlBuild: false
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
		setTotalPoints(state, action) {
			state.mapInfo.totalPoints = action.payload;
		},
		setTotalViewPoints(state, action) {
			state.mapInfo.totalViewPoints = action.payload;
		},
		setPoints(state, action) {
			state.mapInfo.points = action.payload;
		},
		setTotalWashing(state, action) {
			state.mapInfo.totalWashing = action.payload;
		},
		setTotalViewWashing(state, action) {
			state.mapInfo.totalViewWashing = action.payload;
		},
		setMapLoading(state, action) {
			state.mapInfo.mapLoading = action.payload;
		},
		setTotalTire(state, action) {
			state.mapInfo.totalTire = action.payload;
		},
		setTotalViewTire(state, action) {
			state.mapInfo.totalViewTire = action.payload;
		},
		setTotalAzs(state, action) {
			state.mapInfo.totalAzsPoints = action.payload;
		},
		setTotalViewAzs(state, action) {
			state.mapInfo.totalViewAzsPoints = action.payload;
		},
		setPointsOnRoute(state, action) {
			state.routeInfo.pointsOnRoute = action.payload;
		},
		setMapType(state, action) {
			state.mapInfo.mapType = action.payload;
		},
		setSelectAddress(state, action) {
			state.routeInfo.isSelectAddress = action.payload;
		},
		setCenter(state, action) {
			state.mapInfo.center = action.payload;
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
		setIsUrlBuid(state, action) {
			state.routeInfo.isUrlBuild = action.payload;
		},
		setRouteAddresses(state, action) {
			state.routeInfo.routeAddresses = action.payload;
		},
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
		setFieldsCount(state, action) {
			state.routeInfo.fieldsCount = action.payload;
		},
		setAzsOnRoute(state, action) {
			state.routeInfo.azsOnRoute = action.payload;
		},
		setPanorama(state, action) {
			state.mapInfo.panorama = action.payload;
		},
		setPanoramaOpen(state, action) {
			state.mapInfo.panoramaIsOpen = action.payload;
		},
		setSearch(state, action) {
			state.searchInfo.search = action.payload;
		},
		setSearchValue(state, action) {
			state.searchInfo.searchValue = action.payload;
		},
		setBuildSearch(state, action) {
			state.searchInfo.buildSearch = action.payload;
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
	setPanoramaOpen,
	setSearch,
	setSearchValue,
	setBuildSearch,
	setFieldsCount,
	setTotalPoints,
	setTotalViewPoints,
	setTotalWashing,
	setTotalViewWashing,
	setTotalTire,
	setTotalViewTire,
	setAzsOnRoute,
	setPointsOnRoute,
	setCenter,
	setTotalAzs,
	setTotalViewAzs,
	setPoints,
	setMapLoading,
	setIsUrlBuid
} = mapSlice.actions;
export default mapSlice.reducer;
