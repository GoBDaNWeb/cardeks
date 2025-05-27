import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { clearActiveMenu } from '@/widgets/menu-list';
import { setActiveMenu } from '@/widgets/menu-list';

import { setAddress, setCenter, setCurrentPointId } from '@/entities/map';
import { setActiveMenu as setActiveMenuMob } from '@/entities/mobile-menu';
import { ObjectItem } from '@/entities/object-item';

import { handleCopyLink, useTypedSelector } from '@/shared/lib';
import { Feature } from '@/shared/types';
import {
	Button,
	CloseIcon,
	DownloadIcon,
	LinkIcon,
	MailIcon,
	PrintIcon,
	useModal
} from '@/shared/ui';

import s from './objects-list.module.scss';

export const ObjectsList = () => {
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	const observer = useRef<IntersectionObserver | null>(null);
	const lastElementRef = useRef<HTMLDivElement | null>(null);

	const dispatch = useDispatch();

	const { open } = useModal();

	const {
		mapInfo: { fixedCenter, points, pointsData, zoom }
	} = useTypedSelector(state => state.map);
	const { activeMenu } = useTypedSelector(store => store.menu);
	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);
	const {
		selectedFilter,
		filters: { fuelFilters, brandTitles, addServices, features, gateHeight, terminal, card }
	} = useTypedSelector(store => store.filters);

	const handleClose = () => {
		dispatch(clearActiveMenu());
		dispatch(setActiveMenu(null));
		dispatch(setActiveMenuMob(null));
	};

	const loadMore = () => {
		setPage(prevPage => prevPage + 1);
	};

	const handleViewOnMap = (coords: number[]) => {
		dispatch(setCenter(coords));
		dispatch(setActiveMenuMob(null));
		dispatch(clearActiveMenu());
	};

	const handleBuildRoute = (address: string) => {
		if (address) {
			dispatch(setActiveMenuMob('route'));
			dispatch(setCurrentPointId('points.0.inputText'));
			dispatch(setAddress(address));
			if (window.innerWidth > 767) {
				dispatch(setActiveMenu('route'));
			}
		}
	};

	const handeOpenDownloadModal = () => {
		open('download');
	};

	const handeOpenMailModal = () => {
		open('mail');
	};
	const handeOpenPrintModal = () => {
		open('print');
	};

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

	const objectsListClass = clsx(s.objectsList, {
		[s.active]: activeMenu === 'objects-list' || mobileActiveMenu === 'objects'
	});

	return (
		<div className={objectsListClass}>
			<div className={s.objectListTop}>
				<div className={s.left}>
					<p>
						{pointsData.points.total} отфильтровано / {pointsData.points.totalView} на карте
					</p>
				</div>
				<div className={s.right}>
					<div className={s.features}>
						<Button onClick={handeOpenDownloadModal} title='Загрузить список ТО'>
							<DownloadIcon />
						</Button>
						<Button
							onClick={() =>
								handleCopyLink({
									fixedCenter,
									zoom,
									selectedFilter,
									fuelFilters,
									brandTitles,
									addServices,
									terminal,
									features,
									gateHeight,
									card
								})
							}
							title='Скопировать ссылку на карту с выбранными ТО'
						>
							<LinkIcon />
						</Button>
						<Button onClick={handeOpenPrintModal} title='Распечатать список ТО'>
							<PrintIcon />
						</Button>
						{/* <Button onClick={handeOpenMailModal} title='Отправить список ТО на почту'>
							<MailIcon />
						</Button> */}
					</div>
					<Button onClick={handleClose}>
						<CloseIcon />
					</Button>
				</div>
			</div>
			<div className={s.objectListContent}>
				{displayedPoints.map((point: Feature, index: number) => (
					<div
						key={`${point.id}-${index}`}
						ref={index === displayedPoints.length - 1 ? lastElementRef : null}
					>
						<ObjectItem
							id={point.id}
							title={point.title}
							address={point.address}
							viewOnMap={() => handleViewOnMap(point.geometry.coordinates)}
							buildRoute={() => handleBuildRoute(point.address ?? '')}
							fuels={point.fuels}
						/>
					</div>
				))}
			</div>
		</div>
	);
};
