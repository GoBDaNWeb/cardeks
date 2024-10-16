import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { useTypedSelector } from '@/shared/lib';
import { AZSIcon, FilterIcon, FilterTab, TireIcon, WashIcon } from '@/shared/ui';

import { setOpenFilters, setSelectedFilter } from '../model';

import s from './filters.module.scss';

const filterTabs = [
	{ title: 'АЗС / АГЗС', icon: <AZSIcon /> },
	{ title: 'Шиномонтаж', icon: <TireIcon /> },
	{ title: 'Мойка', icon: <WashIcon /> }
];

export const Filters = () => {
	const [activeTab, setActiveTab] = useState<number | null>(null);

	const dispatch = useDispatch();
	const { activeMenu } = useTypedSelector(state => state.menu);
	const { filterActive } = useTypedSelector(store => store.routeForm);
	const { filtersIsOpen } = useTypedSelector(store => store.filters);
	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);

	const {
		routeInfo: { routeIsBuilded }
	} = useTypedSelector(state => state.map);

	const handleActiveTab = (index: number) => {
		if (index === activeTab) {
			setActiveTab(null);
			dispatch(setOpenFilters(false));
		} else {
			dispatch(setSelectedFilter(index));
			dispatch(setOpenFilters(true));
			setActiveTab(index);
		}
	};

	useEffect(() => {
		if (!filtersIsOpen) {
			setActiveTab(null);
		}
	}, [filtersIsOpen]);
	useEffect(() => {
		if (mobileActiveMenu !== null) {
			setActiveTab(null);
			dispatch(setOpenFilters(false));
		}
	}, [mobileActiveMenu]);

	const filtersClass = clsx(s.filters, {
		[s.left]: activeMenu === 'route',
		[s.routeFilterActive]: filterActive || filtersIsOpen,
		[s.hide]: (routeIsBuilded && activeMenu === 'route') || mobileActiveMenu !== null
	});

	return (
		<div className={filtersClass}>
			<div className={s.filtersTop}>
				<div className={s.title}>
					<div className={s.icon}>
						<FilterIcon />
					</div>
					<p>Фильтры</p>
				</div>
				<p className={s.total}>На карте: 551</p>
			</div>
			<div className={s.filtersTabs}>
				{filterTabs.map((tab, index) => (
					<FilterTab
						onClick={() => handleActiveTab(index)}
						key={tab.title}
						title={tab.title}
						icon={tab.icon}
						isActive={index === activeTab}
						viewCount='5'
						totalCount='19 411'
					/>
				))}
			</div>
		</div>
	);
};
