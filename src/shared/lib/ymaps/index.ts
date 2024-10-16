import React from 'react';
import ReactDom from 'react-dom';

const init = async () => {
	ymaps3.ready.then(() => {
		console.log('dadada');
		ymaps3.import.registerCdn('https://cdn.jsdelivr.net/npm/{package}', [
			'@yandex/ymaps3-default-ui-theme@latest',
			'@yandex/ymaps3-clusterer@latest'
		]);
	});
	const [ymaps3React] = await Promise.all([ymaps3.import('@yandex/ymaps3-reactify'), ymaps3.ready]);
	const reactify = ymaps3React.reactify.bindTo(React, ReactDom);
	const ymapDefaultUi = reactify.module(
		// @ts-ignore
		await ymaps3.import('@yandex/ymaps3-default-ui-theme')
	);
	const ymapsCluster = reactify.module(
		//@ts-ignore
		await ymaps3.import('@yandex/ymaps3-clusterer')
	);
	console.log(ymapsCluster);
	// const ymapsCluster = await ymaps3.import('@yandex/ymaps3-clusterer@0.0.1');
	return { ymaps3React, ymapsCluster, ymapDefaultUi };
	// return { ymaps3React, ymapsCluster };
};
// const { ymaps3React, ymapsCluster } = await init();
const { ymaps3React, ymapsCluster, ymapDefaultUi } = await init();
console.log(ymaps3React);
export const reactify = ymaps3React.reactify.bindTo(React, ReactDom);
export const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } =
	reactify.module(ymaps3);

export const { YMapClusterer, clusterByGrid } = ymapsCluster;
export const { YMapDefaultMarker } = ymapDefaultUi;
