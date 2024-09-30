import clsx from 'clsx';

import s from './button.module.scss';

export const Button = ({ children, className, variant, onClick, type = 'button', isDisabled }) => {
	const btnClass = clsx(s.button, s[variant], className);

	return (
		<button className={btnClass} onClick={onClick} type={type} disabled={isDisabled}>
			{children}
		</button>
	);
};
