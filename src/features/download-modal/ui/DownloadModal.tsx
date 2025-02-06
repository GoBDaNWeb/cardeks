import { useDispatch } from 'react-redux';

import { DownloadFiles } from '@/features/download-files';

import { useTypedSelector } from '@/shared/lib';
import { Button, CloseIcon, Modal } from '@/shared/ui';

import { handleOpenModal } from '../model';

import s from './download-modal.module.scss';

export const DownloadModal = () => {
	const { isOpen } = useTypedSelector(store => store.downloadModal);
	const dispatch = useDispatch();
	const handleCloseModal = () => {
		dispatch(handleOpenModal(false));
	};

	return (
		<Modal isOpen={isOpen} className={s.downloadModal} close={handleCloseModal}>
			<div className={s.modalContent} onClick={e => e.stopPropagation()}>
				<Button className={s.closeBtn} onClick={() => handleCloseModal()}>
					<CloseIcon />
				</Button>
				<DownloadFiles title='Скачать список' btnText='Скачать список' />
			</div>
		</Modal>
	);
};
