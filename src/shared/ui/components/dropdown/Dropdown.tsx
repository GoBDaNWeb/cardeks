import { FC, PropsWithChildren } from 'react';

import clsx from 'clsx';

import s from './dropdown.module.scss';

interface IDropdown {
	className?: string;
	onMouseLeave?: () => void;
}

export const Dropdown: FC<PropsWithChildren<IDropdown>> = ({ className, children }) => {
	const dropdownClass = clsx(s.dropdown, className);

	return <div className={dropdownClass}>{children}</div>;
};
