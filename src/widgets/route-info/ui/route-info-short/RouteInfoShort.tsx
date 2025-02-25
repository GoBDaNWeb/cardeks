import { FC, Fragment } from 'react';
import { useDispatch } from 'react-redux';

import { handleOpenModal as openDownloadModal } from '@/features/download-modal';
import { handleOpenModal as openMailModal } from '@/features/mail-modal';

import { setChangeRoute, setRouteBuilded } from '@/entities/map';
import { handleOpenModal } from '@/entities/new-route-modal';
import { handleOpenModal as openPrintModal } from '@/entities/print-modal';

import { handleCopyLink, useTypedSelector } from '@/shared/lib';
import { Button, CloseIcon, DownloadIcon, LinkIcon, MailIcon, PrintIcon } from '@/shared/ui';

import s from './route-info-short.module.scss';

interface IRouteInfoShort {
	setDetail: () => void;
	handleClose: () => void;
}

export const RouteInfoShort: FC<IRouteInfoShort> = ({ setDetail, handleClose }) => {
	const dispatch = useDispatch();

	const {
		routeInfo: { routeAddresses, routeTime, routeLength, routeCoords }
	} = useTypedSelector(state => state.map);
	const {
		selectedFilter,
		filters: { fuelFilters, brandTitles, addServices, features, gateHeight, terminal, card }
	} = useTypedSelector(store => store.filters);

	const handleOpenNewRouteModal = () => {
		dispatch(handleOpenModal(true));
	};
	const handeOpenDownloadModal = () => {
		dispatch(openDownloadModal(true));
	};
	const handeOpenMailModal = () => {
		dispatch(openMailModal(true));
	};
	const handeOpenPrintModal = () => {
		dispatch(openPrintModal(true));
	};
	const handleChangeRoute = () => {
		dispatch(setRouteBuilded(false));
		dispatch(setChangeRoute(true));
	};

	return (
		<div className={s.routeInfoShort}>
			<div className={s.routeInfoTop}>
				<p className={s.title}>
					{routeAddresses.map((address: string, index: number) => (
						<Fragment key={address}>
							{address} {index === routeAddresses.length - 1 ? '' : ' - '}
						</Fragment>
					))}
				</p>
				<div className={s.btns}>
					<Button onClick={() => handleChangeRoute()}>Изменить опции</Button>
					<Button onClick={() => handleOpenNewRouteModal()}>Новый маршрут</Button>
				</div>
				<Button className={s.closeBtn} onClick={handleClose}>
					<CloseIcon />
				</Button>
			</div>
			<div className={s.routeInfoContent}>
				<p className={s.title}>Основной маршрут</p>
				<div className={s.routeInfoList}>
					<p>{routeTime}</p>
					<p>{routeLength}</p>
				</div>
				<div className={s.routeInfoFeatures}>
					<div className={s.btns}>
						<Button onClick={() => handeOpenDownloadModal()} title='Загрузить список ТО'>
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
						<Button onClick={() => handeOpenPrintModal()} title='Распечатать список ТО'>
							<PrintIcon />
						</Button>
						{/* <Button onClick={() => handeOpenMailModal()} title='Отправить список ТО на почту'>
							<MailIcon />
						</Button> */}
					</div>
					<Button className={s.aboutBtn} onClick={setDetail}>
						Подробнее
					</Button>
				</div>
			</div>
		</div>
	);
};
