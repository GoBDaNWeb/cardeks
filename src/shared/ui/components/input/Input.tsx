import { FC, ReactElement } from 'react';
import { FieldValues, UseFormRegister } from 'react-hook-form';

import clsx from 'clsx';

import { FieldType } from '@/shared/types';

import s from './input.module.scss';

interface IInput {
	placeholder: string;
	value?: string;
	field?: FieldType & { id: string };
	register?: UseFormRegister<FieldValues>;
	id?: string;
	onChange?: () => void;
	isStyled?: boolean;
	onFocus?: () => void;
	onBlur?: () => void;
}

export const Input: FC<IInput> = ({
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
					{...register(id)}
					onChange={onChange}
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
