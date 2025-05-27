import { FC, PropsWithChildren } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ChangeLayer } from '@/widgets/change-layer';
import { Filters } from '@/widgets/filters';
import { FiltersList } from '@/widgets/filters-list';
import { MenuList } from '@/widgets/menu-list';
import { MobileMenu } from '@/widgets/mobile-menu';
import { ModalsMenu } from '@/widgets/modals-menu';
import { ObjectInfo } from '@/widgets/object-info';
import { ObjectsList } from '@/widgets/objects-list';
import { RouteBuild } from '@/widgets/route-build';
import { RouteInfo } from '@/widgets/route-info';
import { Search } from '@/widgets/search';
import { SettingsMapMenu } from '@/widgets/settings-map-menu';
import { Zoom } from '@/widgets/zoom';

import { DownloadModal } from '@/features/download-modal';
import { MailModal } from '@/features/mail-modal';
import { NewRouteModal } from '@/features/new-route-modal';
import { PrintModal } from '@/features/print-modal';
import { ReviewModal } from '@/features/review-modal';

import { GuideModal } from '@/entities/guide-modal';

export const Layout: FC<PropsWithChildren> = ({ children }) => {
	return (
		<>
			{children}

			<MobileMenu />
			<ReviewModal />
			<NewRouteModal />
			<PrintModal />
			<GuideModal />
			<DownloadModal />
			<MailModal />
			<Search />
			<Filters />
			<FiltersList />
			<Zoom />
			<ChangeLayer />
			<ObjectsList />
			<ObjectInfo />
			<RouteBuild />
			<SettingsMapMenu />
			<RouteInfo />
			<MenuList />
			<ModalsMenu />
			<ToastContainer />
		</>
	);
};
