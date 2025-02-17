import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setFilterActive } from '@/features/route-form';

import { setBuildRoute, setChangeRoute, setRouteBuilded } from '@/entities/map';
import { setActiveObject } from '@/entities/object-info';

import { useGetPointsQuery } from '@/shared/api';
import { useIndexedDB, useTypedSelector } from '@/shared/lib';
import { ListIcon, MenuButton, RouteIcon } from '@/shared/ui';

import { clearActiveMenu, setActiveMenu } from '../model';

import s from './menu-list.module.scss';

export const MenuList = () => {
	const [totalAzs, setTotalAzs] = useState(0);
	const dispatch = useDispatch();
	const { activeMenu } = useTypedSelector(store => store.menu);
	const { isLoading } = useGetPointsQuery();

	const { getAllData } = useIndexedDB();
	const fetch = async () => {
		const data = await getAllData();
		setTotalAzs(data.length);
	};

	useEffect(() => {
		if (!isLoading) {
			fetch();
		}
	}, [isLoading]);

	const handleSelectMenu = (menu: 'objects-list' | 'route') => {
		dispatch(setBuildRoute(false));
		dispatch(setRouteBuilded(false));
		dispatch(setChangeRoute(false));
		dispatch(setActiveObject(null));

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
				count={totalAzs}
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
