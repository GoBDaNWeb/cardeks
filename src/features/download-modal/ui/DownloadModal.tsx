import { DownloadFiles } from '@/features/download-files';

import { Button, CloseIcon, Modal, useModal } from '@/shared/ui';

import s from './download-modal.module.scss';

export const DownloadModal = () => {
	const { close, isOpen } = useModal();

	const handleCloseModal = () => {
		close();
	};

	return (
		<Modal isOpen={isOpen('download')} className={s.downloadModal} close={handleCloseModal}>
			<div className={s.modalContent} onClick={e => e.stopPropagation()}>
				<Button className={s.closeBtn} onClick={() => handleCloseModal()}>
					<CloseIcon />
				</Button>
				<DownloadFiles title='Скачать список' btnText='Скачать список' />
			</div>
		</Modal>
	);
};
