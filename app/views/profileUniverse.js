define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		FeedsModels			= require('app/models/feeds'),
		baseCategory		= require('app/views/baseCategory'),
		DefaultItemView 	= require('app/views/profileUniverseItem'),
		tpl 				= require('text!tpl/profileUniverse.html'),
		FavoriteModel		= require('app/models/favorite'),
		template 			= _.template(tpl);
		
	return baseCategory.extend({
		el: "div#universe #thelist",
		initialize: function (param) {

			this.uid = (param.uid) ? param.uid : window.localStorage.getItem('uid');
			this.feedsModel 		= new FeedsModels.MyUniverseCollection(0,this.uid );
			this.favoriteCollection = new FavoriteModel.FavoriteCollection();
						
			event_bus.on('cleanupView',this.closeView, this);
			event_bus.on('setRenderUp',this.setRenderUp, this);
			event_bus.on('setRenderDown',this.setRenderDown, this);
			event_bus.on('stopLoading',this.stopLoading, this);
			
			setTimeout(this.animateImg.bind(this), 500);
			setTimeout(this.swipeGesture.bind(this), 500);
			this.filterPhoto = '*'; 
			this.ItemView = DefaultItemView; 
			this.Title = "My Universe";
				
			var date = new Date();

			var month = ((date.getMonth().toString().length== 1) ? '0'+(date.getMonth()+1) : (date.getMonth()+1));
			var day = ((date.getDate().toString().length== 1) ? '0'+date.getDate() : date.getDate());
			var hours = ((date.getHours().toString().length== 1) ? '0'+date.getHours() : date.getHours());
			var minutes = ((date.getMinutes().toString().length== 1) ? '0'+date.getMinutes() : date.getMinutes());
			var seconds = ((date.getSeconds().toString().length== 1) ? '0'+date.getSeconds() : date.getSeconds());

			var last_date = date.getFullYear()+'-'+month+'-'+day+' '+ hours+':'+minutes+':'+seconds;
			
			
			var self = this;
			this.feedsModel.fetch({
				data: {member_id: this.uid,
					length: 5,
					start_post_id: 0,
					direction: 0,
					last_date: last_date
				} ,
				success: function(model, response){
					self.collection = model;
					self.listenTo(self.collection,'add', self.addNewOne);
					self.loadFavorites();
				}
			});

			
		},
		setRenderUp : function(){
			this.renderDirection = 1;
		},
		setRenderDown : function(){
			this.renderDirection = 0;
		},
		stopLoading: function(){
			event_bus.trigger('refreshScroll');
		},
		loadFavorites: function(){
			var member_id = window.localStorage.getItem('uid');
			
			var favoriteList = window.localStorage.getItem('favorite'+window.localStorage.getItem('uid'));
			var self = this;
			if(!favoriteList){

				this.favoriteCollection.fetch({
					data: {
						member_id: member_id
					},
					success: function(result){
						self.render();
					}
				});
			}else{
				_.each(JSON.parse(favoriteList), function(favorite){ 
					var model  = new FavoriteModel.Favorite(favorite);
					self.favoriteCollection.add(model);
				});
				self.render();
			}
		},
		close: function(){
			this.$el.remove();
		}
	});
});