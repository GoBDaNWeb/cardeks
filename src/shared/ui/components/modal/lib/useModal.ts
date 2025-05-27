import { useDispatch } from 'react-redux';

import { useTypedSelector } from '@/shared/lib';
import { ModalName, ModalProps } from '@/shared/types';

import { closeModal, openModal, updateModalProps } from '../model';

export const useModal = () => {
	const dispatch = useDispatch();
	const { currentModal, props } = useTypedSelector(state => state.modals);

	const open = (name: ModalName, props?: ModalProps) => dispatch(openModal({ name, props }));

	const close = () => dispatch(closeModal());

	const update = (props: ModalProps) => dispatch(updateModalProps(props));

	return {
		currentModal,
		props,
		open,
		close,
		update,
		isOpen: (name: ModalName) => currentModal === name
	};
};
