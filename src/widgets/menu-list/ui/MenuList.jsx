import { useDispatch, useSelector } from 'react-redux';

import { setFilterActive } from '@/features/route-form';

import { setBuildRoute, setChangeRoute, setRouteBuilded } from '@/entities/map';

import { ListIcon, MenuButton, RouteIcon } from '@/shared/ui';

import { clearActiveMenu, setActiveMenu } from '../model';

import s from './menu-list.module.scss';

export const MenuList = () => {
	const dispatch = useDispatch();
	const { activeMenu } = useSelector(store => store.menu);

	const handleSelectMenu = menu => {
		dispatch(setBuildRoute(false));
		dispatch(setRouteBuilded(false));
		dispatch(setChangeRoute(false));

		if (menu === activeMenu) {
			dispatch(clearActiveMenu());
			dispatch(setFilterActive(false));
		} else {
			dispatch(setActiveMenu(menu));
			dispatch(setFilterActive(false));
		}
	};

	return (
		<div className={s.menu}>
			<MenuButton
				onClick={() => handleSelectMenu('objects-list')}
				icon={<ListIcon />}
				isActive={activeMenu === 'objects-list'}
				text='Список ТО'
				count='20 838'
			/>
			<MenuButton
				onClick={() => handleSelectMenu('route')}
				isActive={activeMenu === 'route'}
				icon={<RouteIcon />}
				text='Построить маршрут'
			/>
		</div>
	);
};
