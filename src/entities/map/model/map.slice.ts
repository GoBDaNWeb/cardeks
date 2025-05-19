import { getQueryParams } from '@/shared/lib';
import { Feature, MapTypes } from '@/shared/types';

import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const { zoomParam, routesParam } = getQueryParams();

// Types
export interface ISearchInfo {
	search: boolean;
	searchValue: string;
	buildSearch: boolean;
}

export interface ICategoryTotals {
	total: number;
	totalView: number;
}

export interface IMapInfo {
	zoom: number;
	isWheel: boolean;
	mapType: MapTypes;
	panorama: boolean;
	panoramaIsOpen: boolean;
	points: Feature[];
	center: number[];
	fixedCenter: number[];
	mapLoading: boolean;
	pointsData: Record<CategoryType, ICategoryTotals>;
}

export interface IRouteInfo {
	isSelectAddress: boolean;
	selectedAddress: string;
	routeCoords: number[][];
	currentCoords: number[][];
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
	pointsOnRoute: Feature[];
	isUrlBuild: boolean;
	isCursorPoint: boolean;
	getLocation: boolean;
}

export interface IMapState {
	searchInfo: ISearchInfo;
	mapInfo: IMapInfo;
	routeInfo: IRouteInfo;
}

// Constants
export const DEFAULT_ZOOM = 8;
export const DEFAULT_MAP_TYPE: MapTypes = 'yandex#map';
export const DEFAULT_FIELDS_COUNT = 2;

export type CategoryType = 'points' | 'washing' | 'tire' | 'azs';

// Initial state
const initialPointsData: Record<CategoryType, ICategoryTotals> = {
	points: { total: 0, totalView: 0 },
	washing: { total: 0, totalView: 0 },
	tire: { total: 0, totalView: 0 },
	azs: { total: 0, totalView: 0 }
};

const initialState: IMapState = {
	searchInfo: {
		search: false,
		searchValue: '',
		buildSearch: false
	},
	mapInfo: {
		zoom: zoomParam ? +zoomParam : DEFAULT_ZOOM,
		isWheel: false,
		mapType: DEFAULT_MAP_TYPE,
		panorama: false,
		panoramaIsOpen: false,
		pointsData: initialPointsData,
		points: [],
		center: [],
		fixedCenter: [],
		mapLoading: true
	},
	routeInfo: {
		isSelectAddress: false,
		selectedAddress: '',
		routeCoords: [],
		currentCoords: [],
		currentPointId: null,
		fieldsCount: DEFAULT_FIELDS_COUNT,
		swapPoints: [],
		deletePointId: null,
		buildRoute: Boolean(routesParam),
		changeRoute: false,
		routeIsChanged: false,
		routeIsBuilded: false,
		routeAddresses: [],
		routeTime: '',
		routeLength: '',
		azsOnRoute: 0,
		pointsOnRoute: [],
		isUrlBuild: false,
		isCursorPoint: false,
		getLocation: false
	}
};

