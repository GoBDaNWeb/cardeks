export const routeToLineString = (route: any) => {
	const points = route
		.getPaths()
		.toArray()
		.map((x: any) => x.getSegments().toArray())
		.reduce((s: any, x: any) => s.concat(x), [])
		.map((x: any) => x.geometry.getCoordinates())
		.reduce((s: any, x: any) => s.concat(x), []);
	return { type: 'LineString', coordinates: points };
};
