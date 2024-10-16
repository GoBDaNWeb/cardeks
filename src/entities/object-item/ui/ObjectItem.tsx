import { FC } from 'react';

import { Badge, Button, CloseIcon, MapIcon, RouteIcon } from '@/shared/ui';

import { badges } from '../config';

import s from './object-item.module.scss';

type ObjectItemType = {
	length?: string;
	isDeleteBtn?: boolean;
};

export const ObjectItem: FC<ObjectItemType> = ({ length, isDeleteBtn }) => {
	return (
		<div className={s.objectItem}>
			<div className={s.objectItemTop}>
				<div className={s.title}>
					<p>Газпромнефть</p>
					<span>{length}</span>
				</div>
				<span>ул. Архитектора Власова, 2В строение 1, Москва, Россия, 117335</span>
			</div>
			<div className={s.objectItemBadges}>
				{badges.map((badge, index) => (
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
				))}
			</div>
			<div className={s.objectItemBottom}>
				<div className={s.features}>
					<Button onClick={() => {}}>
						<MapIcon /> <p>На карте</p>
					</Button>
					{isDeleteBtn ? (
						<Button onClick={() => {}}>
							<CloseIcon /> <p>Удалить</p>
						</Button>
					) : (
						<Button onClick={() => {}}>
							<RouteIcon /> <p>Построить маршрут</p>
						</Button>
					)}
				</div>
				<Button onClick={() => {}} className={s.aboutBtn}>
					Подробнее о ТО
				</Button>
			</div>
		</div>
	);
};
