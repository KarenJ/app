define(function (require) {

	"use strict";

	var $			 = require('jquery'),
		Backbone	 = require('backbone'),
		config		 = require('app/config'),
		eventBus		 = require('eventBus'),
		// localStorage = require('localStorage'),
		
		MostRated	 = Backbone.Model.extend({
			urlRoot: config.apiUrl + 'rating/most_rated?start=0&length=10',
			idAttribute: 'id',
			initialize: function () {},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),

		MostRatedCollection = Backbone.Collection.extend({
			initialize : function(){
				event_bus.on('fetchFeedmostratedlist', this.fetchFeed, this);
				this.pagestart = 0;
				this.pagelength = config.noOfFeeds; 
			},
			model: MostRated,
			url: function(){
				return config.apiUrl + 'rating/most_rated';
			}, 
			fetchFeed : function(dir){
				console.log('fetching most rated');
				
				if(dir == 1){
					event_bus.trigger('cleanupView');
					this.reset();	
					var self = this;
				 	this.fetch({ data:{
				 		start: self.models.length,
				 		length: self.pagelength
				 		},
				 		add: true, remove: false, merge: true});
				}else{
					event_bus.trigger('refreshScroll');
				}
			},
			parse: function(response) {
				console.log('parsing my mostrated');
				if(response.success) {
					this.responseData = response.popular;
					window.localStorage.setItem('mostrated',JSON.stringify(this.responseData));
					return this.responseData;
				} else {
					//console.log("Feeds most rated collection response failed")
					// var responseData = JSON.parse(unescape(window.localStorage.getItem('mostrated')));
					// return responseData;
				}
			}
		}),
	   
	  MostFollowed	= Backbone.Model.extend({
			urlRoot: config.apiUrl + 'friends/most_followed?start=0&length=10',
			idAttribute: 'member_id',
			initialize: function () {},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),

		MostFollowedCollection = Backbone.Collection.extend({

			initialize : function(){
				event_bus.on('fetchFeedmostfollowedlist', this.fetchFeed, this);
				this.pagestart = 0;
				this.pagelength = config.noOfFeeds;
			},
			model: MostFollowed,
			url: function(){
				return config.apiUrl + 'friends/most_followed?start=' + this.pagestart + '&length=' + this.pagelength;
			}, 
			fetchFeed : function(dir){
				console.log('fetching most followed');
				var self = this;

				if(dir==1){
					this.reset();
				 	this.fetch({ add: true, remove: false, merge: false});
       			}else{
					event_bus.trigger('refreshScroll');
				}
			},
			parse: function(response) {
				console.log('parsing most followed');
				if(response.success) {
					this.responseData = response.members;
					window.localStorage.setItem('mostfollowed',JSON.stringify(this.responseData));
					return this.responseData;
				} else {
					//console.log("Feeds most followed collection response failed");
					// var responseData = JSON.parse(unescape(window.localStorage.getItem('mostrated')));
					// return responseData;
				}
					
			}

		}),

   
		MostPopular	= Backbone.Model.extend({
			urlRoot: config.apiUrl + 'members/most_popular?start=0&length=10',
			idAttribute: 'member_id',
			initialize: function () {},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
					return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),


		MostPopularCollection = Backbone.Collection.extend({

			initialize : function(){
				event_bus.on('fetchFeedmostpopularlist', this.fetchFeed, this);
				this.pagestart = 0;
				this.pagelength = config.noOfFeeds;
			},
			model: MostPopular,
			url: function(){
				return config.apiUrl + 'members/most_popular?start=' + this.pagestart + '&length=' + this.pagelength;
			}, 
			fetchFeed : function(dir){

				console.log('fetching most popular');
				
				if(dir==1){
					this.reset();
				 	this.fetch({ add: true, remove: false, merge: false});
       			}else{
					event_bus.trigger('refreshScroll');
				}
				
			},
			parse: function(response) {
				if(response.success) {
					console.log('parsing most popular');
					this.responseData = response.most_popular;
					window.localStorage.setItem('mostpopular',JSON.stringify(this.responseData));
					return this.responseData;
				} else {

				}
			}
		}),


		MyUniverse	= Backbone.Model.extend({
			urlRoot: config.apiUrl + 'posts/post?start=0&length=10',
			idAttribute: 'post_id',
			initialize: function () {},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
					return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),

		MyUniverseCollection = Backbone.Collection.extend({
			initialize : function(following, uid){
		var date = new Date();

			var month = ((date.getMonth().toString().length== 1) ? '0'+date.getMonth() : date.getMonth());
			var day = ((date.getDate().toString().length== 1) ? '0'+date.getDate() : date.getDate());
			var hours = ((date.getHours().toString().length== 1) ? '0'+date.getHours() : date.getHours());
			var minutes = ((date.getMinutes().toString().length== 1) ? '0'+date.getMinutes() : date.getMinutes());
			var seconds = ((date.getSeconds().toString().length== 1) ? '0'+date.getSeconds() : date.getSeconds());

			this.last_date = date.getFullYear()+'-'+month-1+'-'+day+' '+ hours+':'+minutes+':'+seconds;
				
				this.uid = (uid) ? uid : window.localStorage.getItem('uid');
				this.start_post_id = 0;
				this.last_date = date.getFullYear()+'-'+month+'-'+day+' '+ hours+':'+minutes+':'+seconds;
				this.pagelength = 5; 
				this.direction = 0;

				this.following = following;
				
				event_bus.on('fetchFeedmyuniverselist', this.fetchFeed, this);
			},
			model: MyUniverse,
			url: function(){
				return config.apiUrl + 'posts/post';
			}, 
			fetchFeed : function(dir, following){
				console.log('fetching my universe');

				if(this.models.length > 0){
					
					this.models = _.sortBy(this.models, 
						function(result){ 
						return result.get('date_added'); 
						});
					this.models.reverse();
					
					this.start_post_id = (dir==0) ? this.last().get('post_id') : this.first().get('post_id');
			 		this.last_date = (dir==0) ? this.last().get('date_added'): this.first().get('date_added');
				}else{
					this.start_post_id = 0;
				 	this.last_date = 0;
				}
				
				
				var self = this;
			 	this.fetch({ data: {
			 		member_id: self.uid,
			 		length: 5,
			 		start_post_id: self.start_post_id,
			 		last_date: self.last_date,
			 		direction: dir,
			 		following : self.following
			 	}, add: true, remove: false, merge: false, success: function(response, data){
			 		if(!data.success){
			 			event_bus.trigger('refreshScroll');
			 		}
			 	}});
			},
			parse: function(response) {
				console.log('parsing my universe');
				if(response.success) {
					this.responseData = response.posts;
					window.localStorage.setItem('myuniverse',JSON.stringify(this.responseData));
					return this.responseData;
				} else {

				}
			}
		}),
		
		MyFeeds	= Backbone.Model.extend({
			urlRoot: config.apiUrl + 'posts/post',
			idAttribute: 'post_id',
			parse: function(response) {
					return response;
			},
			
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),

		MyFeedsCollection = Backbone.Collection.extend({

			model: MyFeeds,

			url: config.apiUrl + 'posts/post',
			parse: function(response) {
				if(response.success) {
					return response.posts;
				} else {
					console.log('My Feeds ' + config.responseFailed)
				}
			}
		})
		
		;
	return {
	   MostRated: MostRated,
	   MostRatedCollection: MostRatedCollection,
	   MostFollowed: MostFollowed,
	   MostFollowedCollection: MostFollowedCollection,
	   MostPopular: MostPopular,
	   MostPopularCollection: MostPopularCollection,
	   MyUniverse: MyUniverse,
	   MyUniverseCollection: MyUniverseCollection,
	   MyFeeds: MyFeeds,
	   MyFeedsCollection: MyFeedsCollection
	};

});