import { FC, FormEvent, useState } from 'react';

import clsx from 'clsx';

import { Button, CloseIcon, Dropdown, Input } from '@/shared/ui';

import s from './searchable-dropdown.module.scss';

interface SearchableDropdownProps {
	value: string;
	onChange: (e: FormEvent<HTMLInputElement>) => void;
	onClear?: () => void;
	onSelect: (item: string) => void;
	items: string[];
	placeholder?: string;
	className?: string;
	dropdownClassName?: string;
}

export const SearchableDropdown: FC<SearchableDropdownProps> = ({
	value,
	onChange,
	onClear,
	onSelect,
	items,
	placeholder = 'Название',
	className,
	dropdownClassName
}) => {
	const [isDropdownActive, setIsDropdownActive] = useState(false);
	const [activeItem, setActiveItem] = useState<number>(0);

	const handleFocus = () => {
		console.log('isDropdownActive', isDropdownActive);
		setIsDropdownActive(true);
	};

	const handleBlur = () => {
		console.log('isDropdownActive', isDropdownActive);

		setTimeout(() => {
			setIsDropdownActive(false);
		}, 200);
	};

	const dropdownClass = clsx(s.dropdown, dropdownClassName, {
		[s.active]: isDropdownActive
	});

	return (
		<div className={`${s.wrapper} ${className || ''}`}>
			<div className={s.inputWrapper}>
				<Input
					onChange={onChange}
					value={value}
					isStyled
					placeholder={placeholder}
					onFocus={handleFocus}
					onBlur={handleBlur}
				/>
				{value.length ? (
					<Button className={s.clearIcon} onClick={onClear}>
						<CloseIcon />
					</Button>
				) : null}
			</div>

			<Dropdown className={dropdownClass}>
				{items.length > 0
					? items.map((item: string, index: number) => (
							<div
								onMouseEnter={() => setActiveItem(index)}
								className={clsx(s.item, { [s.active]: index === activeItem })}
								key={index}
								onClick={() => onSelect(item)}
							>
								{item}
							</div>
						))
					: null}
			</Dropdown>
		</div>
	);
};
