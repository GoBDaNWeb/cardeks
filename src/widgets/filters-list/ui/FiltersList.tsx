import { useCallback, useState } from 'react';
import React from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import {
	setAddServices,
	setBrandTitles,
	setFuelFilters,
	setGateHeight,
	setOpenFilters
} from '@/widgets/filters';

import { useTypedSelector } from '@/shared/lib';
import { ArrowTopIcon, Button, CloseIcon } from '@/shared/ui';

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

	const filterListClass = clsx(s.filtersList, {
		[s.left]: activeMenu || objectId,
		[s.active]: filtersIsOpen
	});

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
