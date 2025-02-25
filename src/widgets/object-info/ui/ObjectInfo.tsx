import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import clsx from 'clsx';

import { setActiveMenu } from '@/widgets/menu-list';

import { setAddress, setCurrentPointId } from '@/entities/map';
import { setActiveObject } from '@/entities/object-info';

import { useGetTerminalsQuery } from '@/shared/api';
import { fuelList } from '@/shared/config';
import { useIndexedDB, useTypedSelector } from '@/shared/lib';
import { Feature } from '@/shared/types';
import { Badge, Button, CloseIcon, RouteIcon } from '@/shared/ui';

import s from './object-info.module.scss';

export const ObjectInfo = () => {
	const [azsItem, setAzsItem] = useState<Feature | null>(null);
	const [terminal, setTerminal] = useState<any>(null);
	const { getDataById } = useIndexedDB();
	const dispatch = useDispatch();

	const { data, isLoading } = useGetTerminalsQuery();
	const { objectId } = useTypedSelector(store => store.objectInfo);
	const {
		routeInfo: { routeIsBuilded }
	} = useTypedSelector(state => state.map);

	const notify = () =>
		toast.success('координаты скопированы', {
			position: 'bottom-right',
			autoClose: 1500
		});
	const handleCopyCoords = (text: string) => {
		if (text) {
			navigator.clipboard.writeText(text);
		}
		notify();
	};
	const handleClose = () => {
		dispatch(setActiveObject(null));
	};
	const handleBuildRoute = () => {
		dispatch(setActiveMenu('route'));
		setTimeout(() => {
			dispatch(setCurrentPointId('points.0.inputText'));
			dispatch(setAddress(terminal[1]));
		}, 500);

		dispatch(setActiveObject(null));
	};

	useEffect(() => {
		const fetch = async () => {
			if (objectId && !objectId.includes('__cluster__')) {
				const currentAzs = await getDataById(objectId);
				const filterTerminal = data.data.find((item: any) => {
					return item[0] === objectId;
				});
				if (filterTerminal) {
					setTerminal(filterTerminal);
				}
				if (currentAzs) {
					setAzsItem(currentAzs);
				}
			}
		};
		if (!isLoading) {
			fetch();
		}
	}, [objectId]);

	const objectInfoClass = clsx(s.objectInfo, {
		[s.active]: objectId && !objectId.includes('__cluster__'),
		[s.top]: objectId && !objectId.includes('__cluster__') && routeIsBuilded
	});

	return (
		<div className={objectInfoClass}>
			<div className={s.objectInfoTop}>
				<div className={s.titleWrapper}>
					<p>{azsItem?.title}</p>

					<Button onClick={() => handleClose()}>
						<CloseIcon />
					</Button>
				</div>

				<div className={s.features}>
					{azsItem?.features.canManageCards ? (
						<div className={s.feature}>Сбросить счетчик PIN-кода</div>
					) : null}
					{azsItem?.features.abilityPPay ? <div className={s.feature}>Оплата из машины</div> : null}
					{azsItem?.features.ppayBarcode ? (
						<div className={s.feature}>Оплата по штрихкоду</div>
					) : null}
				</div>

				<p className={s.address}>{terminal && terminal[1]}</p>
				<Button
					className={s.coords}
					onClick={() => handleCopyCoords(azsItem?.geometry.coordinates.join(', ') ?? '')}
				>
					{azsItem?.geometry.coordinates.join(', ')}
				</Button>
				<Button className={s.buildRoute} onClick={() => handleBuildRoute()}>
					<RouteIcon /> <p>Построить маршрут</p>
				</Button>
			</div>
			<div className={s.objectInfoContent}>
				{azsItem && fuelList.filter(fuel => azsItem.fuels[fuel.value]).length ? (
					<div className={s.infoItem}>
						<h6>Топливо</h6>
						<div className={s.list}>
							{azsItem &&
								fuelList
									.filter(fuel => azsItem.fuels[fuel.value]) // Фильтруем только доступные виды топлива
									.map(fuel => (
										<Badge key={fuel.value} className={s.fuelBadge}>
											<p>{fuel.title}</p>
										</Badge>
									))}
						</div>
					</div>
				) : null}

				<div className={s.infoItem}>
					<h6>Принимает карты</h6>
					<p>
						{terminal ? (
							<>
								{terminal[2]?.filter((item: string) => {
									return item.includes('2005');
								}).length > 0 ? (
									'Кардекс'
								) : (
									<>
										{azsItem?.title.toLowerCase().includes('лукойл') ||
										azsItem?.title.toLowerCase().includes('тебойл')
											? 'Лукойл'
											: 'Кардекс'}
									</>
								)}
							</>
						) : null}
					</p>
				</div>
				{terminal && terminal[2].length ? (
					<div className={s.infoItem}>
						<h6>Терминалы</h6>
						<p>{terminal[2].join(' -')}</p>
					</div>
				) : null}
			</div>
		</div>
	);
};
