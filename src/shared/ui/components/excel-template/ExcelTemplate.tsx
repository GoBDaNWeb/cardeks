import { forwardRef, useRef } from 'react';

import { useTypedSelector } from '@/shared/lib';
import { Feature } from '@/shared/types';

import s from './excel-template.module.scss';

export const ExcelTemplate = forwardRef(({}, ref) => {
	const nodeRef = useRef<HTMLDivElement | null>(null);

	const {
		routeInfo: { pointsOnRoute },
		mapInfo: { points }
	} = useTypedSelector(store => store.map);

	return (
		<table
			className={s.excelTemplate}
			ref={el => {
				nodeRef.current = el;
				if (typeof ref === 'function') {
					ref(el);
				} else if (ref) {
					ref.current = el;
				}
			}}
		>
			<tbody>
				<tr>
					<td>Бренд</td>
					<td>Адрес</td>
					<td>Километраж</td>
					<td colSpan={3}>Тип</td>
				</tr>
				{pointsOnRoute.length > 0
					? pointsOnRoute.map((point: Feature) => (
							<tr key={point.id}>
								<td>{point.title}</td>
								<td>{point.address}</td>
								<td>{point.distance && (Math.round(point.distance) / 1000).toFixed(2)}км</td>
								<td>{point.types.washing ? 'Автомойка' : ''}</td>
								<td>{point.types.tire ? 'Шиномонтаж' : ''}</td>
								<td>{point.types.azs ? 'АЗС' : ''}</td>
							</tr>
						))
					: points.map((point: Feature) => (
							<tr key={point.id}>
								<td>{point.title}</td>
								<td>{point.address}</td>
								<td>{point.distance && (Math.round(point.distance) / 1000).toFixed(2)}км</td>
								<td>{point.types.washing ? 'Автомойка' : ''}</td>
								<td>{point.types.tire ? 'Шиномонтаж' : ''}</td>
								<td>{point.types.azs ? 'АЗС' : ''}</td>
							</tr>
						))}
			</tbody>
		</table>
	);
});
