define(function (require) {
	"use strict";

	var $        = require('jquery'),
		_        = require('underscore'),
		Backbone	= require('backbone'),
		localStorage = require('localStorage'),
		config 			= require('app/config'),
		storeData		= {},
		uid				= {},
		AccountModels   	= require('app/models/account'),
		tpl      = require('text!tpl/loginTemplate.html'),
		template = _.template(tpl);

	return Backbone.View.extend({
		el: $('#innerWrapper'),
		initialize: function () {
			this.AccountModel = new AccountModels.LogInCollection();

			$('body').append(this.el);

			var dHTML = $('#innerWrapper').contents();
			$('#contentTemplate').html(dHTML);

			this.render().postRender();
		},
		events: {
			"click #forgotPassword": "forgotPassword",
			"click #logIn": "logMeIn",
			"click #connectFB": "connectFB",
			"click #showpassword": "showpassword",
			"click #showpasswordLabel": "labelShowPassword"
		},
		render: function () {
			this.$el.html(template()).hide();

			return this;
		},
		postRender: function () {
			$('.gradient').hide();
			
			$('#innerWrapper').removeClass('toClean').addClass('toContent');
			$('#contentTemplate').removeClass('toContent').addClass('toClean');

			$('#innerWrapper').addClass('onTop');

			$('#innerWrapper, .gradient').fadeIn('fast', function() {
				$('#contentTemplate').addClass('blurred');
			});
		},
		forgotPassword: function () {
			Backbone.history.navigate("#password/reset", {trigger: true});
		},
		connectFB: function () {
			alert(config.soon);
		},
		logMeIn: function() {
			var self = this;

			var emailEL = self.$("#login-email");
			var passwEL = self.$("#login-password");

			var email = emailEL.val();
			var passw = passwEL.val();

			if (email == '' && passw == '') {
				alert(config.emailANDpassword);
			} else if (email != '' && passw == '') {
				if( ! self.isEmail(email)) {
					alert(config.emailFormat);
				} else {
					alert(config.passwordRequired);
				}
			} else if (email == '' && passw != '') {
				alert(config.emailRequired);
			} else if (email != '' && passw != '') {
				if( ! self.isEmail(email)) {
					alert(config.emailFormat);
				} else {
					self.AccountModel.create({
						email: email,
						password: passw,
					},{
						wait: true,
						success: function(model, response) {
							if(response.success) {
								alert(response.message);
								Backbone.history.navigate("#account/profileLogin", {trigger: true});
								//Backbone.history.navigate("#account/profile", {trigger: true});
							} else {
								alert(response.error);
							}
						},
						error: function(model, err) {
							alert(config.loginFail);
						}
					});
				}
			}
		},
		isEmail: function (emailFld) {
			var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return regex.test(emailFld);
		},
		showpassword: function (ev) {
			if($('#login-showpassword').is(':checked')) {
				$('#login-password').attr('type', 'text');
			} else {
				$('#login-password').attr('type', 'password');
			}
		},
		labelShowPassword: function () {
			if($('#login-showpassword').prop('checked') == false){
				$('#login-showpassword').prop('checked', true);
			}else{
				$('#login-showpassword').prop('checked', false);
			}
			
			this.showpassword();
		},
		close: function() {
			_.each(this.subViews, function(view) { view.remove(); });
			this.remove();
		}
	});
});