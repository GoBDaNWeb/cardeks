import { useDispatch, useSelector } from 'react-redux';

import { handleOpenModal as openDownloadModal } from '@/features/download-modal';
import { handleOpenModal as openMailModal } from '@/features/mail-modal';

import { ObjectItem } from '@/entities/object-item';

import { ruLetters } from '@/shared/config';
import { handleCopyLink } from '@/shared/lib';
import { Button, CloseIcon, DownloadIcon, LinkIcon, MailIcon, PrintIcon } from '@/shared/ui';

import s from './route-info-detail.module.scss';

export const RouteInfoDetail = ({ handleClose }) => {
	const dispatch = useDispatch();

	const {
		routeInfo: { routeAddresses }
	} = useSelector(state => state.map);

	const handeOpenDownloadModal = () => {
		dispatch(openDownloadModal(true));
	};
	const handeOpenMailModal = () => {
		dispatch(openMailModal(true));
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
						<Button>
							<PrintIcon />
						</Button>
						<Button onClick={() => handeOpenMailModal()}>
							<MailIcon />
						</Button>
					</div>
					<Button className={s.closeBtn} onClick={handleClose}>
						<CloseIcon />
					</Button>
				</div>
			</div>
			<div className={s.routeInfoContent}>
				<div className={s.routeList}>
					{routeAddresses.map((address, index) => (
						<div key={address} className={s.addressItem}>
							<span>{ruLetters.split('')[index].toUpperCase()}</span>
							<p>{address}</p>
						</div>
					))}
				</div>
				<p className={s.azsTotal}>2 АЗС на маршруте</p>
				<div className={s.routeAZSList}>
					<ObjectItem length='22,7 км' isDeleteBtn />
					<ObjectItem length='22,7 км' isDeleteBtn />
					<ObjectItem length='22,7 км' isDeleteBtn />
				</div>
			</div>
		</div>
	);
};
