import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { clearActiveMenu } from '@/widgets/menu-list';

import { RouteForm } from '@/features/route-form';
import { setFilterActive } from '@/features/route-form';

import { setBuildRoute, setChangeRoute, setRouteBuilded } from '@/entities/map';
import { setActiveMenu } from '@/entities/mobile-menu';

import { useTypedSelector } from '@/shared/lib';
import { Button, CloseIcon } from '@/shared/ui';

import s from './route-build.module.scss';

export const RouteBuild = () => {
	const { activeMenu } = useTypedSelector(store => store.menu);
	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);
	const { objectId } = useTypedSelector(store => store.objectInfo);

	const {
		routeInfo: { routeIsBuilded }
	} = useTypedSelector(state => state.map);

	const dispatch = useDispatch();

	const handleClose = () => {
		dispatch(setBuildRoute(false));
		dispatch(setRouteBuilded(false));
		dispatch(setChangeRoute(false));
		dispatch(clearActiveMenu());
		dispatch(setFilterActive(false));
		dispatch(setActiveMenu(null));
	};

	const routeBuildClass = clsx(s.routeBuild, {
		[s.active]: activeMenu === 'route' || (mobileActiveMenu === 'route' && !objectId),
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
