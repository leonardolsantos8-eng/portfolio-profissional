(function() {
	var svg = document.querySelector('.neon-route');
	var line = svg.querySelector('.neon-route__line');
	var glow = svg.querySelector('.neon-route__glow');
	var gradient = svg.querySelector('#neon-route-colors');
	var counterLine = svg.querySelector('.neon-route__counter-line');
	var counterGlow = svg.querySelector('.neon-route__counter-glow');
	var counterGradient = svg.querySelector('#neon-route-counter-colors');
	var sections = ['intro', 'one', 'work', 'two', 'contact']
		.map(function(id) { return document.getElementById(id); })
		.filter(Boolean);
	var paths = [line, glow, counterLine, counterGlow];
	var routeLength = 0;
	var preloadedLength = 0;
	var frame = 0;

	function buildRoute() {
		var width = 1000;
		var pageHeight = document.documentElement.scrollHeight;
		var path = ['', ''];
		var introPath = ['', ''];
		var stops = [[], []];
		var gradients = [gradient, counterGradient];
		var colors = ['#168cff', '#ff244f'];

		svg.setAttribute('viewBox', '0 0 ' + width + ' ' + pageHeight);
		svg.style.height = pageHeight + 'px';
		gradient.setAttribute('x1', '0');
		gradient.setAttribute('y1', '0');
		gradient.setAttribute('x2', '0');
		gradient.setAttribute('y2', pageHeight);

		sections.forEach(function(section, index) {
			var bounds = section.getBoundingClientRect();
			var top = bounds.top + window.scrollY;
			var height = bounds.height;
			var inset = Math.min(24, height * 0.08);
			var start = top + inset;
			var end = top + height - inset;
			var center = width / 2;
			var side = index === 0 ? width * 0.75 :
				(index % 2 === 0 ? width * 0.94 : width * 0.06);
			var startOffset = Math.max(0, Math.min(100, start / pageHeight * 100));
			var endOffset = Math.max(0, Math.min(100, end / pageHeight * 100));

			for (var routeIndex = 0; routeIndex < 2; routeIndex++) {
				var routeSide = routeIndex === 0 ? side : width - side;
				var color = colors[(index + routeIndex) % colors.length];
				var segment = ' C ' + routeSide + ' ' + (start + (end - start) * 0.08) +
					' ' + routeSide + ' ' + (start + (end - start) * 0.82) +
					' ' + center + ' ' + end;

				if (index === 0) {
					path[routeIndex] = 'M ' + center + ' ' + start;
					introPath[routeIndex] = path[routeIndex] + segment;
				}

				path[routeIndex] += segment;

				stops[routeIndex].push({ offset: startOffset, color: color });
				stops[routeIndex].push({ offset: endOffset, color: color });
			}
		});

		gradients.forEach(function(routeGradient, index) {
			while (routeGradient.firstChild)
				routeGradient.removeChild(routeGradient.firstChild);

			stops[index].forEach(function(stop) {
				var element = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
				element.setAttribute('offset', stop.offset + '%');
				element.setAttribute('stop-color', stop.color);
				routeGradient.appendChild(element);
			});
		});

		line.setAttribute('d', path[0]);
		glow.setAttribute('d', path[0]);
		counterLine.setAttribute('d', path[1]);
		counterGlow.setAttribute('d', path[1]);
		routeLength = line.getTotalLength();
		var introMeasure = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		introMeasure.setAttribute('d', introPath[0]);
		svg.appendChild(introMeasure);
		preloadedLength = introMeasure.getTotalLength() / 2;
		svg.removeChild(introMeasure);
		paths.forEach(function(routePath) {
			routePath.style.strokeDasharray = routeLength;
		});
		updateRoute();
	}

	function updateRoute() {
		frame = 0;
		var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
		var progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
		var revealLength = preloadedLength +
			(routeLength - preloadedLength) * Math.max(0, Math.min(1, progress));
		var offset = routeLength - revealLength;

		paths.forEach(function(routePath) {
			routePath.style.strokeDashoffset = offset;
		});
	}

	function requestRouteUpdate() {
		if (!frame)
			frame = window.requestAnimationFrame(updateRoute);
	}

	window.addEventListener('scroll', requestRouteUpdate, { passive: true });
	window.addEventListener('resize', buildRoute);
	window.addEventListener('load', buildRoute);
	buildRoute();
})();