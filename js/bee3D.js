import defs from './defaults';
import {assign} from './shared';

import * as feats from './features/index';
import core, {changed, classes, keys, touches} from './core/index';
import onHover from './features/autoplay/-listenToHover';
import destroy from './core/-destroy';

/**
 * Bee3D Slider
 * @param {HTMLElement}    slider parent
 * @param {Object}         options (optional)
 */
function Bee3D(parent, options) {
	this.options = assign({}, defs, options);
	this.init(parent);
}

Bee3D.prototype = {
	init: function (parent) {
		var opts = this.options,
			slides = parent.querySelectorAll(opts.selector);

		// create slider instance
		this.el = core(slides);
		this.el.parent = parent;

		// init plugins
		this.plugins();

		// activate the first slide
		this.el.slide(this.options.focus);
		// assign effect to slider--parent
		classie.add(this.el.parent, 'bee3D--effect__' + this.options.effect);

		// initialize events
		this.events();
		this.slideEvents();

		// onInit callback
		this.options.onInit();

		// let ourselves know we've started
		this.el.initialized = true;
	},

	plugins: function () {
		var self = this,
			opts = self.options,
			funcs = [
				classes(opts),
				changed(opts.onChange)
			];

		// if turned on...
		if (opts.listeners.keys) funcs.push(keys());
		if (opts.listeners.touches) funcs.push(touches());

		// init plugin funcs
		(funcs || []).forEach(function (plugin) {
			plugin(self.el);
		});
	},

	events: function () {
		var opts = this.options;

		if (opts.sync.enabled) this.sync();
		if (opts.ajax.enabled) this.ajax();
		if (opts.loop.enabled) this.loop();
		if (opts.autoplay.enabled) this.autoplay();
		if (opts.navigation.enabled) this.navigation();
		if (opts.listeners.scroll) this.mouseScroll();
		if (opts.listeners.drag) this.mouseDrag();
	},

	slideEvents: function (slides) {
		var opts = this.options;

		if (!slides) slides = this.el.slides;

		if (opts.shadows.enabled) this.shadows(slides);
		if (opts.parallax.enabled) this.parallax(slides);
		if (opts.listeners.clicks) this.clickInactives(slides);
	},

	sync: feats.sync,
	ajax: feats.ajax,
	loop: feats.loop,
	shadows: feats.shadows,
	autoplay: feats.autoplay,
	navigation: feats.nav,
	parallax: feats.parallax,

	clickInactives: feats.clicks,
	mouseScroll: feats.scroll,
	mouseDrag: feats.drag,

	destroy: destroy,

	listenToHover: onHover
};

export default Bee3D;
