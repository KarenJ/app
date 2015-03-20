define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tpl 				= require('text!tpl/memberAutoComplete.html'),
		DefaultItem 	    = require('app/views/memberAutoCompleteItem'),
		template 			= _.template(tpl);
		
		
	return Backbone.View.extend({
		initialize: function (param) {
			this.container = param.container;
			this.searchResult = param.result;
			this.render();
		},
		render: function () {
			this.container.html(template());
				
			var self = this;
			this.subViews = _.map(this.searchResult, function(result) { 
				return new DefaultItem({model: result, container: self.container});
			});

			_.each(this.subViews, function(view) {
				self.container.find('ul#autoCompleteContainer').append(view.$el[0]);
			}, this);

			return this;
		},
		close: function() {
			_.each(this.subViews, function(view) { view.remove(); });
			this.undelegateEvents();
		}
	});
});