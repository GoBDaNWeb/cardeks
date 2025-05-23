import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const cardeksRoutePoints = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: 'https://mapapi-dev.card-oil.ru/',
		prepareHeaders: headers => {
			headers.set('Content-Type', 'application/json');
			return headers;
		}
	}),
	endpoints: build => ({
		findAzsOnRoute: build.mutation<any, RequestBody>({
			query: body => ({
				url: 'findazsonroute',
				method: 'POST',

				body
			})
		})
	})
});

export const { useFindAzsOnRouteMutation } = cardeksRoutePoints;

interface RequestBody {
	radius: number;
	points: [number, number][];
}
