define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tpl 				= require('text!tpl/blockedItem.html'),
		template 			= _.template(tpl);
		
	return Backbone.View.extend({
		tagName: "li",
		attributes: {
		  class:  "blocked-item"
		},
		events:{
			'click .block': 'block',
			'click .unblock': 'unblock',
			'click .img-circle': 'profilePreview',
			'click .name': 'profilePreview'
		},
		initialize: function () {
			this.render();
		},
		render: function () {
			var tmp = this.model.attributes;
			var tmpData = {};
			
			tmpData['blocked_id'] = tmp.blocked_id;
			tmpData['member_id'] = tmp.member_id;
			tmpData['fullname'] = tmp.member.firstname + ' ' + tmp.member.lastname; 		
			tmpData['url'] = config.url;
			tmpData['blocked'] = 'hide'; 
			tmpData['unblocked'] = ''; 
			
			if((tmp.member.photo && tmp.member.photo.filename)){
				tmpData['path'] = (tmp.member.photo && tmp.member.photo.path) ? tmp.member.photo.path : '';
				tmpData['filename'] = (tmp.member.photo && tmp.member.photo.filename) ? tmp.member.photo.filename : '';
			}else{
				tmpData['path'] = config.defaultPrimaryPhotoPath;
				tmpData['filename'] = config.defaultPrimaryPhotoFilename;
			}			
			this.$el.append(template(tmpData));
			return this;
		}, 
		block: function(){
			var self = this;
			this.collection.create({
				member_id : this.model.attributes.member_id,
				viewer_member_id : this.model.attributes.viewer_member_id
			},{
				success: function(model,response){
					if(response.success){
						self.model = model;
						self.$el.find('.block').addClass('hide');
						self.$el.find('.unblock').removeClass('hide');
					}else{
						alert(response.error);
					}
				}
			});
		},
		unblock: function(){
			this.model.destroy();
			this.$el.find('.block').removeClass('hide');
			this.$el.find('.unblock').addClass('hide');
		},
		profilePreview : function(){
			var member_id = this.model.get('member').member_id;
			Backbone.history.navigate('#account/profile/' + member_id,{trigger: true});
		},
		close: function(){
			this.remove();
		}
	});
});