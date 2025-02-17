import { FC } from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { setActiveObject } from '@/entities/object-info';

import { Badge, Button, CloseIcon, MapIcon, PlusIcon, RouteIcon } from '@/shared/ui';

import s from './object-item.module.scss';

type ObjectItemType = {
	id?: string | number;
	title: string;
	length?: number;
	isDeleteBtn?: boolean;
	address?: string;
	viewOnMap?: () => void;
	buildRoute?: () => void;
	handleDeletePoint?: () => void;
	aboutObject?: () => void;
	isDisabled?: boolean;
	fuels?: any;
};

export const ObjectItem: FC<ObjectItemType> = ({
	id,
	title,
	address,
	length,
	isDeleteBtn,
	viewOnMap,
	buildRoute,
	handleDeletePoint,
	isDisabled,
	aboutObject,
	fuels
}) => {
	const dispatch = useDispatch();

	const handleAboutObject = (id: number) => {
		if (id) {
			dispatch(setActiveObject(id));
		}
	};
	const objectItemClass = clsx(s.objectItem, { [s.disabled]: isDisabled });

	return (
		<div className={objectItemClass}>
			<div className={s.objectItemTop}>
				<div className={s.title}>
					<p>{title}</p>
					{length ? <span>{(Math.round(length) / 1000).toFixed(2)} км</span> : null}
				</div>
				{address ? <span>{address}</span> : null}
			</div>
			<div className={s.objectItemBadges}>
				{fuels &&
					Object.entries(fuels)
						.filter(([_, value]) => value)
						.map(([key]) => (
							<Badge key={key} className={s.badge}>
								<p>{key}</p>
							</Badge>
						))}
			</div>
			<div className={s.objectItemBottom}>
				<div className={s.features}>
					<Button onClick={viewOnMap}>
						<MapIcon /> <p>На карте</p>
					</Button>
					{isDeleteBtn ? (
						<>
							{isDisabled ? (
								<Button onClick={handleDeletePoint}>
									<PlusIcon />
									<p>Вернуть</p>
								</Button>
							) : (
								<Button onClick={handleDeletePoint}>
									<CloseIcon /> <p>Удалить</p>
								</Button>
							)}
						</>
					) : (
						<Button onClick={buildRoute}>
							<RouteIcon /> <p>Построить маршрут</p>
						</Button>
					)}
				</div>
				<Button onClick={() => handleAboutObject(id as number)} className={s.aboutBtn}>
					Подробнее о ТО
				</Button>
			</div>
		</div>
	);
};
