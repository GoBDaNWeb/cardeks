import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const cardeksPointsAPI = createApi({
	reducerPath: 'cardeksPointsAPI',
	baseQuery: fetchBaseQuery({ baseUrl: '/' }),
	endpoints: build => ({
		getPoints: build.query<any, void>({
			query: () => `FilterAZS.json`
		}),
		getTerminals: build.query<any, void>({
			query: () => `TerminalsAZS.json`
		}),
		getRegions: build.query<any, void>({
			query: () => `FilterRegionAZS.json`
		})
	})
});

export const {
	useGetPointsQuery,
	useGetRegionsQuery,
	useGetTerminalsQuery,
	useLazyGetTerminalsQuery,
	useLazyGetRegionsQuery
} = cardeksPointsAPI;

export const { getPoints, getTerminals, getRegions } = cardeksPointsAPI.endpoints;
