import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

import { setOpenFilters } from '@/widgets/filters';
import { setActiveMenu } from '@/widgets/menu-list';

import { setFilterActive } from '@/features/route-form';

import { setBuildRoute, setChangeRoute, setRouteBuilded } from '@/entities/map';
import { setActiveMenu as setActiveMobileMenu } from '@/entities/mobile-menu';

import { useTypedSelector } from '@/shared/lib';
import { Button, FilterIcon, ListIcon, RouteIcon, SearchIcon } from '@/shared/ui';

import s from './mobile-menu.module.scss';

type MenuType = 'search' | 'filters' | 'objects' | 'route';

interface IMenuList {
	icon: ReactElement;
	type: MenuType;
}

const menuList: IMenuList[] = [
	{
		icon: <SearchIcon />,
		type: 'search'
	},
	{
		icon: <FilterIcon />,
		type: 'filters'
	},
	{
		icon: <ListIcon />,
		type: 'objects'
	},
	{
		icon: <RouteIcon />,
		type: 'route'
	}
];

export const MobileMenu = () => {
	const dispatch = useDispatch();
	const { activeMenu } = useTypedSelector(store => store.menu);

	const { activeMenu: activeMenuMobile } = useTypedSelector(store => store.mobileMenu);

	const handleSetActiveMenu = (type: 'search' | 'filters' | 'objects' | 'route') => {
		if (type === 'filters') {
			dispatch(setOpenFilters(true));
			console.log('da');
		}
		if (activeMenuMobile === type) {
			dispatch(setActiveMobileMenu(null));
			dispatch(setActiveMenu(null));

			// dispatch(setFilterActive(false));
			dispatch(setBuildRoute(false));
			dispatch(setRouteBuilded(false));
			dispatch(setChangeRoute(false));
			dispatch(setOpenFilters(false));
		} else {
			dispatch(setActiveMenu(type));
			dispatch(setActiveMobileMenu(type));
			// if (type !== 'filters') {
			// 	dispatch(setFilterActive(false));
			// }
		}
	};

	return (
		<div className={s.mobileMenu}>
			<div className={s.menuBtns}>
				{menuList.map(item => (
					<Button
						key={item.type}
						onClick={() => handleSetActiveMenu(item.type)}
						className={item.type == activeMenu ? s.active : ''}
					>
						{item.icon}
					</Button>
				))}
			</div>
		</div>
	);
};
