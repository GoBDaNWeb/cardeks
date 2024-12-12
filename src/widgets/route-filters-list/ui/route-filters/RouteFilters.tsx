import { FormEvent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setBrandTitle } from '@/features/route-form';
import { clearFilters, setAzsTypes } from '@/features/route-form';

import { useDebounce, useTypedSelector } from '@/shared/lib';
import { IList } from '@/shared/types';
import { Chip, Input } from '@/shared/ui';

import { addChipsList, catChipsList } from '../../config';

import s from './route-filters.module.scss';

export const RouteFilters = () => {
	const [inputBrandValue, setInputBrandValue] = useState('');
	const [mainChipActive, setMainChipActive] = useState<boolean>(false);
	const [azsType, setAzsType] = useState<IList[]>([]);
	const [catChips, setCatChips] = useState<number[]>([]);
	const { filterActive } = useTypedSelector(store => store.routeForm);
	const dispatch = useDispatch();

	const handleChangeMainChipActive = () => {
		setMainChipActive(prevChipActive => !prevChipActive);
	};
	const debounced = useDebounce(inputBrandValue);

	// const handleChangeChipActive = (index: number, type: 'add' | 'cat') => {
	// 	if (type === 'add') {
	// 		setAddChips(prevChips => {
	// 			let newChips;
	// 			if (prevChips.includes(index)) {
	// 				newChips = prevChips.filter(chip => chip !== index);
	// 			} else {
	// 				newChips = [...prevChips, index];
	// 			}
	// 			dispatch(setAzsTypes(newChips));
	// 			return newChips;
	// 		});
	// 	} else {
	// 		if (catChips.includes(index)) {
	// 			const filtered = catChips.filter(chip => chip !== index);
	// 			setCatChips(filtered);
	// 		} else {
	// 			setCatChips(prevChips => [...prevChips, index]);
	// 		}
	// 	}
	// };
	const handleChangeChipActive = (type: IList) => {
		setAzsType(prevTypes => {
			const isSet = prevTypes.some(item => item.value === type.value);
			const newTyes = isSet
				? prevTypes.filter(item => item.value !== type.value)
				: [...prevTypes, type];
			return newTyes;
		});
	};
	const handleChangeInputValue = (e: FormEvent<HTMLInputElement>) => {
		setInputBrandValue((e.target as HTMLTextAreaElement).value);
	};

	useEffect(() => {
		dispatch(setAzsTypes(azsType));
	}, [azsType, dispatch]);

	useEffect(() => {
		dispatch(setBrandTitle(inputBrandValue));
	}, [debounced]);

	useEffect(() => {
		// setInputBrandValue('');
		// setAddChips([]);
		// dispatch(clearFilters());
	}, [filterActive]);

	return (
		<div className={s.routeFilters}>
			{/* <div className={s.filterRow}>
				<p className={s.title}>Основное</p>
				<Chip onClick={handleChangeMainChipActive} isActive={mainChipActive}>
					Сбросить счетчик PIN-кода
				</Chip>
			</div> */}
			{/* <div className={s.filterRow}>
				<p className={s.title}>Карта</p>
				<Input isStyled placeholder='Номер или название' />
			</div> */}
			<div className={s.filterRow}>
				<p className={s.title}>Бренд</p>
				<Input
					onChange={handleChangeInputValue}
					value={inputBrandValue}
					isStyled
					placeholder='Номер или название'
				/>
			</div>
			<div className={s.filterRow}>
				<p className={s.title}>Дополнительные настройки</p>
				<div className={s.content}>
					{addChipsList.map(chip => (
						<Chip
							key={chip.title}
							onClick={() => handleChangeChipActive(chip)}
							isActive={azsType.some(f => f.value === chip.value)}
						>
							{chip.title}
						</Chip>
					))}
				</div>
			</div>
			{/* <div className={s.filterRow}>
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
			</div> */}
		</div>
	);
};
