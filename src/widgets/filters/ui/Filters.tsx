import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { useTypedSelector } from '@/shared/lib';
import { AZSIcon, FilterIcon, FilterTab, TireIcon, WashIcon } from '@/shared/ui';

import { setOpenFilters, setSelectedFilter } from '../model';

import s from './filters.module.scss';

export const Filters = () => {
	const [activeTab, setActiveTab] = useState<number | null>(null);

	const dispatch = useDispatch();
	const { activeMenu } = useTypedSelector(state => state.menu);
	const { filterActive } = useTypedSelector(store => store.routeForm);
	const { filtersIsOpen } = useTypedSelector(store => store.filters);
	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);
	const {
		mapInfo: {
			pointsData,
			totalViewPoints,
			totalWashing,
			totalTire,
			totalViewWashing,
			totalViewTire,
			totalAzsPoints,
			totalViewAzsPoints
		},
		routeInfo: { changeRoute }
	} = useTypedSelector(state => state.map);
	const {
		routeInfo: { routeIsBuilded }
	} = useTypedSelector(state => state.map);

	const handleActiveTab = (index: number) => {
		if (index === activeTab) {
			setActiveTab(null);
			dispatch(setOpenFilters(false));
		} else {
			setActiveTab(index);
			// dispatch(setMapLoading(true));
			setTimeout(() => {
				dispatch(setOpenFilters(true));
				dispatch(setSelectedFilter(index));
			}, 500);
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
		[s.hide]: (routeIsBuilded && activeMenu === 'route') || mobileActiveMenu !== null || changeRoute
	});

	const filterTabs = [
		{
			title: 'АЗС / АГЗС',
			icon: <AZSIcon />,
			totalCount: pointsData.azs.total,
			viewCount: pointsData.azs.totalView
		},
		{
			title: 'Шиномонтаж',
			icon: <TireIcon />,
			totalCount: pointsData.tire.total,
			viewCount: pointsData.tire.totalView
		},
		{
			title: 'Мойка',
			icon: <WashIcon />,
			totalCount: pointsData.washing.total,
			viewCount: pointsData.washing.totalView
		}
	];
	return (
		<div className={filtersClass}>
			<div className={s.filtersTop}>
				<div className={s.title}>
					<div className={s.icon}>
						<FilterIcon />
					</div>
					<p>Фильтры</p>
				</div>
				<p className={s.total}>На карте: {pointsData.points.totalView}</p>
			</div>
			<div className={s.filtersTabs}>
				{filterTabs.map((tab, index) => (
					<FilterTab
						onClick={() => handleActiveTab(index)}
						key={tab.title}
						title={tab.title}
						icon={tab.icon}
						isActive={index === activeTab}
						viewCount={tab.viewCount}
						totalCount={tab.totalCount}
					/>
				))}
			</div>
		</div>
	);
};
