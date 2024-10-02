import clsx from 'clsx';

import s from './dropdown.module.scss';

export const Dropdown = ({ className, children }) => {
	const dropdownClass = clsx(s.dropdown, className);

	return <div className={dropdownClass}>{children}</div>;
};
