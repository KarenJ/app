define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tpl 				= require('text!tpl/userTagItem.html'),
		template 			= _.template(tpl);
		
	return Backbone.View.extend({
		tagName: "li",
		favoriteButtonEnabled: true,
		initialize: function (param) {
			this.render();
		},
		events:{
			'click .remove':'remove'
		},
		render: function () {
			var tmp = this.model.attributes;
			var tmpData = {};

			tmpData['member_id'] = tmp.member.member_id;
			tmpData['fullname'] = tmp.member.firstname + ' ' + tmp.member.lastname; 		
			
			this.$el.append(template(tmpData));
			
			return this;
		},
		remove: function(){
			this.$el.remove();
		}
	});
});