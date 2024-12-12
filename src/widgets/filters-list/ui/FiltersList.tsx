import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { setOpenFilters } from '@/widgets/filters';

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
	const dispatch = useDispatch();

	const { selectedFilter, filtersIsOpen } = useTypedSelector(store => store.filters);
	const { activeMenu } = useTypedSelector(state => state.menu);

	const handleCloseFiltersList = () => {
		dispatch(setOpenFilters(false));
	};

	const filterListClass = clsx(s.filtersList, {
		[s.left]: activeMenu,
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
			<div className={s.filterContentWrapper}>{filters[selectedFilter].content}</div>
			<div className={s.filterListBottom}>
				<Button onClick={() => handleCloseFiltersList()} className={s.closeBtn}>
					<ArrowTopIcon />
					<p>Свернуть</p>
				</Button>
			</div>
		</div>
	);
};
