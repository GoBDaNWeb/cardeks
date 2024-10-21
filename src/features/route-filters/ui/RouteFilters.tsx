import { useState } from 'react';

import { Chip, Input } from '@/shared/ui';

import { addChipsList, catChipsList } from '../config';

import s from './route-filters.module.scss';

export const RouteFilters = () => {
	const [mainChipActive, setMainChipActive] = useState<boolean>(false);
	const [addChips, setAddChips] = useState<number[]>([]);
	const [catChips, setCatChips] = useState<number[]>([]);

	const handleChangeMainChipActive = () => {
		setMainChipActive(prevChipActive => !prevChipActive);
	};

	const handleChangeChipActive = (index: number, type: 'add' | 'cat') => {
		if (type === 'add') {
			if (addChips.includes(index)) {
				const filtered = addChips.filter(chip => chip !== index);
				setAddChips(filtered);
			} else {
				setAddChips(prevChips => [...prevChips, index]);
			}
		} else {
			if (catChips.includes(index)) {
				const filtered = catChips.filter(chip => chip !== index);
				setCatChips(filtered);
			} else {
				setCatChips(prevChips => [...prevChips, index]);
			}
		}
	};

	return (
		<div className={s.routeFilters}>
			<div className={s.filterRow}>
				<p className={s.title}>Основное</p>
				<Chip onClick={handleChangeMainChipActive} isActive={mainChipActive}>
					Сбросить счетчик PIN-кода
				</Chip>
			</div>
			<div className={s.filterRow}>
				<p className={s.title}>Карта</p>
				<Input isStyled placeholder='Номер или название' />
			</div>
			<div className={s.filterRow}>
				<p className={s.title}>Бренд</p>
				<Input isStyled placeholder='Номер или название' />
			</div>
			<div className={s.filterRow}>
				<p className={s.title}>Дополнительные настройки</p>
				<div className={s.content}>
					{addChipsList.map((chip, index) => (
						<Chip
							key={chip}
							onClick={() => handleChangeChipActive(index, 'add')}
							isActive={addChips.includes(index)}
						>
							{chip}
						</Chip>
					))}
				</div>
			</div>
			<div className={s.filterRow}>
				<p className={s.title}>Выделить категории</p>
				<div className={s.content}>
					{catChipsList.map((chip, index) => (
						<Chip
							key={chip}
							onClick={() => handleChangeChipActive(index, 'cat')}
							isActive={catChips.includes(index)}
						>
							{chip}
						</Chip>
					))}
				</div>
			</div>
		</div>
	);
};
