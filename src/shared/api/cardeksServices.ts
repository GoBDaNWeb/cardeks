import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { IAddresses } from '@/shared/types';

export const cardeksAPI = createApi({
	reducerPath: 'cardeksAPI',
	baseQuery: fetchBaseQuery({ baseUrl: 'https://suggest-maps.yandex.ru/v1/' }),
	endpoints: build => ({
		getAddresses: build.query<IAddresses, string>({
			query: text => `suggest?apikey=44a70424-7a66-4ce9-baff-66a18ac7cd97&text=${text}`
		})
	})
});

export const { useGetAddressesQuery } = cardeksAPI;

export const { getAddresses } = cardeksAPI.endpoints;
