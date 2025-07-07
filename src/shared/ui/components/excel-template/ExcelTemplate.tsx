import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLazyGetRegionsQuery, useLazyGetTerminalsQuery } from '@/shared/api/cardeksPoints';
import { useTypedSelector } from '@/shared/lib';
import { Feature } from '@/shared/types';

import s from './excel-template.module.scss';

export const ExcelTemplate = forwardRef(({}, ref) => {
	const [tablePoints, setTablePoints] = useState<any[]>([]);
	const [terminalPoints, setTerminalPoints] = useState<any[]>([]);
	const [regionPoints, setRegionPoints] = useState<any[]>([]);
	const nodeRef = useRef<HTMLDivElement | null>(null);
	const [fetchTerminals] = useLazyGetTerminalsQuery();
	const [fetchRegions] = useLazyGetRegionsQuery();
	const hasFetchedRef = useRef(false);
	const { currentModal } = useTypedSelector(state => state.modals);

	const {
		routeInfo: { pointsOnRoute },
		mapInfo: { points }
	} = useTypedSelector(store => store.map);

	// Функция для создания мапы терминалов (мемоизируем)
	const createTerminalMap = useCallback((terminals: any[]) => {
		const map: Record<string, { address: string; terminals: any[] }> = {};
		terminals.forEach(item => {
			const id = item[0];
			map[id] = {
				address: item[1],
				terminals: item[2]
			};
		});
		return map;
	}, []);

	// Функция для создания мапы регионов (мемоизируем)
	const createRegionMap = useCallback((terminals: any[]) => {
		const map: Record<string, { region: string; town: string }> = {};
		terminals.forEach(item => {
			const id = item[0];
			map[id] = {
				region: item[1],
				town: item[2]
			};
		});
		return map;
	}, []);

	// Мемоизация объединённого массива
	const mergedArray = useMemo(() => {
		const terminalMap = createTerminalMap(terminalPoints);
		const regionMap = createRegionMap(regionPoints);
		console.log('regionPoints', regionPoints);
		const currentPoints = pointsOnRoute.length > 0 ? pointsOnRoute : points;

		return currentPoints.map((item: Feature) => {
			const idString = item.id.toString().padStart(10, '0');
			const terminalData = terminalMap[idString];
			const regionData = regionMap[idString];
			console.log('regionData', regionData);
			return terminalData && regionData
				? {
						...item,
						address: terminalData.address,
						terminals: terminalData.terminals,
						region: regionData.region,
						town: regionData.town
					}
				: item;
		});
	}, [terminalPoints, regionPoints, pointsOnRoute, points, createTerminalMap]);

	useEffect(() => {
		if (currentModal === 'download' && !hasFetchedRef.current) {
			hasFetchedRef.current = true;
			fetchTerminals()
				.unwrap()
				.then(res => {
					console.log('res.data Terminal', res.data);

					setTerminalPoints(res.data);
				})
				.catch(err => {
					console.error('Ошибка при загрузке терминалов:', err);
				});

			fetchRegions()
				.unwrap()
				.then(res => {
					console.log('res.data Regions', res.data);
					setRegionPoints(res.data);
				})
				.catch(err => {
					console.error('Ошибка при загрузке регионов:', err);
				});
		}
	}, [currentModal, fetchTerminals, fetchRegions]);

	useEffect(() => {
		console.log('pointsOnRoute', pointsOnRoute);
		console.log('mergedArray', mergedArray);
		pointsOnRoute.length > 0 ? setTablePoints(pointsOnRoute) : setTablePoints(mergedArray);
	}, [pointsOnRoute, mergedArray]);

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
					<td>Регион</td>
					<td>Город</td>
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
				{tablePoints.length > 0 &&
					tablePoints.map((point: Feature, index: number) => {
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
								<td>{point.region || '-'}</td>
								<td>{point.town || '-'}</td>
								<td>{point.address || '-'}</td>
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
									) : (
										'-'
									)}
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
