define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tplNav				= require('text!tpl/feedsNav.html'),
		navTemplate 		= _.template(tplNav);
		
	return Backbone.View.extend({
		el: $('body'),
		initialize: function () {
			this.render();

			setTimeout(this.fixNav, 200);
			setTimeout(this.swipeGesture, 500);
		},
		events: {
			"click .modal-nav": "gotoPage"
		},
		render: function () {
			var tmpData = {};
			
			tmpData['member_id'] = window.localStorage.getItem('uid');

			this.$el.append(navTemplate(tmpData));

			return this;
		},
		gotoPage: function (ev) {
			var self = this;
			var pageTo = $(ev.target).data('page');

			self.cleanNav();

			$('#feeds-nav').find('[data-page="' + pageTo + '"]').addClass('active');

			self.fixNav();

			Backbone.history.navigate('#feeds/' + pageTo,{trigger: true});
		},
		cleanNav: function () {
			$('#feeds-nav > li > h3 > a.active').removeClass('text-yellow active');
			$('ol.indicators > li').removeClass('active');
		},
		fixNav: function () {
			var self = this;
			var pageTo = $('#feeds-nav > li > h3 > a.active').data('page');

			var split = pageTo.split('-');
			var cln = split.join(' ');
			var clnspc = split.join('');
			
			$('#activeFeeds > h5, #activeFeeds-modal > h5').text(cln);
			$('#feeds-nav > li > h3 > a.active').addClass('text-yellow');
			$('#' + clnspc + '_indicator, #' + clnspc + '_indicator-modal').addClass('active');
		},
	});
});