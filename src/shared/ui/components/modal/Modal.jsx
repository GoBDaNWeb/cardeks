import { CSSTransition } from 'react-transition-group';

import clsx from 'clsx';

import { Portal } from '../portal';

import { useLockedBody } from './lib';
import s from './modal.module.scss';

export const Modal = ({ isOpen, className, children, close }) => {
	useLockedBody(isOpen);

	const modalClass = clsx(s.modal, className);

	return (
		<CSSTransition
			classNames={{
				enterDone: s.open,
				exit: s.exit
			}}
			in={isOpen}
			timeout={0}
		>
			<Portal rootId='#modal'>
				{isOpen ? (
					<div className={modalClass} onClick={close}>
						{children}
					</div>
				) : null}
			</Portal>
		</CSSTransition>
	);
};
