import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import clsx from 'clsx';

import { setMapType, setPanorama } from '@/entities/map';

import { Button, CheckIcon, LayerIcon } from '@/shared/ui';

import { layers } from '../config';

import s from './change-layer.module.scss';

export const ChangeLayer = () => {
	const [isActive, setActive] = useState(false);

	const dispatch = useDispatch();

	const { mapType, panorama } = useSelector(state => state.map.mapInfo);

	const handleActive = () => {
		setActive(!isActive);
	};

	const handleSetMapType = type => {
		dispatch(setMapType(type));
		setActive(false);
	};

	const handleSetPanorama = () => {
		dispatch(setPanorama(!panorama));
		setActive(false);
	};

	const changeLayerWrapperClass = clsx(s.changeLayerWrapper, { [s.active]: isActive });
	const panoramaClass = clsx(s.dropDownTab, { [s.active]: panorama });

	return (
		<div className={changeLayerWrapperClass}>
			<Button onClick={() => handleActive()} className={s.changeLayer}>
				<LayerIcon />
			</Button>
			<div className={s.dropDown}>
				{layers.map(layer => (
					<Button
						onClick={() => handleSetMapType(layer.type)}
						key={layer.title}
						className={`${s.dropDownTab} ${mapType === layer.type ? s.active : ''}`}
					>
						{layer.title}
						<div className={s.icon}>
							<CheckIcon />
						</div>
					</Button>
				))}
				<Button onClick={() => handleSetPanorama()} className={panoramaClass}>
					Панорама
					<div className={s.icon}>
						<CheckIcon />
					</div>
				</Button>
			</div>
		</div>
	);
};
