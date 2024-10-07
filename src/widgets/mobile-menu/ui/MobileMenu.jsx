import { useDispatch, useSelector } from 'react-redux';

import { setFilterActive } from '@/features/route-form';

import { setActiveMenu } from '@/entities/mobile-menu';

import { Button, FilterIcon, ListIcon, RouteIcon, SearchIcon } from '@/shared/ui';

import s from './mobile-menu.module.scss';

export const MobileMenu = () => {
	const dispatch = useDispatch();

	const { activeMenu } = useSelector(store => store.mobileMenu);

	const handleSetActiveMenu = type => {
		if (activeMenu === type) {
			dispatch(setActiveMenu(null));
			dispatch(setFilterActive(false));
		} else {
			dispatch(setActiveMenu(type));
			if (type !== 'filters') {
				dispatch(setFilterActive(false));
			}
		}
	};

	return (
		<div className={s.mobileMenu}>
			<div className={s.menuBtns}>
				<Button onClick={() => handleSetActiveMenu('search')}>
					<SearchIcon />
				</Button>
				<Button onClick={() => handleSetActiveMenu('filters')}>
					<FilterIcon />
				</Button>
				<Button onClick={() => handleSetActiveMenu('objects')}>
					<ListIcon />
				</Button>
				<Button onClick={() => handleSetActiveMenu('route')}>
					<RouteIcon />
				</Button>
			</div>
		</div>
	);
};
