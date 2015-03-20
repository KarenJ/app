define(function (require) {
	"use strict";

	var $        = require('jquery'),
		_        = require('underscore'),
		Backbone	= require('backbone'),
		localStorage = require('localStorage'),
		config 			= require('app/config'),
		openFB        		= require('openFB'),
		storeData		= {},
		uid				= {},
		userTag         	= require('app/models/userTag'),
		PreviewModels   	= require('app/models/preview'),
		AccountModels		= require('app/models/account'),
		FavoriteModel		= require('app/models/favorite'),
		photoActionView		= require('app/views/photoActions'),
		tpl      = require('text!tpl/previewTemplate.html'),
		template = _.template(tpl);

	return Backbone.View.extend({
		itemID:null,
		el: $('#innerWrapper'),
		initialize: function (options) {
			$('body').append(this.el);
			var dHTML = $('#innerWrapper').contents();
			$('#contentTemplate').html(dHTML);
			//this.render().postRender();
			console.log('My name is ' + options.itemID);
			this.itemID = options.itemID;
			//this.model = options.model;
			this.uid = window.localStorage.getItem('uid');
			var self = this;
			//this.PreviewModel = new PreviewModels.Preview();
			this.accountSettings = new AccountModels.settingsCollection();
			this.userTag = new userTag.userTagCollection();
			this.favoriteCollection = new FavoriteModel.FavoriteCollection();
			openFB.init({appId: config.facebookAppId});
			this.photoActionView = new photoActionView({model:this.model, container: this.$el, source: 'photoPreview'}); 
			//OAuth.initialize(config.OAuthId);
			
			this.loadFavorites();
			/** Temporarily disabled, this is for the posting of photo in facebook
			var settingsLocal = window.localStorage.getItem('settingsList'+ self.uid);
			if(settingsLocal && settingsLocal!='undefined'){
				self.settings = JSON.parse(window.localStorage.getItem('settingsList'+ self.uid));
			}else{
				self.accountSettings.fetch({
						data: {member_id: self.uid},
						success: function(data) {
							//settings = data.models[0].attributes;
							self.settings = data.models[0].attributes;
							//self.postToFB(settings);
							}
						});
			}
			**/
		},
		events: {
			'click #iconTag': "tag",
			'click #iconPin': "pin",
			'click #iconShare': "share",
			'click #iconDownload': "download",			
			'click #fbShare': "fbShare",
			'click #twitterShare': "twitterShare",
			'click #directShare': "directShare",
			'click #instagramShare': "instagramShare",
			'click .favorite': 'favorite',
			'click .comment': 'comments',
			'click .favorite_container': 'memberFavoriteList',
			'click .moreAction' :'moreAction'
		},
		render: function () {
			var tmp = this.model.attributes;
			var tmpData = [];
			tmpData['url'] =  config.url + tmp.path + tmp.filename;
			tmpData['title'] = tmp.title;
						
			var favoriteModel = this.favoriteCollection.where({photo_id: tmp.photo_id})
			tmpData['favorite'] = (favoriteModel.length > 0) ? 'text-yellow' : '';			

			tmpData['favorite_count'] =  (tmp.favorite_count!=0) ? tmp.favorite_count : '';
			if(Number(tmp.favorite_count)==0)
				tmpData['favorite_label'] =  '';
			else if(tmp.favorite_count==1)
				tmpData['favorite_label'] =  ' like';
			else
				tmpData['favorite_label'] = ' likes';
			
			tmpData['comment_count'] = (tmp.comment_count > 0) ? tmp.comment_count : '';
			if(Number(tmp.comment_count)==0)
				tmpData['comment_label'] =  '';
			else if(tmp.comment_count==1)
				tmpData['comment_label'] =  ' comment';
			else
				tmpData['comment_label'] = ' comments';
				
			if(this.uid)
				tmpData['moreAction'] = '';
			else
				tmpData['moreAction'] = 'hide';
				
			this.$el.html(template(tmpData)).hide();
			this.getTaggedUsers();
			return this;
		},
		postRender: function () {
			$('.gradient').hide();
			$('#innerWrapper').removeClass('toClean').addClass('toContent');
			$('#contentTemplate').removeClass('toContent').addClass('toClean');
			$('#innerWrapper').addClass('onTop');
			$('#innerWrapper, .gradient').fadeIn('fast', function() {
				$('#contentTemplate').addClass('blurred');
			});
		},
		toggleAdvanceOptions: function(event,hasAdvanceOptions) {
			/*Todo: Create a subview for each advance options */
			event.preventDefault();
			$('.main-option *').removeClass('active');
			$(event.target).addClass("active");

			var advOptions = $('.advance-options');
			if(hasAdvanceOptions == 1){
				if(advOptions.hasClass('opened')){
					advOptions.animate({height: 0}, 100, function() {
						advOptions.addClass('closed');
						advOptions.removeClass('opened');
					});
					$('.main-option *').removeClass('active');
				}else{
					advOptions.animate({height: 150}, 100, function() {
					 	advOptions.addClass('opened');
						advOptions.removeClass('closed');
					});
				}
			}else{
				advOptions.animate({height: 0}, 100, function() {
					advOptions.addClass('closed');
					advOptions.removeClass('opened');
				});
			}
		},
		fbShare: function(){
			event.preventDefault();
			console.log('share fb');
			
			var self = this;
			var facebook_id = null;
			
			if(this.settings)
				facebook_id = this.settings.facebook_id;
				
			if(this.settings == null || facebook_id =='' || facebook_id ==0){
			
				openFB.login(function(response){
					
					if (response.authResponse) {
					
									openFB.api({
										method: 'POST',
										path: '/me/feed',
										params: {
											caption: self.PreviewModel.get('photo').title,
											picture: config.url + self.PreviewModel.get('photo').path + self.PreviewModel.get('photo').filename
										},
										success: function() {
											alert(config.facebookShareSuccess);
										},
										error: function(){
											alert(config.facebookShareError);
										}});
						   } else {
								alert('The application is not permitted to post in your wall');
						   }
				},{scope:'email,user_birthday,status_update,publish_stream,user_about_me,publish_actions'});
			}else{
				//Use the facebook id in the member settings
					openFB.api({
						method: 'POST',
						path: '/'+facebook_id+'/feed',
						params: {
							caption: self.PreviewModel.get('photo').title,
							picture: config.url + self.PreviewModel.get('photo').path + self.PreviewModel.get('photo').filename,
							access_token: this.settings.facebook_accesstoken
						},
						success: function() {
							alert(config.facebookShareSuccess);
						},
						error: function(){
							alert(config.facebookShareError);
						}});
			}
			//temporary
			/**
			    openFB.revokePermissions(
                function() {
                    alert('Permissions revoked');
               });
            **/
		},
		twitterShare:function(event){
			event.preventDefault();
			console.log('share twitter');
			
			
			
			
			
			
			
			
		},
		directShare:function(event){
			event.preventDefault(event);
			var url = '#share/photo/' + this.itemID;
			$('.optionsBottom').hide();
			Backbone.history.navigate(url, {trigger: true});
		},
		instagramShare:function(event){
			event.preventDefault();
			console.log('share instagram');
		},
		tag:function(event){
			if(!window.localStorage.getItem('uid'))
				return;
			
			//this.toggleAdvanceOptions(event,0);
			var isActive = $(event.target).hasClass('active');
			var self = this;
			if(isActive){
				var model = _.find(this.userTag.models, function(tag){
					return (tag.get('member_id')== window.localStorage.getItem('uid'));
				});
				if(model){
					model.destroy();
					this.$el.find('.tag').removeClass('active');
				}
				this.addTaggedMembers(this.userTag);
			}else{
				this.userTag.create({
						photo_id: self.itemID,
						member_id: window.localStorage.getItem('uid'),
						type: 'photo'
					},{
					success: function(){
						self.$el.find('.tag').addClass('active');
						self.addTaggedMembers(self.userTag);
					}}
				);
			}
		},
		pin:function(event){
			this.toggleAdvanceOptions(event,0);
		},
		share:function(event){
			this.toggleAdvanceOptions(event,1);
		},
		download:function(event){
			this.toggleAdvanceOptions(event,0);
		},
		getTaggedUsers: function(){
			var photo_id = this.itemID;
			var self = this;
			this.userTag.fetch({data:{
				photo_id: photo_id,
				pending:0
			}, success: function(result){
				self.addTaggedMembers(result.models);
			}});
		},
		addTaggedMembers: function(models){
			var count = models.length;
			if(count < 1)
				return;
				
			var container = this.$el.find('#userTag');
			var tagHtml = '- with ';
		
			
			models = models.slice(0,3);
			var self = this;
			var active = false;
			var x = 0;
			_.each(models, function(model){
				tagHtml += '<a href="#account/profile/'+model.get('member_id')+'" class="text-yellow">'+model.get('firstname') + ' '+ model.get('lastname')+ '</a>';
				x++;
				if((x < 3) && (x < count)){
					tagHtml += ', ';
				}
				
				if(model.get('member_id')==window.localStorage.getItem('uid'))
					active = true;
			});
			
			if(count > 3){
				tagHtml += ' and <a href="#photo/tag/'+this.itemID+'" class="text-yellow">'+(Number(count)-3)+" other </a>";
			}
			container.html(tagHtml);
			
			if(active)
				this.$el.find('.tag').addClass('active');
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
						self.render().postRender();
					}
				});
			}else{
				_.each(JSON.parse(favoriteList), function(favorite){ 
					var model  = new FavoriteModel.Favorite(favorite);
					self.favoriteCollection.add(model);
				});
				self.render().postRender();
			}
		},
		favorite: function(){
			if(this.favoriteButtonEnabled==false)
				return;
				
			if(!window.localStorage.getItem('uid'))
				return;
				
			//Put this to prevent user to click if the event is not yet finish
			this.favoriteButtonEnabled = false;
			var self = this;
			var favoriteModel = this.favoriteCollection.where({photo_id: this.model.get('photo_id')})
			
			if(favoriteModel[0]){
				this.$el.find('.favorite').removeClass('text-yellow');
				var label = '';
				var count = this.model.get('favorite_count');
				var newCount = Number(count)-1;
				this.model.set('favorite_count', newCount);
				
				if(newCount==1)
					label = 'like';
				else if(newCount > 1)
					label = 'likes';
				
				this.$el.find('.favorite_count').html((newCount>0) ? newCount : '');
				this.$el.find('.favorite_label').html(label);
				favoriteModel[0].destroy();
				
				this.updateFavoriteLocalStorage();
			}else{
				this.$el.find('.favorite').addClass('text-yellow');
				
				var label = '';
				var count = this.model.get('favorite_count');
				var newCount = Number(count)+1;
				this.model.set('favorite_count', newCount);
				
				if(newCount==1)
					label = 'like';
				else if(newCount > 1)
					label = 'likes';
				
				this.$el.find('.favorite_count').html((newCount>0) ? newCount : '');
				this.$el.find('.favorite_label').html(label);
				
				this.favoriteCollection.create({
						photo_id: this.model.get('photo_id'),
						member_id: window.localStorage.getItem('uid')
				}, {success: function(model, response){
					self.updateFavoriteLocalStorage();
				}});
			}
		},
		updateFavoriteLocalStorage : function(){
			window.localStorage.setItem('favorite'+window.localStorage.getItem('uid'),JSON.stringify(this.favoriteCollection));
			this.favoriteButtonEnabled = true;
		},
		comments: function(){
			Backbone.history.navigate('#photo/comment/' + this.itemID,{trigger: true});
		},
		memberFavoriteList: function(){
			Backbone.history.navigate('#photo/members/' + this.itemID,{trigger: true});
		},
		moreAction: function(){
			var photo_id = this.model.get('photo_id');
			
			if(!this.photoActionView.isBuilt)
				this.photoActionView.render();
			
			this.photoActionView.show(photo_id);	
			return;
		},
		close: function() {
			_.each(this.subViews, function(view) { view.remove(); });
			this.remove();
		}
	});
});