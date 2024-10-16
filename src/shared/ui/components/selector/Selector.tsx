import { FC } from 'react';
import Select, { GroupBase, OptionsOrGroups } from 'react-select';

import clsx from 'clsx';

type OptionsType = {
	value: string;
	label: string;
};

export interface ISelector {
	onFocus?: () => void;
	onBlur?: () => void;
	onChange: (...event: any[]) => void;
	options: OptionsOrGroups<string, GroupBase<string>> | undefined;
	placeholder: string;
	className?: string;
	name?: string;
	defaultValue?: string;
	value: string | null;
	onInputChange?: () => void;
	isDisabled?: boolean;
}
export const Selector: FC<ISelector> = ({
	options,
	placeholder,
	className,
	name,
	defaultValue,
	value,
	onChange,
	onInputChange,
	isDisabled
}) => {
	const selectorClass = clsx('select', className, { disabled: isDisabled });
	return (
		<Select
			onInputChange={onInputChange}
			isClearable={false}
			onChange={onChange}
			placeholder={placeholder}
			name={name}
			defaultValue={defaultValue}
			options={options}
			className={selectorClass}
			classNamePrefix='select'
			value={value}
		/>
	);
};
