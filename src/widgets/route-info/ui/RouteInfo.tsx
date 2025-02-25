import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { setOpenFilters, setSelectedFilter, setСlearFilters } from '@/widgets/filters';
import { clearActiveMenu } from '@/widgets/menu-list';

import { setBuildRoute, setChangeRoute, setIsUrlBuid, setRouteBuilded } from '@/entities/map';

import { useTypedSelector } from '@/shared/lib';

import { RouteInfoDetail } from './route-info-detail';
import { RouteInfoShort } from './route-info-short';
import s from './route-info.module.scss';

export const RouteInfo = () => {
	const [isDetail, setDetail] = useState(false);

	const dispatch = useDispatch();

	const { activeMenu } = useTypedSelector(store => store.menu);
	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);
	const {
		routeInfo: { routeIsBuilded }
	} = useTypedSelector(state => state.map);

	const handleClose = () => {
		dispatch(setBuildRoute(false));
		dispatch(setRouteBuilded(false));
		dispatch(setChangeRoute(false));
		dispatch(clearActiveMenu());
		dispatch(setСlearFilters(true));
		dispatch(setOpenFilters(false));
		dispatch(setIsUrlBuid(false));
		dispatch(setSelectedFilter(null));
		setTimeout(() => {
			dispatch(setСlearFilters(false));
		}, 300);
	};

	const handleDetail = (status: boolean) => {
		setDetail(status);
	};

	useEffect(() => {
		if (routeIsBuilded) {
			setDetail(false);
		}
	}, [routeIsBuilded]);

	const routeInfoClass = clsx(s.routeInfo, {
		[s.ready]: activeMenu === 'route' || mobileActiveMenu === 'route',
		[s.active]:
			(routeIsBuilded && activeMenu === 'route') || (routeIsBuilded && mobileActiveMenu === 'route')
	});

	return (
		<div className={routeInfoClass}>
			{isDetail ? (
				<RouteInfoDetail setDetail={() => handleDetail(false)} />
			) : (
				<RouteInfoShort handleClose={() => handleClose()} setDetail={() => handleDetail(true)} />
			)}
		</div>
	);
};
