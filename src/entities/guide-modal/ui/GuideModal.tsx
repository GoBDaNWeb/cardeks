import { useDispatch } from 'react-redux';

import { useTypedSelector } from '@/shared/lib';
import {
	Button,
	CloseIcon,
	FilterIcon,
	ListIcon,
	Modal,
	PinIcon,
	RouteIcon,
	SearchIcon
} from '@/shared/ui';

import { handleOpenModal } from '../model';

import s from './guide-modal.module.scss';

export const GuideModal = () => {
	const { isOpen } = useTypedSelector(store => store.guideModal);
	const dispatch = useDispatch();

	const handleCloseModal = () => {
		dispatch(handleOpenModal(false));
	};
	return (
		<Modal isOpen={isOpen} className={s.guideModal} close={handleCloseModal}>
			<div className={s.modalContent} onClick={e => e.stopPropagation()}>
				<Button className={s.closeBtn} onClick={() => handleCloseModal()}>
					<CloseIcon />
				</Button>
				<div className={s.modalContentText}>
					<h5>Инструкция</h5>
					<p>
						Используйте <SearchIcon /> поиск и <FilterIcon /> фильтры для поиска АЗС. <br /> В
						<ListIcon />
						списке вы можете прочитать короткое описание АЗС. Чтобы узнать подробности, кликните
						«Показать детали» в элементе списка и выберите <PinIcon /> метку на карте.
					</p>
					<p>
						Используйте <RouteIcon /> маршрут для планирования маршрута с учётом нужных станций.
					</p>
				</div>
			</div>
		</Modal>
	);
};
