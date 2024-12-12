import { FC, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { setWithFilters } from '@/features/route-form';

import { useTypedSelector } from '@/shared/lib';
import { Accordion, ArrowDownIcon, Button, Checkbox, Chip, FilterIcon, Input } from '@/shared/ui';

import { settingInputs, settingTabs } from '../../config';
import { setAddSettings, setFilterActive } from '../../model';

import s from './route-settings.module.scss';

interface IAccordionTitle {
	handleOpen: () => void;
	isShow: boolean;
}

const AccordionTitle: FC<IAccordionTitle> = ({ handleOpen, isShow }) => {
	const [filters, setFilters] = useState(true);

	const dispatch = useDispatch();

	const { filterActive } = useTypedSelector(store => store.routeForm);

	const handleOpenFilters = () => {
		dispatch(setFilterActive(!filterActive));
	};

	const handleChangeCheckbox = () => {
		setFilters(prevState => {
			dispatch(setWithFilters(!prevState));
			return !prevState;
		});
	};

	const moreBtnClass = clsx(s.moreBtn, { [s.active]: isShow });
	return (
		<div className={s.accorionTitle}>
			<div className={s.filtersBtns}>
				<Checkbox onChange={handleChangeCheckbox} isChecked={filters} label='Учитывать фильтры' />
				<Button onClick={handleOpenFilters} className={s.filterBtn} variant='link'>
					<FilterIcon />
					<p>Фильтры</p>
				</Button>
			</div>
			<Button onClick={handleOpen} className={moreBtnClass} variant='link'>
				<ArrowDownIcon /> <p>Другие настройки</p>
			</Button>
		</div>
	);
};

const AccordionContent = () => {
	const [activeChips, setActiveChips] = useState<number[]>([]);

	const dispatch = useDispatch();

	const handleSelectChip = (index: number) => {
		setActiveChips(prevChips => {
			const newChips = prevChips.includes(index)
				? prevChips.filter(chip => chip !== index)
				: [...prevChips, index];

			// Вызываем dispatch с обновленным состоянием
			dispatch(setAddSettings(newChips));

			return newChips;
		});
	};

	return (
		<div className={s.accordionContent}>
			<div className={s.accordionContentTop}>
				<p>Дополнительные настройки</p>
				<div className={s.chipList}>
					{settingTabs.map((tab, index) => (
						<Chip
							key={tab}
							isActive={activeChips.includes(index)}
							onClick={() => handleSelectChip(index)}
						>
							{tab}
						</Chip>
					))}
				</div>
			</div>
			{/* <div className={s.accordionContentBottom}>
				<p>Расчет остановок для заправки</p>
				<div className={s.inputList}>
					{settingInputs.map(input => (
						<div key={input.title} className={s.inputWrapper}>
							<p>{input.title}</p>
							<Input placeholder={input.placeholder} isStyled />
						</div>
					))}
				</div>
			</div> */}
		</div>
	);
};

export const RouteSettings = () => {
	const [isShow, setShow] = useState(false);

	const handleOpenAccordion = useCallback(() => {
		setShow(prevShow => !prevShow);
	}, []);

	return (
		<div className={s.routeSettings}>
			<Accordion
				isShow={isShow}
				title={<AccordionTitle handleOpen={handleOpenAccordion} isShow={isShow} />}
				content={<AccordionContent />}
			/>
		</div>
	);
};
