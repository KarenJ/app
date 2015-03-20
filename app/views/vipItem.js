define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tpl 				= require('text!tpl/vipItem.html'),
		template 			= _.template(tpl);
		
	return Backbone.View.extend({
		tagName: "li",
		attributes: {
		  class:  "follower"
		},
		initialize: function () {
			this.render();
		},
		events:{
			'click .vip':'tagVip',
			'click .img-circle': 'profilePreview',
			'click .name': 'profilePreview'
		},
		render: function () {
			var tmp = this.model.attributes;
			var tmpData = {};
			
			tmpData['id'] = tmp.id;
			tmpData['member_id'] = tmp.follower_member_id;
			tmpData['fullname'] = tmp.member.firstname + ' ' + tmp.member.lastname; 		
			tmpData['no_of_followers'] = tmp.no_of_followers;
			tmpData['url'] = config.url;
			tmpData['vip'] = (tmp.is_vip==1) ? 'selected' : ''; 
			
			if((tmp.member.primary_photo && tmp.member.primary_photo.filename)){
				tmpData['path'] = (tmp.member.primary_photo && tmp.member.primary_photo.path) ? tmp.member.primary_photo.path : '';
				tmpData['filename'] = (tmp.member.primary_photo && tmp.member.primary_photo.filename) ? tmp.member.primary_photo.filename : '';
			}else{
				tmpData['path'] = config.defaultPrimaryPhotoPath;
				tmpData['filename'] = config.defaultPrimaryPhotoFilename;
			}			
			this.$el.append(template(tmpData));
			return this;
		},
		tagVip: function(){
			var vipElem = this.$el.find('div.vip');
			
			if(!vipElem.hasClass('selected')){
				var is_vip = 1;
				vipElem.addClass('selected');
			}else{
				var is_vip = 0;
				vipElem.removeClass('selected');
			}
			this.model.set('is_vip', is_vip);
			this.model.save();
		},
		profilePreview : function(){
			var member_id = this.model.get('member').member_id;
			Backbone.history.navigate('#account/profile/' + member_id,{trigger: true});
		}
	});
});