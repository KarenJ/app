define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config 		        = require('app/config'),
		// AccountModels		= require('app/models/account'),
		tpl                 = require('text!tpl/albumPhotoItem.html'),
		config 				= require('app/config'),
		template            = _.template(tpl);
		
	return Backbone.View.extend({
		tagName: "div",
		className: "col-xs-3 nopadding",
		initialize: function () {
			this.render();
		},
		events:{
			'click img':'openContent'
		},
		render: function () {

			var tmpData = {};
			var self = this;
			var photo = self.model.attributes;

			tmpData['title'] = photo.title ;

			tmpData['source']= config.url + photo.path + photo.filename;
			tmpData['photo_id'] = photo.photo_id;
				
			self.$el.append(template(tmpData)).fadeIn('slow');
		},
		openContent: function(){
			Backbone.history.navigate("#preview/photo/" + this.model.get('photo_id'), {trigger: true});
		}
	});
});