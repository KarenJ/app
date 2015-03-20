define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tpl 				= require('text!tpl/searchItem.html'),
		template 			= _.template(tpl);
		
	return Backbone.View.extend({
		tagName: "li",
		initialize: function (param) {
			this.followingCollection = param.followingCollection;
			this.uid = window.localStorage.getItem('uid');
			this.render();
		},
		events:{
			'click .img-feeds':'openContent',
			'click .img-circle': 'profilePreview',
			'click .name': 'profilePreview',
			'click .search-add-icon': 'follow',
			'click .unfollow': 'unfollow'
		},
		render: function () {
			var tmp = this.model.attributes;
			var tmpData = {};
			tmpData['member_id'] = tmp.member.member_id;
			tmpData['fullname'] = tmp.member.firstname + ' ' + tmp.member.lastname;
			tmpData['url'] = config.url;
			
			if((tmp.member.photo && tmp.member.photo.filename)){
				tmpData['path'] = (tmp.member.photo && tmp.member.photo.path) ? tmp.member.photo.path : '';
				tmpData['filename'] = (tmp.member.photo && tmp.member.photo.filename) ? tmp.member.photo.filename : '';
			}else{
				tmpData['path'] = config.defaultPrimaryPhotoPath;
				tmpData['filename'] = config.defaultPrimaryPhotoFilename;
			}
			
			tmpData['rate'] = tmp.rate.average;
			
			if(window.localStorage.getItem('uid')== tmp.member.member_id){
				tmpData['follow'] = 'hidden';
				tmpData['unfollow'] = 'hidden';
				tmpData['requested'] = 'hidden';
			}else if(tmp.is_following && tmp.is_pending == 0){
				tmpData['follow'] = 'hidden';
				tmpData['unfollow'] = '';
				tmpData['requested'] = 'hidden';
			}else if(tmp.is_following && tmp.is_pending == 1){
				tmpData['follow'] = 'hidden';
				tmpData['unfollow'] = 'hidden';
				tmpData['requested'] = '';
			}else{
				tmpData['follow'] = '';
				tmpData['unfollow'] = 'hidden';
				tmpData['requested'] = 'hidden';
			}

			this.$el.append(template(tmpData));
			return this;
		},
		openContent : function(){
			var tmp = this.model.attributes;
			Backbone.history.navigate('#preview/photo/' + tmp.photo_id,{trigger: true});
		},
		profilePreview : function(){
			var member_id = this.model.get('member').member_id;
			Backbone.history.navigate('#account/profile/' + member_id,{trigger: true});
		},
		follow: function(event){
			var self = this;
			var parentElem = this.$el;
			var following_member_id = this.model.get('member').member_id;

			self.followingCollection.create({
					member_id: self.uid,
					following_member_id: following_member_id
			},{
					success: function(model, response) {
						if(response.success) {
							if(response.is_pending==1){
								parentElem.find('div.request-sent').removeClass('hidden');
								parentElem.find('div.follow').addClass('hidden');
								parentElem.find('div.unfollow').addClass('hidden');
							}else{
								parentElem.find('div.request-sent').addClass('hidden');
								parentElem.find('div.follow').addClass('hidden');
								parentElem.find('div.unfollow').removeClass('hidden');
							}
						} else {
								alert(response.error);
						}
					},
					error: function(model, err) {
						alert(config.responseFailed);
					}
				});
		},
		unfollow: function(event){
			var parentElem = this.$el;
			var member_id = this.model.get('member').member_id;
			var model = _.find(this.followingCollection.models, function(following){ 
				return following.get('member_id') == member_id; 
				});
			model.destroy();
			window.localStorage.setItem('followersList' + this.uid,JSON.stringify(this.followingCollection.models));
			parentElem.find('div.unfollow').addClass('hidden');
			parentElem.find('div.search-add-icon').removeClass('hidden');
		}
	});
});