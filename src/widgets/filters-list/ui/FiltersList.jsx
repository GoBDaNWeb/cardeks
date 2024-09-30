import { useDispatch, useSelector } from 'react-redux';

import clsx from 'clsx';

import { setOpenFilters } from '@/widgets/filters';

import { AZSFilters } from '@/features/azs-filters';
import { TireFilters } from '@/features/tire-filters';
import { WashFilters } from '@/features/wash-filters';

import { ArrowTopIcon, Button, CloseIcon } from '@/shared/ui';

import s from './filters-list.module.scss';

const filters = [
	{
		title: 'АЗС / АГЗС',
		content: <AZSFilters />
	},
	{ title: 'Шиномонтаж', content: <TireFilters /> },
	{ title: 'Мойка', content: <WashFilters /> }
];

export const FiltersList = () => {
	const dispatch = useDispatch();

	const { selectedFilter, filtersIsOpen } = useSelector(store => store.filters);
	const { activeMenu } = useSelector(state => state.menu);

	const handleCloseFiltersList = () => {
		dispatch(setOpenFilters(false));
	};

	const filterListClass = clsx(s.filtersList, {
		[s.left]: activeMenu === 'route',
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

			{filters[selectedFilter].content}
			<div className={s.filterListBottom}>
				<Button onClick={() => handleCloseFiltersList()} className={s.closeBtn}>
					<ArrowTopIcon />
					<p>Свернуть</p>
				</Button>
			</div>
		</div>
	);
};
