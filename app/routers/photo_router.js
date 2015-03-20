define(function (require) {
	"use strict";

	var SubRoute 		= require('backbonesubroute'),
		config			= require('app/config'),
		jqueryCookie	= require('jqueryCookie'),
		userTag         = require('app/models/userTag'),
		favorite        = require('app/models/favorite'),
		FeedsView 		= require('app/views/feedsHome'),
		comment         = require('app/models/comment');
		
	return Backbone.SubRoute.extend({
		routes: {
			'tag/:id': 'tagList',
			'comment/:id': 'commentList',
			'members/:id': 'memberFavoriteList',
			'favorites' : 'favoriteList'
		},
		initialize: function() {
			console.log("initialize photo subrouters");
			this.userTag = new userTag.userTagCollection();
			this.comment = new comment.commentCollection();
			this.memberFavorite = new favorite.MemberFavoriteCollection();
			this.favorite = new favorite.FavoriteCollection();
		},
		loadView : function(view) {
			this.view && (this.view.close ? this.view.close() : this.view.remove());
			this.view = view;
		},
		tagList: function (id) {
			var self = this;
			require(['app/views/tagList'], function (photoTag) {
			
			self.userTag.fetch({data:{
				photo_id: id
			}, success: function(result){
				self.loadView(new photoTag({collection:result}));
			}});
				
			});
		},
		commentList: function(id){
			var self = this;
			require(['app/views/commentList'], function (commentList) {
			
			self.comment.fetch({data:{
				photo_id: id,
				viewer_member_id: window.localStorage.getItem('uid'),
				start: 0,
				length: 10
			}, success: function(result){
				self.loadView(new commentList({collection:result, photo_id: id}));
			}});
				
			});
		},
		memberFavoriteList: function(id){
			var self = this;
			require(['app/views/memberFavoriteList'], function (favoriteList) {
			
			self.memberFavorite.fetch({data:{
				photo_id: id,
				viewer_member_id: window.localStorage.getItem('uid'),
			}, success: function(result){
				self.loadView(new favoriteList({collection:result, photo_id: id}));
			}});
				
			});
		},
		favoriteList: function(){
			var content 		= $('#innerWrapper');
			var feedsView 		= new FeedsView({el:content, title: 'My Favorites'});

			var self = this;
			feedsView.currentList = 'myfavoritelist';
			//self.myUniverse = new FeedsModels.MyUniverseCollection(1);
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