define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tSwipe   			= require('tswipe'),
		iscrollit 			= require('iscrolljs'),
		AccountModels		= require('app/models/account'),
		menuView 			= require('app/views/menu'),
		tpl 				= require('text!tpl/vipList.html'),
		DefaultItem 	    = require('app/views/vipItem'),
		template 			= _.template(tpl);
		
		
	return Backbone.View.extend({
		el: $('#innerWrapper'),
		myscroll: null,
		initialize: function () {
			var self = this;
			this.uid = window.localStorage.getItem('uid');
			this.menu = new menuView();
			this.render()
			this.postRender();
		},
		events:{
			'click .iconBackArrow': 'back',
		},
		render: function () {
			
			this.$el.html(template());
			
			var myScroll = new iScroll( 'followersVip' , {
 					useTransition: true,
					vScroll: true,
			});
			this.myscroll = myScroll;

			this.subViews = _.map(this.collection.models, function(result) { 
				return new DefaultItem({model: result});
			});

			_.each(this.subViews, function(view) {
				this.$el.find('ul#vipList').append(view.$el[0]);
			}, this);

			this.myscroll.refresh();
			this.menu.render();
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
		back: function(){
			Backbone.history.navigate('#account/profile/' + this.uid,{trigger: true});
		},
		close: function() {
			_.each(this.subViews, function(view) { view.remove(); });
			this.menu.close();
			this.undelegateEvents();
		}
	});
});