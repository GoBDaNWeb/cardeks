import { useDispatch, useSelector } from 'react-redux';

import { setFilterActive } from '@/features/route-form';

import { setActiveMenu } from '@/entities/mobile-menu';

import { Button, FilterIcon, ListIcon, RouteIcon, SearchIcon } from '@/shared/ui';

import s from './mobile-menu.module.scss';

const menuList = [
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
