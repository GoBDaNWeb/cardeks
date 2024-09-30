// import { RouteList } from '@/widgets/route-list';
import { useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ChangeLayer } from '@/widgets/change-layer';
import { Filters } from '@/widgets/filters';
import { FiltersList } from '@/widgets/filters-list';
import { MenuList } from '@/widgets/menu-list';
import { ObjectsList } from '@/widgets/objects-list';
import { RouteBuild } from '@/widgets/route-build';
import { RouteFiltersList } from '@/widgets/route-filters-list';
import { RouteInfo } from '@/widgets/route-info';
import { Search } from '@/widgets/search';
import { Zoom } from '@/widgets/zoom';

import { DownloadModal } from '@/features/download-modal';
import { MailModal } from '@/features/mail-modal';
import { ReviewModal, handleOpenModal as openReviewModal } from '@/features/review-modal';

import { GuideModal, handleOpenModal as openGuideModal } from '@/entities/guide-modal';
import { NewRouteModal } from '@/entities/new-route-modal';

import { Button } from '@/shared/ui';
import { ChatIcon, DocumentIcon } from '@/shared/ui';

import s from './layout.module.scss';

export const Layout = ({ children }) => {
	const dispatch = useDispatch();

	const handeOpenReviewModal = () => {
		dispatch(openReviewModal(true));
	};
	const handeOpenGuideModal = () => {
		dispatch(openGuideModal(true));
	};

	return (
		<div className={s.layout}>
			{children}

			<div className={s.widgets}>
				<ReviewModal />
				<NewRouteModal />
				<GuideModal />
				<DownloadModal />
				<MailModal />
				<Search />
				<Filters />
				<FiltersList />
				<Zoom />
				<ChangeLayer />
				<ObjectsList />
				<RouteBuild />
				<RouteFiltersList />
				<RouteInfo />
				<MenuList />
				<Button onClick={() => handeOpenGuideModal()} className={s.guideModalBtn}>
					<DocumentIcon />
				</Button>
				<Button onClick={() => handeOpenReviewModal()} className={s.reviewModalBtn}>
					<ChatIcon />
				</Button>
				<ToastContainer />
			</div>
		</div>
	);
};
