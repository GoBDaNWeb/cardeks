import { FormEvent, useCallback, useState } from 'react';
import React from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import {
	setAddServices,
	setBrandTitles,
	setFuelFilters,
	setGateHeight,
	setOpenFilters,
	setTerminal
} from '@/widgets/filters';

import { useTypedSelector } from '@/shared/lib';
import { ArrowTopIcon, Button, CloseIcon, Input } from '@/shared/ui';

import { AZSFilters } from './azs-filters';
import s from './filters-list.module.scss';
import { TireFilters } from './tire-filters';
import { WashFilters } from './wash-filters';

const filters = [
	{
		title: 'АЗС / АГЗС',
		content: <AZSFilters />
	},
	{ title: 'Шиномонтаж', content: <TireFilters /> },
	{ title: 'Мойка', content: <WashFilters /> }
];

export const FiltersList = () => {
	const [resetFilters, setResetFilters] = useState(false);
	const [inputTerminalValue, setInputTerminalValue] = useState('');

	const dispatch = useDispatch();

	const { selectedFilter, filtersIsOpen } = useTypedSelector(store => store.filters);
	const { activeMenu } = useTypedSelector(state => state.menu);
	const { objectId } = useTypedSelector(store => store.objectInfo);

	const handleCloseFiltersList = () => {
		dispatch(setOpenFilters(false));
	};
	const clearFilters = useCallback(() => {
		dispatch(setBrandTitles([]));
		dispatch(setFuelFilters([]));
		dispatch(setAddServices([]));
		dispatch(setGateHeight(null));

		setResetFilters(prev => !prev);
	}, []);

	const handleChangeInputValue = (e: FormEvent<HTMLInputElement>) => {
		const value = (e.target as HTMLInputElement).value;
		setInputTerminalValue(value);
		dispatch(setTerminal(value));
	};

	const filterListClass = clsx(s.filtersList, {
		[s.left]: activeMenu || objectId,
		[s.active]: filtersIsOpen
	});

	const terminalClass = clsx(s.filterRow, s.terminalWrapper);

	return (
		<div className={filterListClass}>
			<div className={s.filterListTop}>
				<h5>{filters[selectedFilter].title}</h5>
				<Button onClick={() => handleCloseFiltersList()} className={s.closeBtn}>
					<CloseIcon />
				</Button>
			</div>
			<div className={s.filterContentWrapper}>
				{filters[selectedFilter].content &&
					React.cloneElement(filters[selectedFilter].content, { resetFilters })}
				<div className={terminalClass}>
					<p>Введите код объекта</p>
					<div className={s.inputList}>
						<Input
							onChange={handleChangeInputValue}
							value={inputTerminalValue}
							isStyled
							placeholder='Введите код'
						/>
					</div>
				</div>
			</div>
			<div className={s.filterListBottom}>
				<Button onClick={() => handleCloseFiltersList()} className={s.closeBtn}>
					<ArrowTopIcon />
					<p>Свернуть</p>
				</Button>
				<Button onClick={() => clearFilters()} className={s.clearBtn}>
					<p>Сбросить фильтры</p>
				</Button>
			</div>
		</div>
	);
};
