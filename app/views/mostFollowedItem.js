define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config 		        = require('app/config'),
		AccountModels   	= require('app/models/account'),
		tpl                 = require('text!tpl/mostFollowedItem.html'),
		template            = _.template(tpl);
		
	return Backbone.View.extend({
		tagName: "li",
		initialize: function () {
			var self = this;
			this.AccountModel = new AccountModels.memberProfilePict([], { member_id: this.model.attributes.member_id });

			$.when(
				this.AccountModel.fetch()
			).done(function () {
				self.render();
			});
		},
		events:{
			'click .img-feeds':'openContent'
		},
		render: function () {
			var self = this;
			var tmp = this.model.attributes;
			var profPict = self.AccountModel.attributes;
			var tmpData = {};

			if(profPict.profile_photo.status != undefined && profPict.profile_photo.status == '1') {
				tmpData['profilePict'] = config.url + profPict.profile_photo.path + profPict.profile_photo.filename;
			} else {
				tmpData['profilePict'] = config.url + config.defaultPrimaryPhotoPath + config.defaultPrimaryPhotoFilename;
			}

			tmpData['url'] = config.url;
			tmpData['member_id'] = tmp.member_id;
			tmpData['fullname'] = tmp.firstname + ' ' + tmp.lastname;
			tmpData['no_followers'] = tmp.no_followers;
								
			if(tmp.photo_id > 0) {
				tmpData['path'] = tmp.photo.path;
				tmpData['filename'] = tmp.photo.filename;
			} else {
				tmpData['path'] = '/tmp/';
				tmpData['filename'] = '500x150.jpg';
			}

			this.$el.append(template(tmpData));
								
			return this;
		},
		openContent : function(){
			var tmp = this.model.attributes;
			Backbone.history.navigate('#preview/photo/' + tmp.photo_id,{trigger: true});
		}
	});
});