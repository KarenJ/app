define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tpl 				= require('text!tpl/profileBio.html'),
		template 			= _.template(tpl);
		
	return Backbone.View.extend({
		initialize: function (param) {
			//this.uid = window.localStorage.getItem('uid');
			this.uid = (param.uid) ? param.uid : window.localStorage.getItem('uid');
		},
		render: function () {
			var self 		= this,
				userInfo 	= JSON.parse(unescape(window.localStorage.getItem('userInfo' + this.uid))),
				bio;

			if(userInfo.bio != null) {
				bio = userInfo.bio;
			}

			var tmpData = {};
			tmpData['bio'] 		= bio;

			this.$el.append(template(tmpData)).fadeIn('slow');

			return this;
		}
	});
});