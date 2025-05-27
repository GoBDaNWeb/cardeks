import { Dispatch } from 'redux';

interface GetAddressProps {
	ymaps: any;
	coords: number[];
	dispatch: Dispatch;
	setAddress: (address: string) => any;
}

export const getAddress = ({ ymaps, coords, dispatch, setAddress }: GetAddressProps): void => {
	ymaps.geocode(coords).then((res: any) => {
		const firstGeoObject = res.geoObjects.get(0);
		const address = firstGeoObject.getAddressLine();
		dispatch(setAddress(address));
	});
};
