define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tpl 				= require('text!tpl/memberFavoriteItem.html'),
		template 			= _.template(tpl);
		
	return Backbone.View.extend({
		tagName: "li",
		attributes: {
		  class:  "follower"
		},
		initialize: function (param) {
			this.followingCollection = param.followingCollection;
			this.render();
		},
		events:{
			'click .img-circle': 'profilePreview',
			'click .name': 'profilePreview'
		},
		render: function () {
			var tmp = this.model.attributes;
			var tmpData = {};
			
			tmpData['id'] = tmp.comment_id;
			tmpData['member_id'] = tmp.member.member_id;
			tmpData['fullname'] = tmp.member.firstname + ' ' + tmp.member.lastname; 		
			tmpData['url'] = config.url;
						
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
		profilePreview : function(){
			var member_id = this.model.get('member_id');
			Backbone.history.navigate('#account/profile/' + member_id,{trigger: true});
		}
	});
});