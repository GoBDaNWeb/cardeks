import { Map } from '@/entities/map';

import './index.scss';
import { Layout } from './layout';
import { MainProviders } from './providers';

export const App = () => {
	return (
		<MainProviders>
			<Layout>
				<Map />
			</Layout>
		</MainProviders>
	);
};

export default App;
