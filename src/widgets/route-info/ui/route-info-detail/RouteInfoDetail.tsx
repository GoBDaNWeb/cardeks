import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setCenter, setPointsOnRoute } from '@/entities/map';
import { ObjectItem } from '@/entities/object-item';

import { ruLetters } from '@/shared/config';
import { handleCopyLink, useTypedSelector } from '@/shared/lib';
import { Feature } from '@/shared/types';
import {
	Button,
	CloseIcon,
	DownloadIcon,
	LinkIcon,
	MailIcon,
	PrintIcon,
	useModal
} from '@/shared/ui';

import s from './route-info-detail.module.scss';

interface IRouteInfoDetail {
	setDetail: () => void;
}

export const RouteInfoDetail: FC<IRouteInfoDetail> = ({ setDetail }) => {
	const {
		routeInfo: { routeAddresses, pointsOnRoute, routeCoords }
	} = useTypedSelector(state => state.map);
	const {
		selectedFilter,
		filters: { fuelFilters, brandTitles, addServices, features, gateHeight, terminal, card }
	} = useTypedSelector(store => store.filters);

	const [pointsList] = useState<Feature[]>(pointsOnRoute);
	const [deletedPoints, setDeletedPoints] = useState<Feature[]>([]);

	const dispatch = useDispatch();
	const { open } = useModal();

	useEffect(() => {
		const newDeletedPoints = pointsList.filter(
			point => !pointsOnRoute.some((p: Feature) => p.id === point.id)
		);
		setDeletedPoints(newDeletedPoints);
	}, [pointsOnRoute, pointsList]);

	const handeOpenDownloadModal = () => {
		open('download');
	};

	const handeOpenMailModal = () => {
		open('mail');
	};
	const handeOpenPrintModal = () => {
		open('print');
	};
	const handleViewOnMap = (coords: number[]) => {
		dispatch(setCenter(coords));
	};

	const handleDeletePoint = (id: number) => {
		const isDeleted = deletedPoints.some(point => point.id === id);

		if (isDeleted) {
			// Восстановление точки
			const restoredPoint = deletedPoints.find(point => point.id === id);
			const updatedDeletedPoints = deletedPoints.filter(point => point.id !== id);

			setDeletedPoints(updatedDeletedPoints);
			dispatch(setPointsOnRoute([...pointsOnRoute, restoredPoint]));
		} else {
			// Удаление точки
			const deletedPoint = pointsList.find(point => point.id === id);
			const filteredPoints = pointsOnRoute.filter((point: Feature) => point.id !== id);
			if (deletedPoint) {
				setDeletedPoints(prevPoints => [...prevPoints, deletedPoint]);
			}
			dispatch(setPointsOnRoute(filteredPoints));
		}
	};
	return (
		<div className={s.routeInfoDetail}>
			<div className={s.routeInfoTop}>
				<p className={s.title}>Основной маршрут</p>
				<div className={s.btnsWrapper}>
					<div className={s.features}>
						<Button onClick={handeOpenDownloadModal} title='Загрузить список ТО'>
							<DownloadIcon />
						</Button>
						<Button
							onClick={() =>
								handleCopyLink({
									routeCoords,
									selectedFilter,
									fuelFilters,
									brandTitles,
									addServices,
									terminal,
									features,
									gateHeight,
									card
								})
							}
							title='Скопировать ссылку на карту с выбранными ТО'
						>
							<LinkIcon />
						</Button>
						<Button onClick={handeOpenPrintModal} title='Распечатать список ТО'>
							<PrintIcon />
						</Button>
						{/* <Button onClick={() => handeOpenMailModal()} title='Отправить список ТО на почту'>
							<MailIcon />
						</Button> */}
					</div>
					<Button className={s.closeBtn} onClick={setDetail}>
						<CloseIcon />
					</Button>
				</div>
			</div>
			<div className={s.routeInfoContent}>
				<div className={s.routeList}>
					{routeAddresses.map((address: string, index: number) => (
						<div key={address} className={s.addressItem}>
							<span>{ruLetters.split('')[index].toUpperCase()}</span>
							<p>{address}</p>
						</div>
					))}
				</div>
				<p className={s.azsTotal}>{pointsOnRoute.length} АЗС на маршруте</p>
				<div className={s.routeAZSList}>
					{pointsList
						.slice()
						.sort((a: Feature, b: Feature) => {
							if (a.distance && b.distance) {
								return a.distance - b.distance;
							}
							return 0;
						})
						.map((point: Feature) => (
							<ObjectItem
								handleDeletePoint={() => handleDeletePoint(point.id)}
								id={point.id}
								key={point.id}
								title={point.title}
								address={point.address}
								length={point.distance}
								fuels={point.fuels}
								isDeleteBtn
								isDisabled={deletedPoints.some(p => p.id === point.id)}
								viewOnMap={() => handleViewOnMap(point.geometry.coordinates)}
							/>
						))}
				</div>
			</div>
		</div>
	);
};
