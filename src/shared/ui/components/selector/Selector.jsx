import Select from 'react-select';

import clsx from 'clsx';

export const Selector = ({
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
