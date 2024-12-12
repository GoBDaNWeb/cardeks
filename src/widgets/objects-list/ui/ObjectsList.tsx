import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { clearActiveMenu } from '@/widgets/menu-list';

import { setActiveMenu } from '@/entities/mobile-menu';
import { ObjectItem } from '@/entities/object-item';

import { useTypedSelector } from '@/shared/lib';
import { Feature } from '@/shared/types';
import { Button, CloseIcon, DownloadIcon, MailIcon, PrintIcon } from '@/shared/ui';

import s from './objects-list.module.scss';

export const ObjectsList = () => {
	const dispatch = useDispatch();
	const {
		mapInfo: { points, totalPoints, totalViewPoints }
	} = useTypedSelector(state => state.map);
	const { activeMenu } = useTypedSelector(store => store.menu);
	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);

	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	const handleClose = () => {
		dispatch(clearActiveMenu());
		dispatch(setActiveMenu(null));
	};

	const objectsListClass = clsx(s.objectsList, {
		[s.active]: activeMenu === 'objects-list' || mobileActiveMenu === 'objects'
	});

	const loadMore = () => {
		setPage(prevPage => prevPage + 1);
	};

	const observer = useRef<IntersectionObserver | null>(null);
	const lastElementRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (observer.current) observer.current.disconnect();
		observer.current = new IntersectionObserver(entries => {
			if (entries[0].isIntersecting) {
				loadMore();
			}
		});
		if (lastElementRef.current) observer.current.observe(lastElementRef.current);
	}, [page, points]);

	const displayedPoints = points.slice(0, page * itemsPerPage);

	return (
		<div className={objectsListClass}>
			<div className={s.objectListTop}>
				<div className={s.left}>
					<p>
						{totalPoints} отфильтровано / {totalViewPoints} на карте
					</p>
				</div>
				<div className={s.right}>
					<div className={s.features}>
						<Button onClick={() => {}}>
							<DownloadIcon />
						</Button>
						<Button onClick={() => {}}>
							<PrintIcon />
						</Button>
						<Button onClick={() => {}}>
							<MailIcon />
						</Button>
					</div>
					<Button onClick={() => handleClose()}>
						<CloseIcon />
					</Button>
				</div>
			</div>
			<div className={s.objectListContent}>
				{displayedPoints.map((point: Feature, index: number) => (
					<div key={point.id} ref={index === displayedPoints.length - 1 ? lastElementRef : null}>
						<ObjectItem title={point.title} />
					</div>
				))}
			</div>
		</div>
	);
};
