import { useState } from 'react';
import { FC } from 'react';

import s from './checkbox.module.scss';

type CheckboxType = {
	label?: string;
	isChecked?: boolean;
};

export const Checkbox: FC<CheckboxType> = ({ label, isChecked = false }) => {
	const [isActive, setActive] = useState(isChecked);

	const handleChange = () => {
		if (isChecked) {
			setActive(prevActive => !prevActive);
		}
	};

	return (
		<>
			{label ? (
				<label className={s.checkboxWrapper}>
					<input
						checked={isActive}
						onChange={handleChange}
						className={s.checkbox}
						type='checkbox'
					/>
					<p>{label}</p>
				</label>
			) : (
				<input checked={isActive} onChange={handleChange} className={s.checkbox} type='checkbox' />
			)}
		</>
	);
};
