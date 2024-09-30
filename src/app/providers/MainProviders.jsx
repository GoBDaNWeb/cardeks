import { Provider } from 'react-redux';

import { mainStore } from '../stores';

export const MainProviders = ({ children }) => {
	return <Provider store={mainStore}>{children}</Provider>;
};
