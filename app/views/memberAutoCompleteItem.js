define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tpl 				= require('text!tpl/memberAutoCompleteItem.html'),
		userTagView			= require('app/views/userTagItem'),
		template 			= _.template(tpl);
		
	return Backbone.View.extend({
		tagName: "li",
		initialize: function (param) {
			this.parentContainer = param.container;
			this.render();
		},
		events: {
			"click .member-item": "tag",
		},
		render: function () {
			var tmp = this.model.attributes;
			var tmpData = {};
			
			tmpData['member_id'] = tmp.member_id;
			tmpData['fullname'] = tmp.member.firstname + ' ' + tmp.member.lastname; 	
			tmpData['url'] = config.url;
			
			if((tmp.primary_photo && tmp.primary_photo.filename)){
				tmpData['path'] = (tmp.primary_photo && tmp.primary_photo.path) ? tmp.primary_photo.path : '';
				tmpData['filename'] = (tmp.primary_photo && tmp.primary_photo.filename) ? tmp.primary_photo.filename : '';
			}else{
				tmpData['path'] = config.defaultPrimaryPhotoPath;
				tmpData['filename'] = config.defaultPrimaryPhotoFilename;
			}
			
			this.$el.append(template(tmpData));
			return this;
		},
		tag: function(){

			var view = new userTagView({model: this.model});
			$('#tagged').append(view.$el[0]);
			$('#tag').val('');
			$('#tag').focus();
			this.parentContainer.empty();
		}
	});
});