export const getPointId = <T extends number | string>(index: T): `points.${T}.inputText` => {
	return `points.${index}.inputText` as `points.${T}.inputText`;
};
