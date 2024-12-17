import { FC } from 'react';
import { UseFormRegister } from 'react-hook-form';

import clsx from 'clsx';

import { Button, CloseIcon, Input, SearchIcon } from '@/shared/ui';

import s from './route-input.module.scss';

type RouteFormValues = {
	points: {
		inputText: string;
	}[];
};
type FieldsType = {
	inputText: string;
	id: string;
};
type InputIdType = `points.${number}.inputText` | 'points' | `points.${number}`;

interface IRouteInput {
	letter: string;
	removeQuestion: () => void;
	id: InputIdType;
	handleSelectPoint: () => void;
	onChange: (e: any) => void;
	handleFocus: () => void;
	handleBlur: () => void;
	isSelect: boolean;
	fields: FieldsType[];
	register?: UseFormRegister<RouteFormValues>;
}

export const RouteInput: FC<IRouteInput> = ({
	letter,
	removeQuestion,
	register,
	id,
	fields,
	handleSelectPoint,
	onChange,
	handleFocus,
	handleBlur,
	isSelect
}) => {
	const searchBtnClass = clsx({ [s.active]: isSelect });

	return (
		<div className={s.routeInput}>
			<p className={s.letter}>{letter}</p>
			<Input
				id={id}
				register={register}
				placeholder='Регион, город, улица, трасса'
				onChange={onChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>
			<div className={s.features}>
				{fields.length > 2 && (
					<Button onClick={removeQuestion}>
						<CloseIcon />
					</Button>
				)}
				<Button onClick={handleSelectPoint} className={searchBtnClass}>
					<SearchIcon />
				</Button>
			</div>
		</div>
	);
};
