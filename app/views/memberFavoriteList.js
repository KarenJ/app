define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		iscrollit 			= require('iscrolljs'),
		AccountModels		= require('app/models/account'),
		favorite         	= require('app/models/favorite'),
		menuView 			= require('app/views/menu'),
		tpl 				= require('text!tpl/memberFavoriteList.html'),
		DefaultItem 	    = require('app/views/memberFavoriteItem'),
		template 			= _.template(tpl);
		
		
	return Backbone.View.extend({
		el: $('#innerWrapper'),
		isPreview: false,
		initialize: function (param) {
			var self = this;
			
			this.uid = (param.uid) ? param.uid : window.localStorage.getItem('uid');
			this.isPreview = !(param.uid == window.localStorage.getItem('uid'));
			this.AccountModelFollowing = new AccountModels.followingCollection();
			this.favorite = new favorite.FavoriteCollection();
			this.menu = new menuView();
			this.render();
			this.postRender();

		},
		render: function () {
			var self = this;
			var tmpData = {};

			tmpData['profile_id'] = (this.isPreview) ? '/'+this.uid : '';
			this.$el.html(template(tmpData));

			var myScroll = new iScroll( 'memberFavorite' , {
 					useTransition: true,
					vScroll: true,
			});
			this.myscroll = myScroll;
			
			this.subViews = _.map(this.collection.models, function(result) { 
					
				return new DefaultItem({model: result});
			});

			_.each(this.subViews, function(view) {
				this.$el.find('ul#memberFavoriteList').append(view.$el[0]);
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
		close: function() {
			_.each(this.subViews, function(view) { view.remove(); });
			this.menu.close();
			this.undelegateEvents();
		}
	});
});