import { FC, PropsWithChildren } from 'react';

import clsx from 'clsx';

import s from './dropdown.module.scss';

type DropdownType = {
	className?: string;
};

export const Dropdown: FC<PropsWithChildren<DropdownType>> = ({ className, children }) => {
	const dropdownClass = clsx(s.dropdown, className);

	return <div className={dropdownClass}>{children}</div>;
};
