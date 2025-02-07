import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { handleOpenModal as openDownloadModal } from '@/features/download-modal';
import { handleOpenModal as openMailModal } from '@/features/mail-modal';

import { setCenter, setPointsOnRoute } from '@/entities/map';
import { ObjectItem } from '@/entities/object-item';
import { handleOpenModal as openPrintModal } from '@/entities/print-modal';

import { ruLetters } from '@/shared/config';
import { handleCopyLink, useTypedSelector } from '@/shared/lib';
import { Feature } from '@/shared/types';
import { Button, CloseIcon, DownloadIcon, LinkIcon, MailIcon, PrintIcon } from '@/shared/ui';

import s from './route-info-detail.module.scss';

interface IRouteInfoDetail {
	handleClose: () => void;
}

export const RouteInfoDetail: FC<IRouteInfoDetail> = ({ handleClose }) => {
	const {
		routeInfo: { routeAddresses, pointsOnRoute }
	} = useTypedSelector(state => state.map);

	const [pointsList] = useState<Feature[]>(pointsOnRoute);
	const [deletedPoints, setDeletedPoints] = useState<Feature[]>([]);

	const dispatch = useDispatch();

	useEffect(() => {
		const newDeletedPoints = pointsList.filter(
			point => !pointsOnRoute.some((p: Feature) => p.id === point.id)
		);
		setDeletedPoints(newDeletedPoints);
	}, [pointsOnRoute, pointsList]);

	const handeOpenDownloadModal = () => {
		dispatch(openDownloadModal(true));
	};
	const handeOpenMailModal = () => {
		dispatch(openMailModal(true));
	};
	const handeOpenPrintModal = () => {
		dispatch(openPrintModal(true));
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
						<Button onClick={() => handeOpenDownloadModal()}>
							<DownloadIcon />
						</Button>
						<Button onClick={() => handleCopyLink(routeAddresses)}>
							<LinkIcon />
						</Button>
						<Button onClick={() => handeOpenPrintModal()}>
							<PrintIcon />
						</Button>
						{/* <Button onClick={() => handeOpenMailModal()}>
							<MailIcon />
						</Button> */}
					</div>
					<Button className={s.closeBtn} onClick={handleClose}>
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
								key={point.id}
								title={point.title}
								address={point.address}
								length={point.distance}
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