// Slice
const mapSlice = createSlice({
	name: 'mapSlice',
	initialState,
	reducers: {
		setZoom(state, action: PayloadAction<number>) {
			state.mapInfo.zoom = action.payload;
		},
		handleWheel(state, action: PayloadAction<boolean>) {
			state.mapInfo.isWheel = action.payload;
		},
		setPoints(state, action: PayloadAction<Feature[]>) {
			state.mapInfo.points = action.payload;
		},
		setMapLoading(state, action: PayloadAction<boolean>) {
			state.mapInfo.mapLoading = action.payload;
		},
		setLocation(state, action: PayloadAction<boolean>) {
			state.routeInfo.getLocation = action.payload;
		},
		setPointsOnRoute(state, action: PayloadAction<Feature[]>) {
			state.routeInfo.pointsOnRoute = action.payload;
		},
		setIsCursorPoint(state, action: PayloadAction<boolean>) {
			state.routeInfo.isCursorPoint = action.payload;
		},
		setMapType(state, action: PayloadAction<MapTypes>) {
			state.mapInfo.mapType = action.payload;
		},
		setSelectAddress(state, action: PayloadAction<boolean>) {
			state.routeInfo.isSelectAddress = action.payload;
		},
		setCenter(state, action: PayloadAction<number[]>) {
			state.mapInfo.center = action.payload;
		},
		setFixedCenter(state, action: PayloadAction<number[]>) {
			state.mapInfo.fixedCenter = action.payload;
		},
		setAddress(state, action: PayloadAction<string>) {
			state.routeInfo.selectedAddress = action.payload;
		},
		setCoords(state, action: PayloadAction<number[][]>) {
			state.routeInfo.routeCoords = action.payload;
		},
		setCurrentCoords(state, action: PayloadAction<number[][]>) {
			state.routeInfo.currentCoords = action.payload;
		},
		setCurrentPointId(state, action: PayloadAction<string | null>) {
			state.routeInfo.currentPointId = action.payload;
		},
		setSwapPoints(state, action: PayloadAction<string[]>) {
			state.routeInfo.swapPoints = action.payload;
		},
		setDeletePointId(state, action: PayloadAction<string | null>) {
			state.routeInfo.deletePointId = action.payload;
		},
		setBuildRoute(state, action: PayloadAction<boolean>) {
			state.routeInfo.buildRoute = action.payload;
		},
		setRouteBuilded(state, action: PayloadAction<boolean>) {
			state.routeInfo.routeIsBuilded = action.payload;
		},
		setIsUrlBuid(state, action: PayloadAction<boolean>) {
			state.routeInfo.isUrlBuild = action.payload;
		},
		setRouteAddresses(state, action: PayloadAction<string[]>) {
			state.routeInfo.routeAddresses = action.payload;
		},
		clearRouteAddresses(state) {
			state.routeInfo.routeAddresses = [];
		},
		setRouteTime(state, action: PayloadAction<string>) {
			state.routeInfo.routeTime = action.payload;
		},
		setRouteLength(state, action: PayloadAction<string>) {
			state.routeInfo.routeLength = action.payload;
		},
		setChangeRoute(state, action: PayloadAction<boolean>) {
			state.routeInfo.changeRoute = action.payload;
		},
		setRouteChanged(state, action: PayloadAction<boolean>) {
			state.routeInfo.routeIsChanged = action.payload;
		},
		setFieldsCount(state, action: PayloadAction<number>) {
			state.routeInfo.fieldsCount = action.payload;
		},
		setAzsOnRoute(state, action: PayloadAction<number>) {
			state.routeInfo.azsOnRoute = action.payload;
		},
		setPanorama(state, action: PayloadAction<boolean>) {
			state.mapInfo.panorama = action.payload;
		},
		setPanoramaOpen(state, action: PayloadAction<boolean>) {
			state.mapInfo.panoramaIsOpen = action.payload;
		},
		setSearch(state, action: PayloadAction<boolean>) {
			state.searchInfo.search = action.payload;
		},
		setSearchValue(state, action: PayloadAction<string>) {
			state.searchInfo.searchValue = action.payload;
		},
		setBuildSearch(state, action: PayloadAction<boolean>) {
			state.searchInfo.buildSearch = action.payload;
		},
		setCategoryTotals(
			state,
			action: PayloadAction<{
				category: CategoryType;
				total?: number;
				totalView?: number;
			}>
		) {
			const { category, total, totalView } = action.payload;
			const categoryData = state.mapInfo.pointsData[category];

			if (categoryData) {
				if (total !== undefined) {
					categoryData.total = total;
				}
				if (totalView !== undefined) {
					categoryData.totalView = totalView;
				}
			}
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
	setAzsOnRoute,
	setPointsOnRoute,
	setCenter,
	setFixedCenter,
	setPoints,
	setMapLoading,
	setIsUrlBuid,
	setIsCursorPoint,
	setCategoryTotals,
	setLocation,
	setCurrentCoords
} = mapSlice.actions;

export default mapSlice.reducer;
