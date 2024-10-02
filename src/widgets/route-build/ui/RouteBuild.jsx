import { useDispatch, useSelector } from 'react-redux';

import clsx from 'clsx';

import { clearActiveMenu } from '@/widgets/menu-list';

import { RouteForm } from '@/features/route-form';
import { setFilterActive } from '@/features/route-form';

import { setBuildRoute, setChangeRoute, setRouteBuilded } from '@/entities/map';

import { Button, CloseIcon } from '@/shared/ui';

import s from './route-build.module.scss';

export const RouteBuild = () => {
	const { activeMenu } = useSelector(store => store.menu);
	const {
		routeInfo: { routeIsBuilded }
	} = useSelector(state => state.map);

	const dispatch = useDispatch();

	const handleClose = () => {
		dispatch(setBuildRoute(false));
		dispatch(setRouteBuilded(false));
		dispatch(setChangeRoute(false));
		dispatch(clearActiveMenu());
		dispatch(setFilterActive(false));
	};

	const routeBuildClass = clsx(s.routeBuild, {
		[s.active]: activeMenu === 'route',
		[s.hide]: routeIsBuilded
	});

	return (
		<div className={routeBuildClass}>
			<div className={s.routeBuildTop}>
				<h5>Построить маршрут</h5>
				<Button onClick={() => handleClose()}>
					<CloseIcon />
				</Button>
			</div>
			<RouteForm />
		</div>
	);
};
