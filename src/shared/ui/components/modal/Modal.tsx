import { FC, PropsWithChildren, forwardRef, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

import clsx from 'clsx';

import { Portal } from '../portal';

import { useLockedBody } from './lib';
import s from './modal.module.scss';
import './modal.scss';

interface IModal {
	isOpen: boolean;
	className?: string;
	close: () => void;
}

export const Modal: FC<PropsWithChildren<IModal>> = forwardRef(
	({ isOpen, className, children, close }, ref) => {
		useLockedBody(isOpen);
		const nodeRef = useRef<HTMLDivElement | null>(null);
		const modalClass = clsx(s.modal, className);
		return (
			<Portal rootId='#modal'>
				<CSSTransition
					classNames='modal'
					unmountOnExit
					in={isOpen}
					timeout={{ exit: 300, enter: 0 }}
					nodeRef={nodeRef}
				>
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
				</CSSTransition>
			</Portal>
		);
	}
);
Modal.displayName = 'Modal';
