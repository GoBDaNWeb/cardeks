import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { handleWheel, setZoom } from '@/entities/map';

import { useTypedSelector } from '@/shared/lib';
import { Stepper } from '@/shared/ui';

import s from './zoom.module.scss';

export const Zoom = () => {
	const dispatch = useDispatch();

	const { zoom, isWheel } = useTypedSelector(state => state.map.mapInfo);
	const { openSettings } = useTypedSelector(store => store.settingsMapMenu);

	const incZoom = () => {
		if (zoom === 21 && isWheel) {
			return;
		} else {
			dispatch(handleWheel(false));
			dispatch(setZoom(zoom + 1));
		}
	};
	const decZoom = () => {
		if (zoom === 1 && isWheel) {
			return;
		} else {
			dispatch(handleWheel(false));
			dispatch(setZoom(zoom - 1));
		}
	};

	const zoomClass = clsx(s.zoom, { [s.active]: openSettings });

	return (
		<div className={zoomClass}>
			<Stepper incZoom={() => incZoom()} decZoom={() => decZoom()} />
		</div>
	);
};
