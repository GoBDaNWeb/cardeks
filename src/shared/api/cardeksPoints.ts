import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const cardeksPointsAPI = createApi({
	reducerPath: 'cardeksPointsAPI',
	baseQuery: fetchBaseQuery({ baseUrl: '/' }),
	endpoints: build => ({
		getPoints: build.query({
			query: () => `FilterAZS.json`
		})
	})
});

export const { useGetPointsQuery } = cardeksPointsAPI;

export const { getPoints } = cardeksPointsAPI.endpoints;
