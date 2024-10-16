import { FC, PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { mainStore } from '../stores';

export const MainProviders: FC<PropsWithChildren> = ({ children }) => {
	return <Provider store={mainStore}>{children}</Provider>;
};
