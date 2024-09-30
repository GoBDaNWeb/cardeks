import clsx from 'clsx';

import s from './input.module.scss';

export const Input = ({ placeholder, value, field, register, id, required, isStyled }) => {
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
					{...register(id)}
				/>
			) : (
				<input type='text' className={inputClass} placeholder={placeholder} value={value} />
			)}
		</>
	);
};
