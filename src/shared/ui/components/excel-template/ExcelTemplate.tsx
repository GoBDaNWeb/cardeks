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
	const tableData = pointsOnRoute.length > 0 ? pointsOnRoute : points;

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
			<thead>
				<tr>
					<th></th>
					<th></th>
					<th></th>
					<th>Полный список АЗС для обслуживания по Картам.</th>
				</tr>
				<tr>
					<th></th>
					<th></th>
					<th></th>
					<th>
						<a href='https://cardeks.vercel.app/'>https://cardeks.vercel.app/</a>
					</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>№</td>
					<td>Месторасположение</td>
					<td>Бренд</td>
					<td>Тип карты</td>
					<td>Бензин</td>
					<td>ДТ</td>
					<td>ГАЗ</td>
					<td>МОЙКА</td>
					<td>Доп. услуги</td>
				</tr>
				{/* {pointsOnRoute.length > 0
					? pointsOnRoute.map((point: Feature, index: number) => (
							<tr key={point.id}>
								<td>{index + 1}</td>
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
						))} */}
				{tableData.length > 0 &&
					tableData.map((point: Feature, index: number) => {
						const cardData = () => {
							const services = [];
							if (point.fuels.AdBlue) services.push('AdBlue');
							if (point.fuels.Metan) services.push('Метан');
							if (point.types.tire) services.push('Шиномонтаж');
							return services.join(', ');
						};
						return (
							<tr key={point.id || index}>
								<td>{index + 1}</td>
								<td>{point.address || ''}</td>
								<td>{point.title || ''}</td>
								<td>
									{point.terminals ? (
										<>
											{point.terminals?.filter((item: string) => {
												return item.includes('2005');
											}).length > 0 ? (
												'Кардекс'
											) : (
												<>
													{point?.title.toLowerCase().includes('лукойл') ||
													point?.title.toLowerCase().includes('тебойл')
														? 'Лукойл'
														: 'Кардекс'}
												</>
											)}
										</>
									) : null}
								</td>
								<td>
									{point.fuels.Ai100 ||
									point.fuels.Ai92 ||
									point.fuels.Ai92P ||
									point.fuels.Ai95 ||
									point.fuels.Ai95P ||
									point.fuels.Ai98
										? '+'
										: ''}
								</td>
								<td>{point.fuels.DT ? '+' : ''}</td>
								<td>{point.fuels.Gaz ? '+' : ''}</td>
								<td>{point.types.washing ? '+' : ''}</td>
								<td>{cardData()}</td>
							</tr>
						);
					})}
			</tbody>
		</table>
	);
});
