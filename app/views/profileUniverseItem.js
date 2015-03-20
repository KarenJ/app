define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		userTag         	= require('app/models/userTag'),
		photoActionView		= require('app/views/photoActions'),
		tpl 				= require('text!tpl/profileUniverse.html'),
		FavoriteModel		= require('app/models/favorite'),
		template 			= _.template(tpl);
		
	return Backbone.View.extend({
		tagName: "li",
		attributes: {
		  class:  "item"
		},
		favoriteButtonEnabled: true,
		initialize: function (param) {
			this.favoriteCollection = param.self.favoriteCollection;
			this.userTag = new userTag.userTagCollection();
			this.photoActionView = new photoActionView({model:this.model, container: this.$el}); 
			this.render();
			//this.photoActionView.render();

		},
		events:{
			'dblclick .img-feeds':'photoPreview',
			'click .img-circle': 'profilePreview',
			'click .name': 'profilePreview',
			'click .moreAction' :'moreAction',
			'click .favorite': 'favorite',
			'click .comment': 'comments',
			'click .favorite_container': 'memberFavoriteList'
		},
		render: function () {
			var tmp = this.model.attributes;
			var tmpData = {};
			var userInfo = JSON.parse(window.localStorage.getItem('userInfo'+tmp.member_id));
			
			tmpData['id'] = tmp.post_id;
			tmpData['member_id'] = tmp.member_id;
			tmpData['fullname'] = userInfo.firstname + ' ' + userInfo.lastname; 		
			
			tmpData['average_rate'] = tmp.average_rate;
			tmpData['date'] = tmp.date_added;
			tmpData['time'] = this.getTime(tmp.date_added);
			tmpData['url'] = config.url;
			
			tmpData['img_path'] = tmp._photo.path;
			tmpData['img_filename'] = tmp._photo.filename;
			tmpData['title'] = tmp._photo.title;
			tmpData['status_message'] = tmp.status_message;
			
			if((userInfo.primary_photo && userInfo.primary_photo.filename)){
				tmpData['path'] = (userInfo.primary_photo && userInfo.primary_photo.path) ? userInfo.primary_photo.path : '';
				tmpData['filename'] = (userInfo.primary_photo && userInfo.primary_photo.filename) ? userInfo.primary_photo.filename : '';
			}else{
				tmpData['path'] = config.defaultPrimaryPhotoPath;
				tmpData['filename'] = config.defaultPrimaryPhotoFilename;
			}			
			
			var favoriteModel = this.favoriteCollection.where({photo_id: this.model.get('photo_id')})
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
				
			this.$el.append(template(tmpData)).fadeIn('slow');
			this.getTaggedUsers();
			
			return this;
		},
		moreAction: function(){
			//event_bus.trigger('appendNewPost');
			var photo_id = this.model.get('photo_id');
			
			if(!this.photoActionView.isBuilt)
				this.photoActionView.render();
			
			this.photoActionView.show(photo_id);	
			return;
		},
		profilePreview : function(){
			var member_id = this.model.get('member_id');
			Backbone.history.navigate('#account/profile/' + member_id,{trigger: true});
		},
		photoPreview : function(){
			var photo_id = this.model.get('photo_id');
			Backbone.history.navigate('#preview/photo/' + photo_id,{trigger: true});
		},
		getTime : function(datefeed){
			//datefeed = parseInt(datefeed);

			var parts = datefeed.split(' ');
			var date = parts[0].split('-');
			var time = parts[1].split(':');
			// new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
			 datefeed = new Date(date[0], date[1]-1, date[2],time[0],time[1],time[2]); // Note: months are 0-based
			  
			var minutes = 1000 * 60;
			var hours = minutes * 60;
			var days = hours * 24;
			var years = days * 365;
			var datenow = new Date().getTime();
			var datefeed = Date.parse(datefeed);
			var t = datenow - datefeed;
			
			var day = Math.round(t / days);
			var hour = Math.round(t/ hours);
			var min = Math.round(t / minutes);
			
			var time = null;
			if((day !=0) && (day > 30))
				time = new Date(datefeed).toDateString();
			else if((day !=0) && (day < 30)){
				time = day + ((day==1) ? ' day' : ' days');
			}else if(hour !=0){
				time = hour + ((hour==1) ? ' hour' : ' hours');
			}else if(min >0){
				time = min + ((min==1) ? ' min' : ' mins');
			}else{
				time = 'just now';
			}
			return time;
		},
		favorite: function(){
			if(this.favoriteButtonEnabled==false)
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
		updateTime: function(){
			var model = this.model;
			var elem = this.$el.find('.date_added');
			elem.html(this.getTime(this.model.get('date_added')));
		},
		getTaggedUsers: function(){
			var photo_id = this.model.get('photo_id');
			var self = this;
			this.userTag.fetch({data:{
				photo_id: photo_id,
				pending: 0
			}, success: function(result){
				self.addTaggedMembers(result.models, self);
			}});
		},
		addTaggedMembers: function(models, self){
			var container = self.$el.find('#userTag');
			var count = models.length;
			if(count < 1){
				return;
			}
				
			var tagHtml = '- with ';
		
			models = models.slice(0,3);
			
			var x = 0;
			_.each(models, function(model){
				tagHtml += '<a href="#account/profile/'+model.get('member_id')+'" class="text-yellow">'+model.get('firstname') + ' '+ model.get('lastname')+ '</a>';
				x++;
				if((x < 3) && (x < count)){
					tagHtml += ', ';
				}
			});
			
			if(count > 3){
				tagHtml += ' and <a href="#photo/tag/'+ self.model.get('photo_id')+'" class="text-yellow">'+(Number(count)-3)+" other </a>";
			}
			container.html(tagHtml);
		},
		comments: function(){
			var photo_id = this.model.get('photo_id');
			Backbone.history.navigate('#photo/comment/' + photo_id,{trigger: true});
		},
		memberFavoriteList: function(){
			var photo_id = this.model.get('photo_id');
			Backbone.history.navigate('#photo/members/' + photo_id,{trigger: true});
		}
	});
});