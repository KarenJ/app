define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tSwipe   			= require('tswipe'),
		iscrollit 			= require('iscrolljs'),
		PasswordModels		= require('app/models/password'),
		tpl 				= require('text!tpl/forgotPassword.html'),
		template 			= _.template(tpl);
		
		
	return Backbone.View.extend({
		el: $('#innerWrapper'),
		isPreview: false,
		myscroll: null,
		initialize: function (param) {
			this.resetPassword = new PasswordModels.passwordCollection();
			this.render();
		},
		events: {
			"click #reset": "reset"
		},
		render: function () {
			this.$el.html(template());
			return this;
		},
		reset: function(){
			var email = this.$el.find('#email').val();
			var self = this;
			if( ! this.isEmail(email)) {
					alert(config.emailFormat);
			}else{
					this.resetPassword.create(
						{	
							email: email
						},
						{success: function(result){
								if(result.get('success')==true){
									self.$el.find('#email').empty();
									self.$el.find('#result').html(config.resetPassword);
								}else{
									alert(result.get('error'));
								}
							}
						}
						);
			}
			
		},
		isEmail: function (emailFld) {
			var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return regex.test(emailFld);
		},
		close: function() {
			this.undelegateEvents();
		}
	});
});