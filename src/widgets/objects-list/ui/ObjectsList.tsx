import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { clearActiveMenu } from '@/widgets/menu-list';
import { setActiveMenu } from '@/widgets/menu-list';

import { setAddress, setCenter, setCurrentPointId } from '@/entities/map';
import { setActiveMenu as setActiveMenuMob } from '@/entities/mobile-menu';
import { setActiveObject } from '@/entities/object-info';
import { ObjectItem } from '@/entities/object-item';

import { useGetTerminalsQuery } from '@/shared/api';
import { useTypedSelector } from '@/shared/lib';
import { Feature } from '@/shared/types';

import s from './objects-list.module.scss';

export const ObjectsList = () => {
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [mergedPointsList, setMergedPointsList] = useState([]);

	const observer = useRef<IntersectionObserver | null>(null);
	const lastElementRef = useRef<HTMLDivElement | null>(null);

	const dispatch = useDispatch();

	const {
		mapInfo: { points, pointsData }
	} = useTypedSelector(state => state.map);
	const { activeMenu } = useTypedSelector(store => store.menu);
	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);
	const { data, isLoading } = useGetTerminalsQuery();

	const handleClose = () => {
		dispatch(clearActiveMenu());
		dispatch(setActiveMenu(null));
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

	const handleAboutObject = (id: number) => {
		dispatch(setActiveObject(id));
	};

	// useEffect(() => {
	// 	const mergedPoints = points.map((point: Feature) => {
	// 		const matchingData = data.data.find((item: any) => item[0] === point.id);

	// 		if (matchingData) {
	// 			return {
	// 				...point,
	// 				address: matchingData[1]
	// 			};
	// 		}

	// 		return point;
	// 	});
	// 	setMergedPointsList(mergedPoints);
	// }, [points]);

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
				{/* <div className={s.right}>
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
				</div> */}
			</div>
			<div className={s.objectListContent}>
				{displayedPoints.map((point: Feature, index: number) => (
					<div key={point.id} ref={index === displayedPoints.length - 1 ? lastElementRef : null}>
						<ObjectItem
							title={point.title}
							// address={point.address}
							// viewOnMap={() => handleViewOnMap(point.geometry.coordinates)}
							// buildRoute={() => handleBuildRoute(point.address ?? '')}
							// aboutObject={() => handleAboutObject(point.id)}
						/>
					</div>
				))}
			</div>
		</div>
	);
};
