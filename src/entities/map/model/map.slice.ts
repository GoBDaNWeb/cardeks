import { getQueryParams } from '@/shared/lib';
import { Feature, MapTypes } from '@/shared/types';

import { createSlice } from '@reduxjs/toolkit';

const { zoomParam, routesParam } = getQueryParams();

interface ISearchInfo {
	search: boolean;
	searchValue: string;
	buildSearch: boolean;
}
interface ICategoryTotals {
	total: number;
	totalView: number;
}
interface IMapInfo {
	zoom: number;
	isWheel: boolean;
	mapType: MapTypes;
	panorama: boolean;
	panoramaIsOpen: boolean;
	points: Feature[];
	center: number[];
	fixedCenter: number[];
	mapLoading: boolean;
	pointsData: Record<'points' | 'washing' | 'tire' | 'azs', ICategoryTotals>;
}

interface IRouteInfo {
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
		zoom: zoomParam ? +zoomParam : 8,
		isWheel: false,
		mapType: 'yandex#map',
		panorama: false,
		panoramaIsOpen: false,
		pointsData: {
			points: { total: 0, totalView: 0 },
			washing: { total: 0, totalView: 0 },
			tire: { total: 0, totalView: 0 },
			azs: { total: 0, totalView: 0 }
		},
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
		fieldsCount: 2,
		swapPoints: [],
		deletePointId: null,
		buildRoute: routesParam ? true : false,
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

		setPoints(state, action) {
			state.mapInfo.points = action.payload;
		},

		setMapLoading(state, action) {
			state.mapInfo.mapLoading = action.payload;
		},

		setLocation(state, action) {
			state.routeInfo.getLocation = action.payload;
		},
		setPointsOnRoute(state, action) {
			state.routeInfo.pointsOnRoute = action.payload;
		},
		setIsCursorPoint(state, action) {
			state.routeInfo.isCursorPoint = action.payload;
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
		setFixedCenter(state, action) {
			state.mapInfo.fixedCenter = action.payload;
		},
		setAddress(state, action) {
			state.routeInfo.selectedAddress = action.payload;
		},
		setCoords(state, action) {
			state.routeInfo.routeCoords = action.payload;
		},
		setCurrentCoords(state, action) {
			state.routeInfo.currentCoords = action.payload;
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
		},
		setCategoryTotals(
			state,
			action: {
				payload: {
					category: keyof IMapInfo['pointsData'];
					total?: number;
					totalView?: number;
				};
			}
		) {
			const { category, total, totalView } = action.payload;

			if (state.mapInfo.pointsData[category]) {
				if (total !== undefined) {
					state.mapInfo.pointsData[category].total = total;
				}
				if (totalView !== undefined) {
					state.mapInfo.pointsData[category].totalView = totalView;
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
