import { FC } from 'react';

import clsx from 'clsx';

import { Button, CloseIcon, MapIcon, PlusIcon, RouteIcon } from '@/shared/ui';

import s from './object-item.module.scss';

type ObjectItemType = {
	title: string;
	length?: number;
	isDeleteBtn?: boolean;
	address?: string;
	viewOnMap?: () => void;
	buildRoute?: () => void;
	handleDeletePoint?: () => void;
	isDisabled?: boolean;
};

export const ObjectItem: FC<ObjectItemType> = ({
	title,
	address,
	length,
	isDeleteBtn,
	viewOnMap,
	buildRoute,
	handleDeletePoint,
	isDisabled
}) => {
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
				{/* {badges.map((badge, index) => (
					<Badge
						className={s.badge}
						key={
							// при получении апи заменить index
							index
						}
					>
						<p>{badge.title}</p>
						<span>{badge.value}</span>
					</Badge>
				))} */}
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
				{/* <Button onClick={() => {}} className={s.aboutBtn}>
					Подробнее о ТО
				</Button> */}
			</div>
		</div>
	);
};
