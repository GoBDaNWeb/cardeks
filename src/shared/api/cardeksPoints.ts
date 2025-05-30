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
		})
	})
});

export const { useGetPointsQuery, useGetTerminalsQuery, useLazyGetTerminalsQuery } =
	cardeksPointsAPI;

export const { getPoints, getTerminals } = cardeksPointsAPI.endpoints;
