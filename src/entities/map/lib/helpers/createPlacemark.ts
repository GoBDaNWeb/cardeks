import { enLetter } from '@/shared/config';
import { getPointId } from '@/shared/lib';

interface IPlacemarkProps {
	ymaps: any;
	coords: number[];
	index?: number;
	pointId?: string;
	pointIndex?: number;
}
export const createPlacemark = ({ ymaps, coords, index, pointId, pointIndex }: IPlacemarkProps) => {
	const validIndex = pointIndex ?? index;

	if (validIndex === undefined) {
		throw new Error('Invalid index or pointIndex');
	}

	const myPlacemark = new ymaps.Placemark(
		coords,
		{
			hintContent: 'Новая метка',
			balloonContent: 'index: ' + validIndex,
			id: pointId ?? getPointId(validIndex)
		},
		{
			iconLayout: 'default#image',
			iconImageHref: `/images/points/point${enLetter.split('')[validIndex].toUpperCase()}.png`,
			iconImageSize: [30, 34],
			iconImageOffset: [-16, -38]
		}
	);

	return myPlacemark;
};
