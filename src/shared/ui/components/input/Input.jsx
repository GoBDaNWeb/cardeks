import clsx from 'clsx';

import s from './input.module.scss';

export const Input = ({
	placeholder,
	value,
	field,
	register,
	id,
	onChange,
	isStyled,
	onFocus,
	onBlur
}) => {
	const inputClass = clsx(s.input, { [s.styled]: isStyled });
	return (
		<>
			{field ? (
				<input
					type='text'
					className={inputClass}
					placeholder={placeholder}
					name={field.name}
					value={field.value}
					onChange={field.onChange}
					onBlur={field.onBlur}
				/>
			) : register ? (
				<input
					type='text'
					className={inputClass}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					{...register(id)}
					onFocus={onFocus}
					onBlur={onBlur}
				/>
			) : (
				<input
					type='text'
					className={inputClass}
					placeholder={placeholder}
					onChange={onChange}
					value={value}
					onFocus={onFocus}
					onBlur={onBlur}
				/>
			)}
		</>
	);
};
