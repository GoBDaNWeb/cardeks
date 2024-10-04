import { forwardRef, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

import clsx from 'clsx';

import { Portal } from '../portal';

import { useLockedBody } from './lib';
import s from './modal.module.scss';

export const Modal = forwardRef(({ isOpen, className, children, close }, ref) => {
	useLockedBody(isOpen);
	const nodeRef = useRef(null);
	const modalClass = clsx(s.modal, className);

	return (
		<CSSTransition
			classNames={{
				enterDone: s.open,
				exit: s.exit
			}}
			in={isOpen}
			timeout={0}
			nodeRef={nodeRef}
		>
			<Portal rootId='#modal'>
				{isOpen ? (
					<div
						className={modalClass}
						onClick={close}
						ref={el => {
							nodeRef.current = el; // Присваиваем ref элементу
							if (typeof ref === 'function') {
								ref(el); // Передаем ref в родительский компонент
							} else if (ref) {
								ref.current = el;
							}
						}}
					>
						{children}
					</div>
				) : null}
			</Portal>
		</CSSTransition>
	);
});
Modal.displayName = 'Modal';
