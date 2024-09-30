import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import clsx from 'clsx';

import { clearActiveMenu } from '@/widgets/menu-list';

import { setBuildRoute, setChangeRoute, setRouteBuilded } from '@/entities/map';

import { RouteInfoDetail } from './route-info-detail';
import { RouteInfoShort } from './route-info-short';
import s from './route-info.module.scss';

export const RouteInfo = () => {
	const [isDetail, setDetail] = useState(false);

	const dispatch = useDispatch();

	const { activeMenu } = useSelector(store => store.menu);
	const {
		routeInfo: { routeIsBuilded }
	} = useSelector(state => state.map);

	const handleClose = () => {
		dispatch(setBuildRoute(false));
		dispatch(setRouteBuilded(false));
		dispatch(setChangeRoute(false));
		dispatch(clearActiveMenu());
	};
	useEffect(() => {
		if (routeIsBuilded) {
			setDetail(false);
		}
	}, [routeIsBuilded]);

	const routeInfoClass = clsx(s.routeInfo, {
		[s.ready]: activeMenu === 'route',
		[s.active]: routeIsBuilded && activeMenu === 'route'
	});

	return (
		<div className={routeInfoClass}>
			{isDetail ? (
				<RouteInfoDetail handleClose={() => handleClose()} />
			) : (
				<RouteInfoShort handleClose={() => handleClose()} setDetail={() => setDetail(true)} />
			)}
		</div>
	);
};
