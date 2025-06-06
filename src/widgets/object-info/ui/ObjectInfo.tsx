import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import clsx from 'clsx';

import { setActiveMenu } from '@/widgets/menu-list';

import { setAddress, setCurrentPointId } from '@/entities/map';
import { setActiveObject } from '@/entities/object-info';

import { fuelList } from '@/shared/config';
import { useIndexedDB, useTypedSelector } from '@/shared/lib';
import { Feature } from '@/shared/types';
import { Badge, Button, CloseIcon, RouteIcon } from '@/shared/ui';

import s from './object-info.module.scss';

export const ObjectInfo = () => {
	const [azsItem, setAzsItem] = useState<Feature | null>(null);
	const { getDataById } = useIndexedDB();
	const dispatch = useDispatch();

	const { activeMenu } = useTypedSelector(store => store.menu);
	const { filtersIsOpen } = useTypedSelector(store => store.filters);
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
			dispatch(setCurrentPointId('points.1.inputText'));
			dispatch(setAddress(azsItem?.address as string));
		}, 500);

		dispatch(setActiveObject(null));
	};
	useEffect(() => {
		const fetch = async () => {
			try {
				if (objectId && !objectId.includes('__cluster__')) {
					const currentAzs = await getDataById(objectId);

					if (currentAzs) {
						setAzsItem(currentAzs);
					}
				}
			} catch (e) {
				console.error('Ошибка при загрузке:', e);
			}
		};
		if (objectId) {
			fetch();
		}
	}, [objectId]);

	const objectInfoClass = clsx(s.objectInfo, {
		[s.active]: objectId && !objectId.includes('__cluster__'),
		[s.top]: objectId && !objectId.includes('__cluster__') && routeIsBuilded,
		[s.left]: filtersIsOpen || activeMenu
	});

	return (
		<div className={objectInfoClass}>
			<div className={s.objectInfoTop}>
				<div className={s.titleWrapper}>
					<div className={s.title}>
						<p>{azsItem?.title}</p>

						<a
							href={`https://yandex.ru/maps/?rtext=${azsItem?.geometry.coordinates.join(',')}&rtt=auto`}
							target='_blank'
						>
							Открыть на Я.Картах
						</a>
					</div>

					<Button onClick={() => handleClose()} className={s.closeBtn}>
						<CloseIcon />
					</Button>
				</div>
				{azsItem?.features.canManageCards ? (
					<div className={s.features}>
						{azsItem?.features.canManageCards ? (
							<div className={s.feature}>Сбросить счетчик PIN-кода</div>
						) : null}
						{/* {azsItem?.features.abilityPPay ? <div className={s.feature}>Оплата из машины</div> : null}
					{azsItem?.features.ppayBarcode ? (
						<div className={s.feature}>Оплата по штрихкоду</div>
					) : null} */}
					</div>
				) : null}

				<p className={s.address}>{azsItem?.address}</p>
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
						{azsItem?.terminals ? (
							<>
								{azsItem?.terminals?.filter((item: string) => {
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
				{azsItem && azsItem.addittional && azsItem.addittional.relatedProducts ? (
					<div className={s.infoItem}>
						<h6>Дополнительно</h6>
						<p> Сопутствующие товары</p>
					</div>
				) : null}
				{azsItem?.terminals?.length ? (
					<div className={s.infoItem}>
						<h6>Терминалы</h6>
						<p>{azsItem?.terminals.join(' -')}</p>
					</div>
				) : null}
			</div>
		</div>
	);
};
