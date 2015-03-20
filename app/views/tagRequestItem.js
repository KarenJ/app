define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tpl 				= require('text!tpl/tagRequestItem.html'),
		template 			= _.template(tpl);
		
	return Backbone.View.extend({
		tagName: "li",
		attributes: {
		  class:  "follower"
		},
		initialize: function () {
			this.render();
		},
		events: {
			"click #approve": "approve",
			"click #reject": "reject",
			'click img': 'photoPreview',
			'click .name': 'profilePreview'
		},
		render: function () {
			var tmp = this.model.attributes;
			var tmpData = {};
			
			tmpData['id'] = tmp.id;
			tmpData['member_id'] = tmp.follower_member_id;
			tmpData['fullname'] = tmp.photo.member.firstname + ' ' + tmp.photo.member.lastname; 		
			tmpData['url'] = config.url;

			if((tmp.photo && tmp.photo.filename)){
				tmpData['path'] = (tmp.photo && tmp.photo.path) ? tmp.photo.path : '';
				tmpData['filename'] = (tmp.photo && tmp.photo.filename) ? tmp.photo.filename : '';
			}else{
				tmpData['path'] = config.defaultPrimaryPhotoPath;
				tmpData['filename'] = config.defaultPrimaryPhotoFilename;
			}

			this.$el.append(template(tmpData));
			return this;
		},
		approve: function(){
			this.model.set('status',1);
			this.model.save();
			this.$el.remove();
		},
		reject: function(){
			this.model.destroy();
			this.$el.remove();
		},
		profilePreview : function(){
			var member_id = this.model.get('member').member_id;
			Backbone.history.navigate('#account/profile/' + member_id,{trigger: true});
		},
		photoPreview : function(){
			var photo_id = this.model.get('member').photo_id;
			Backbone.history.navigate('#preview/photo/' + photo_id,{trigger: true});
		}
	});
});