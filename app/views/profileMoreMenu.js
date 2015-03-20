define(function (require) {
	"use strict";

		var $					= require('jquery'),
			_ 					= require('underscore'),
			Backbone 			= require('backbone'),
			config 				= require('app/config'),
			storeData			= {},
			uid					= {},
			jqueryCookie		= require('jqueryCookie'),
			AccountModels		= require('app/models/account'),
			moreMenu 			= require('text!tpl/moreMenuTemplate.html'),
			profileMoreMenu 	= require('text!tpl/profileMoreMenuTemplate.html'),
			template			= _.template(moreMenu),
			profileMenuTemplate	= _.template(profileMoreMenu);
			

	return Backbone.View.extend({
		el: $("body"),
		initialize: function (param) {
			
			this.accountModel = new AccountModels.blockedCollection();
			this.followingModel = new AccountModels.followingCollection();
			this.reportModel = new AccountModels.reportCollection();
			
			this.uid = (param.uid) ? param.uid : window.localStorage.getItem('uid');
			
			if(this.uid == window.localStorage.getItem('uid'))
				this.isSelf = true;
			else
				this.isSelf = false;
				
			var self = this;
			if(!this.isSelf){
				$.when(
					self.accountModel.fetch({
						data: {
							member_id : window.localStorage.getItem('uid'),
							viewer_member_id: self.uid
						}
					}),
					self.followingModel.fetch({
						data: { member_id: window.localStorage.getItem('uid') }
					})
					).done(function () {
						self.render();
					});
			}else
				this.render();
		},
		events: {
			"click #follow": "follow",
			"click #unfollow": "unfollow",
			"click #block": "block",
			"click #unblock": "unblock",
			"click #report": "reportAbused",
			"click .vipList": "vipList",
			"click .blockedList": "blockedList",
			"click .pendingRequest": "pendingRequest",
			"click .favoriteList": "favorites",
			"click .tagRequest": "tagRequest"
		},
		render: function () {
			var self = this;
			if(this.isSelf){
				$("#innerWrapper").after(profileMenuTemplate());
			}else{
				var tmpData = {};
				if(this.accountModel.length == 0){
					tmpData['block'] = '';
					tmpData['unblock'] = 'hide';
				}else{
					tmpData['block'] = 'hide';
					tmpData['unblock'] = '';
				}
				
				this.model = _.find(self.followingModel.models, function (following){
					 return (following.get('member_id') == self.uid);
				});
				if(this.model){
					tmpData['follow'] = 'hide';
					tmpData['unfollow'] = '';
				}else{
					tmpData['follow'] = '';
					tmpData['unfollow'] = 'hide';
				}
				$("#innerWrapper").after(template(tmpData));
			}
			return this;
		},
		block: function(event){
			var self = this;
			self.accountModel.create({
				member_id : window.localStorage.getItem('uid'),
				viewer_member_id : self.uid
			},{
				success: function(model, response) {
					if(response.success){
						$('#block').addClass('hide');
						$('#unblock').removeClass('hide');
					}else{
						alert(response.error);
					}
				
				},
				error: function(model, err) {
						alert(config.responseFailed);
				}
			});				
		},
		unblock: function(){
			this.accountModel.models[0].destroy();
			
			$('#block').removeClass('hide');
			$('#unblock').addClass('hide');
			
		},
		show: function(){
			$('#otherMenu').modal();
		},
		hide: function(){
			$('#otherMenu').modal('hide');
		},
		vipList: function(){
			this.hide();
			Backbone.history.navigate("#account/vip", {trigger: true});
		},
		pendingRequest: function(){
			this.hide();
			Backbone.history.navigate("#account/approval", {trigger: true});
		},
		blockedList: function(){
			this.hide();
			Backbone.history.navigate("#account/blocked", {trigger: true});
		},
		favorites: function(){
			this.hide();
			Backbone.history.navigate("#photo/favorites", {trigger: true});
		},
		tagRequest: function(){
			this.hide();
			Backbone.history.navigate("#account/tag", {trigger: true});
		},
		follow: function(){
			var self = this;
			this.followingModel.create({
					following_member_id: self.uid,
					member_id: window.localStorage.getItem('uid')
				},
				{
				success: function(model, response){
					if(response.success){
						self.model = model;
						$('#otherMenu').find('#follow').addClass('hide');
						$('#otherMenu').find('#unfollow').removeClass('hide');
					}else
						alert(response.error);
				}});
			
		},
		unfollow: function(){
			this.model.destroy();
			$('#otherMenu').find('#follow').removeClass('hide');
			$('#otherMenu').find('#unfollow').addClass('hide');
		},
		reportAbused: function(){
			var self = this;
			this.reportModel.create({
				reporter_member_id: window.localStorage.getItem('uid'),
				member_id: self.uid
			},{
				success: function(model, response){
					if(response.success)
						alert(response.message);
					else
						alert(response.error);
				}
			});
		},
		close: function() {
			this.undelegateEvents();
			$('#otherMenu').remove();
		}
	});
});