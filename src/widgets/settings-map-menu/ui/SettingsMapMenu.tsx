import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { useTypedSelector } from '@/shared/lib';
import { Button, LocationIcon, SettingsIcon } from '@/shared/ui';

import { setGetLocation, setOpenSettings } from '../model';

import s from './settings-map-menu.module.scss';

export const SettingsMapMenu = () => {
	const dispatch = useDispatch();

	const { openSettings } = useTypedSelector(store => store.settingsMapMenu);

	const handleOpenSettings = () => {
		dispatch(setOpenSettings(!openSettings));
	};
	const handleGetLocation = () => {
		dispatch(setGetLocation(true));

		setTimeout(() => {
			dispatch(setGetLocation(false));
		}, 300);
	};

	const settingBtnClass = clsx(s.settingBtn, { [s.active]: openSettings });

	return (
		<div className={s.settingsMap}>
			<Button onClick={() => handleOpenSettings()} className={settingBtnClass}>
				<SettingsIcon />
			</Button>
			<Button onClick={() => handleGetLocation()}>
				<LocationIcon />
			</Button>
		</div>
	);
};
