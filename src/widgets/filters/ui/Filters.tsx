import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { useTypedSelector } from '@/shared/lib';
import { AZSIcon, Button, FilterIcon, FilterTab, TireIcon, WashIcon } from '@/shared/ui';

import { setOpenFilters, setSelectedFilter, setСlearFilters } from '../model';

import s from './filters.module.scss';

export const Filters = () => {
	const [activeTab, setActiveTab] = useState<number | null>(null);

	const dispatch = useDispatch();
	const { activeMenu } = useTypedSelector(state => state.menu);
	const { filterActive } = useTypedSelector(store => store.routeForm);
	const { filtersIsOpen, selectedFilter, filters } = useTypedSelector(store => store.filters);
	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);
	const {
		mapInfo: { pointsData },
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

	const handleClearFilters = () => {
		dispatch(setСlearFilters(true));
		dispatch(setOpenFilters(false));
		dispatch(setSelectedFilter(null));
		setTimeout(() => {
			dispatch(setСlearFilters(false));
		}, 0);
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

	const condition =
		selectedFilter !== null ||
		filters.fuelFilters.length > 0 ||
		filters.brandTitles.length > 0 ||
		filters.addServices.length > 0 ||
		filters.features.length > 0 ||
		filters.gateHeight !== null ||
		filters.terminal.length > 0;

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

	const totalFilters = () => {
		const gate = filters.gateHeight ? 1 : 0;
		const teminal = filters.terminal.length ? 1 : 0;
		const addServices = filters.addServices.length ? filters.addServices.length - 1 : 0;
		return (
			filters.fuelFilters.length +
			filters.brandTitles.length +
			addServices +
			filters.features.length +
			teminal +
			gate
		);
	};

	return (
		<div className={filtersClass}>
			<div className={s.filtersTop}>
				<div className={s.title}>
					<div className={s.icon}>
						<FilterIcon />
					</div>
					<p>Фильтры{totalFilters() > 0 ? <>: {totalFilters()}</> : null}</p>
				</div>
				<div className={s.rightBlock}>
					{condition ? (
						<Button onClick={() => handleClearFilters()} className={s.clearBtn}>
							<p>Сбросить фильтры</p>
						</Button>
					) : null}

					<p className={s.total}>На карте: {pointsData.points.totalView}</p>
				</div>
			</div>
			<div className={s.filtersTabs}>
				{filterTabs.map((tab, index) => (
					<FilterTab
						onClick={() => handleActiveTab(index)}
						key={tab.title}
						title={tab.title}
						icon={tab.icon}
						isActive={index === activeTab}
						isSelected={index === selectedFilter}
						viewCount={tab.viewCount}
						totalCount={tab.totalCount}
					/>
				))}
			</div>
		</div>
	);
};
