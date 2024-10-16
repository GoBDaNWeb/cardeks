import { FC, PropsWithChildren } from 'react';

import clsx from 'clsx';

import s from './button.module.scss';

type ButtonType = {
	className?: string;
	variant?: 'link' | 'primary' | 'icon';
	onClick: () => void;
	type?: 'button' | 'submit';
	isDisabled?: boolean;
};

export const Button: FC<PropsWithChildren<ButtonType>> = ({
	children,
	className,
	variant,
	onClick,
	type = 'button',
	isDisabled
}) => {
	const btnClass = clsx(s.button, s[variant!], className);

	return (
		<button className={btnClass} onClick={onClick} type={type} disabled={isDisabled}>
			{children}
		</button>
	);
};
