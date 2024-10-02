import { enLetter } from '@/shared/config';

export const createPlacemark = ({ ymaps, coords, index, pointId, pointIndex }) => {
	let myPlacemark = new ymaps.Placemark(
		coords,
		{
			hintContent: 'Новая метка',
			balloonContent: 'index: ' + pointIndex,
			id: pointId ?? `points.${index}.inputText`
		},
		{
			iconLayout: 'default#image',
			iconImageHref: `/images/points/point${enLetter.split('')[pointIndex ?? index].toUpperCase()}.png`,
			iconImageSize: [30, 34],
			iconImageOffset: [-16, -38]
		}
	);
	return myPlacemark;
};
