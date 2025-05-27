import { useDispatch } from 'react-redux';

import { setBuildRoute, setRouteAddresses, setRouteBuilded } from '@/entities/map';

import { Button, CloseIcon, Modal, useModal } from '@/shared/ui';

import s from './new-route-modal.module.scss';

export const NewRouteModal = () => {
	const dispatch = useDispatch();

	const { close, isOpen, update } = useModal();

	const handleCloseModal = () => {
		close();
	};

	const handeSuccessModal = () => {
		close();
		dispatch(setBuildRoute(false));
		dispatch(setRouteBuilded(false));

		update({ isSucces: true });
		dispatch(setRouteAddresses([]));
		setTimeout(() => {
			update({ isSucces: false });
		}, 200);
	};

	return (
		<Modal isOpen={isOpen('new-route')} className={s.newRouteModal} close={handleCloseModal}>
			<div className={s.modalContent} onClick={e => e.stopPropagation()}>
				<Button onClick={() => handleCloseModal()} className={s.closeBtn}>
					<CloseIcon />
				</Button>
				<h5>Текущий маршрут будет удален</h5>
				<Button variant='primary' className={s.successBtn} onClick={handeSuccessModal}>
					Продолжить
				</Button>
			</div>
		</Modal>
	);
};
