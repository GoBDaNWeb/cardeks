import { useDispatch } from 'react-redux';

import { setFilterActive } from '@/features/route-form';

import { setBuildRoute, setChangeRoute, setRouteBuilded } from '@/entities/map';

import { useTypedSelector } from '@/shared/lib';
import { ListIcon, MenuButton, RouteIcon } from '@/shared/ui';

import { clearActiveMenu, setActiveMenu } from '../model';

import s from './menu-list.module.scss';

export const MenuList = () => {
	const dispatch = useDispatch();
	const { activeMenu } = useTypedSelector(store => store.menu);
	const {
		mapInfo: { totalPoints }
	} = useTypedSelector(state => state.map);
	const handleSelectMenu = (menu: 'objects-list' | 'route') => {
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
				count={totalPoints}
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
