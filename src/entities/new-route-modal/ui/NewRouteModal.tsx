import { useDispatch } from 'react-redux';

import { setBuildRoute, setRouteAddresses, setRouteBuilded } from '@/entities/map';

import { useTypedSelector } from '@/shared/lib';
import { Button, CloseIcon, Modal } from '@/shared/ui';

import { handleOpenModal, handleSuccess } from '../model';

import s from './new-route-modal.module.scss';

export const NewRouteModal = () => {
	const dispatch = useDispatch();

	const { isOpen } = useTypedSelector(store => store.newRouteModal);

	const handleCloseModal = () => {
		dispatch(handleOpenModal(false));
	};

	const handeSuccessModal = () => {
		dispatch(setBuildRoute(false));
		dispatch(setRouteBuilded(false));
		dispatch(handleSuccess(true));
		dispatch(setRouteAddresses([]));
		setTimeout(() => {
			dispatch(handleSuccess(false));
		}, 100);
	};

	return (
		<Modal isOpen={isOpen} className={s.newRouteModal} close={handleCloseModal}>
			<div className={s.modalContent} onClick={e => e.stopPropagation()}>
				<Button onClick={() => handleCloseModal()} className={s.closeBtn}>
					<CloseIcon />
				</Button>
				<h5>Текущий маршрут будет удален</h5>
				<Button variant='primary' className={s.successBtn} onClick={() => handeSuccessModal()}>
					Продолжить
				</Button>
			</div>
		</Modal>
	);
};
