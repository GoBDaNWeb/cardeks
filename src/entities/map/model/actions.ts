import { mapSlice } from './map.slice';

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
	setRouteIsBuilding,
	setIsCursorPoint,
	setCategoryTotals,
	setLocation,
	setCurrentCoords
} = mapSlice.actions;
