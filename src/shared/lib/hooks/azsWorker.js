// azsWorker.js
self.importScripts('https://cdn.jsdelivr.net/npm/rbush@3.0.1/rbush.min.js');
// Загружаем RBush из CDN (можно установить через npm и бандлить, если требуется)

// Функция для перевода градусов в радианы
function toRad(value) {
	return (value * Math.PI) / 180;
}

// Вычисление расстояния по формуле гаверсина (в метрах)
function haversineDistance(coord1, coord2) {
	const R = 6371000; // радиус Земли в метрах
	const lat1 = toRad(coord1[0]);
	const lat2 = toRad(coord2[0]);
	const dLat = toRad(coord2[0] - coord1[0]);
	const dLon = toRad(coord2[1] - coord1[1]);
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

// Вычисление расстояния от точки до отрезка
function pointToSegmentDistance(point, segStart, segEnd) {
	const [x, y] = point;
	const [x1, y1] = segStart;
	const [x2, y2] = segEnd;
	const A = x - x1;
	const B = y - y1;
	const C = x2 - x1;
	const D = y2 - y1;
	const dot = A * C + B * D;
	const lenSq = C * C + D * D;
	let param = lenSq !== 0 ? dot / lenSq : -1;
	let xx, yy;
	if (param < 0) {
		xx = x1;
		yy = y1;
	} else if (param > 1) {
		xx = x2;
		yy = y2;
	} else {
		xx = x1 + param * C;
		yy = y1 + param * D;
	}
	return haversineDistance(point, [xx, yy]);
}

// Вычисление минимального расстояния от точки до полилинии
function pointToPolylineDistance(point, polyline) {
	let minDistance = Infinity;
	for (let i = 0; i < polyline.length - 1; i++) {
		const d = pointToSegmentDistance(point, polyline[i], polyline[i + 1]);
		if (d < minDistance) {
			minDistance = d;
		}
	}
	return minDistance;
}

// Расчёт bounding box для полилинии
function getPolylineBBox(polyline) {
	let minX = Infinity,
		minY = Infinity,
		maxX = -Infinity,
		maxY = -Infinity;
	for (const [lat, lon] of polyline) {
		if (lat < minX) minX = lat;
		if (lon < minY) minY = lon;
		if (lat > maxX) maxX = lat;
		if (lon > maxY) maxY = lon;
	}
	return { minX, minY, maxX, maxY };
}

self.onmessage = function (e) {
	const { azsData, polyline, threshold, firstRouteCoord } = e.data;

	// Вычисляем bounding box маршрута
	const { minX, minY, maxX, maxY } = getPolylineBBox(polyline);
	// Примерный коэффициент перевода из метров в градусы (около 1° ≈ 111 км)
	const degreeFactor = 1 / 111000;
	const delta = threshold * degreeFactor;
	const extendedBox = {
		minX: minX - delta,
		minY: minY - delta,
		maxX: maxX + delta,
		maxY: maxY + delta
	};

	// Создаем новый индекс RBush
	const tree = new self.RBush();

	// Подготавливаем данные для RBush: каждая точка представлена как bbox (точка = мин. и макс. совпадают)
	const items = azsData.map(item => {
		const [lat, lon] = item.geometry.coordinates;
		return {
			minX: lat,
			minY: lon,
			maxX: lat,
			maxY: lon,
			item: item
		};
	});

	// Загружаем все точки в индекс
	tree.load(items);

	// Запрашиваем кандидатов по расширенному bounding box
	const candidates = tree.search(extendedBox);

	const result = [];
	// Для каждого кандидата вычисляем точное расстояние до маршрута
	for (const candidate of candidates) {
		const point = candidate.item.geometry.coordinates;
		const distanceToLine = pointToPolylineDistance(point, polyline);
		if (distanceToLine < threshold) {
			candidate.item.distance = haversineDistance(firstRouteCoord, point);
			result.push(candidate.item);
		}
	}
	self.postMessage(result);
};
