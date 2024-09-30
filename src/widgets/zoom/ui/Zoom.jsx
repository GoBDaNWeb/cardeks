import { useDispatch, useSelector } from 'react-redux';

import { handleWheel, setZoom } from '@/entities/map';

import { Stepper } from '@/shared/ui';

import s from './zoom.module.scss';

export const Zoom = () => {
	const { zoom, isWheel } = useSelector(state => state.map.mapInfo);
	const dispatch = useDispatch();

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
	return (
		<div className={s.zoom}>
			<Stepper incZoom={() => incZoom()} decZoom={() => decZoom()} />
		</div>
	);
};
