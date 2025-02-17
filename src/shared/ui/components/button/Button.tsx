import { FC, PropsWithChildren } from 'react';

import clsx from 'clsx';

import s from './button.module.scss';

interface IButton {
	className?: string;
	variant?: 'link' | 'primary' | 'icon';
	onClick?: () => void;
	type?: 'button' | 'submit';
	isDisabled?: boolean;
	title?: string;
}

export const Button: FC<PropsWithChildren<IButton>> = ({
	children,
	className,
	variant,
	onClick,
	type = 'button',
	isDisabled,
	title
}) => {
	const btnClass = clsx(s.button, s[variant!], className);

	return (
		<button className={btnClass} onClick={onClick} type={type} disabled={isDisabled} title={title}>
			{children}
		</button>
	);
};
