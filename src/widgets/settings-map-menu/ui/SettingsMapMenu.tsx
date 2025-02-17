import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { useTypedSelector } from '@/shared/lib';
import { Button, SettingsIcon } from '@/shared/ui';

import { setOpenSettings } from '../model';

import s from './settings-map-menu.module.scss';

export const SettingsMapMenu = () => {
	const dispatch = useDispatch();

	const { openSettings } = useTypedSelector(store => store.settingsMapMenu);

	const handleOpenSettings = () => {
		dispatch(setOpenSettings(!openSettings));
	};

	const settingBtnClass = clsx(s.settingBtn, { [s.active]: openSettings });

	return (
		<div className={s.settingsMap}>
			<Button onClick={() => handleOpenSettings()} className={settingBtnClass}>
				<SettingsIcon />
			</Button>
		</div>
	);
};
