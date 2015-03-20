define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		AccountModels		= require('app/models/account'),
		tpl 				= require('text!tpl/feedsHashtag.html'),
		DefaultItem 	    = require('app/views/feedsHashtagItem'),
		template 			= _.template(tpl);
		
		
	return Backbone.View.extend({
		el: $('#innerWrapper'),
		isPreview: false,
		initialize: function (param) {
			var self = this;
			
			this.uid = window.localStorage.getItem('uid');
			this.hashtag = param.hashtag;
			this.render().postRender();
		},
		render: function () {
			var self = this;
			var tmpData = {};
			tmpData['hashtag'] = this.hashtag
			this.$el.html(template(tmpData)).hide();

			this.subViews = _.map(this.collection.models, function(result) { 
				return new DefaultItem({model: result});
			});

			_.each(this.subViews, function(view) {
				this.$el.find('ul#theList').append(view.$el[0]);
			}, this);

			return this;
		},
		postRender: function(){
			$('.gradient').hide();
			
			$('#innerWrapper').removeClass('toClean').addClass('toContent padding-top-10');
			$('#contentTemplate').removeClass('toContent').addClass('toClean');

			$('#innerWrapper').addClass('onTop');

			$('#innerWrapper, .gradient').fadeIn('fast', function() {
				$('#contentTemplate').addClass('blurred');
			});
		},
		close: function() {
			_.each(this.subViews, function(view) { view.remove(); });
			//this.undelegateEvents();
		}
	});
});