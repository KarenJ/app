define(function (require) {

	"use strict";

	var SubRoute 		= require('backbonesubroute'),
		localStorage 	= require('localStorage'),
		config			= require('app/config'),
		FeedsModels		= require('app/models/feeds'),
		favorite        = require('app/models/favorite'),
		FeedsView 		= require('app/views/feedsHome'),
		$content 		= $('#innerWrapper'),
		feedsView 		= new FeedsView({el:$content});
		
	return Backbone.SubRoute.extend({
		pagelength: config.noOfFeeds,
		routes: {
			'': 'mostratedlist',
			'most-rated': 'mostratedlist',
			'most-followed': 'mostfollowedlist',
			'most-popular': 'mostpopularlist',
			'my-universe': 'myuniverselist',
			'my-universe/:type': 'myuniverselist',
			'favorites' : 'favoriteList'
		},
		initialize: function() {
			console.log("initialize feeds subrouters");
			this.favorite = new favorite.FavoriteCollection();
		},
		loadView : function(view) {
			this.view && (this.view.close ? this.view.close() : this.view.remove());
			this.view = view;
		},
		viewChange : function(){
			feedsView.cleanupObjects();
		},
		mostratedlist: function() {
			console.log("most rated list loading...");
			var self = this;		
			feedsView.currentList = 'mostratedlist'
			self.mostRated = new FeedsModels.MostRatedCollection();
			require(['app/views/mostRated'], function (MostRatedView) {
				self.mostRated.fetch({
					data: {
						start: 0,
						length: config.noOfFeeds
					},
					success: function(data) {
						self.viewChange();
						console.log("=======Rated=========");
						//console.log(data);
						self.loadView(new MostRatedView({
							collection: data
						}));
					}
				});
			});
		},
		mostfollowedlist: function() {
			console.log("most followed list loading...");
			 
			var self = this;
			feedsView.currentList = 'mostfollowedlist';
			self.mostFollowed = new FeedsModels.MostFollowedCollection();
			require(['app/views/mostFollowed'], function (MostFollowedView) {
				self.mostFollowed.fetch({
					success: function(data) {
						self.viewChange();
						console.log("=======Followed=========");
						//console.log(data);
						new MostFollowedView({
							collection: data
						});
					}
				});
			});
		},
		mostpopularlist: function() {
			console.log("most popular list loading...");
			 
			var self = this;
			feedsView.currentList = 'mostpopularlist';
			self.mostPopular = new FeedsModels.MostPopularCollection();
			require(['app/views/mostPopular'], function (MostPopularView) {
				self.mostPopular.fetch({
					success: function(data) {
						self.viewChange();
						console.log("=======Popular=========");
						//console.log(data);
						new MostPopularView({
							collection: data,
						});
					}
				});
			});
		},
		myuniverselist: function(id) {

			console.log("type is :" + id);


			var self = this;
			feedsView.currentList = 'myuniverselist';
			self.myUniverse = new FeedsModels.MyUniverseCollection(1);
			require(['app/views/myUniverse'], function (MyUniverseView) {

				self.myUniverse.fetch({
					data: {
			 		member_id: window.localStorage.getItem('uid'),
			 		length: 5,
			 		start_post_id: 0,
			 		last_date: 0,
			 		direction: 0,
			 		following : 1
			 	},
					success: function(data) {
						self.viewChange();
						console.log("=======My Universe=========");
						//console.log(data);
						new MyUniverseView({
							collection: data,
						});
					}
				});

			});
		},
		favoriteList: function(){
			var self = this;
			feedsView.currentList = 'myfavoritelist';
			self.myUniverse = new FeedsModels.MyUniverseCollection(1);
			require(['app/views/myUniverse'], function (MyUniverseView) {

				self.favorite.fetch({data:{
				member_id: window.localStorage.getItem('uid'),
				viewer_member_id: window.localStorage.getItem('uid')},
					success: function(data) {
						new MyUniverseView({
							collection: data, title: 'My Favorites'
						});
					}
				});

			});
		}
	});
});