define(function (require) {
	"use strict";

	var $				= require('jquery'),
		_				= require('underscore'),
		Backbone		= require('backbone'),
		config 			= require('app/config'),
		AccountModels	= require('app/models/account'),
		tpl 			= require('text!tpl/signupTemplate.html'),
		template 		= _.template(tpl);

	return Backbone.View.extend({
		id: 'innerWrapper',
		initialize: function () {
			this.AccountModel = new AccountModels.userRegistration();

			_.bindAll(this, 'signUp', 'loginSuccess', 'loginError');

			this.AccountModel.bind('change', this.loginSuccess);
			this.AccountModel.bind('loginError', this.loginError);

			$("body").append(this.el);

			var dHTML = $('#innerWrapper').contents();
			$('#contentTemplate').html(dHTML);

			this.render();
		},
		events: {
			"click #signup-btn": "signUp",
			"click #showpassword": "showpassword",
			"click #showpasswordLabel": "labelShowPassword",
			"click #connectFB": "connectFB"
		},
		render: function () {
			this.$el.html(template()).addClass('onTop');

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
		signUp: function () {
			console.log("sign up process")

			var self = this;
			var ValidateEmail;

			var signemailEL = self.$("#signup-email");
			var signpasswEL = self.$("#signup-password");

			var signemail = signemailEL.val();
			var signpassw = signpasswEL.val();

			if (signemail == '' && signpassw == '') {
				alert(config.emailANDpassword);
			} else if (signemail != '' && signpassw == '') {
				if( ! self.isEmail(signemail)) {
					alert(config.emailFormat);
				} else {
					alert(config.passwordRequired);
				}
			} else if (signemail == '' && signpassw != '') {
				alert(emailRequired);
			} else if (signemail != '' && signpassw != '') {
				if( ! self.isEmail(signemail)) {
					alert(config.emailFormat);
				} else {
					ValidateEmail = new AccountModels.validateEmail;

					ValidateEmail.fetch({
						data: {email: signemail},
						success: function(data) {
							var result = data.attributes;
							if( ! result.success) {
								alert(result.message);
							}
						}
					});
				}
			}
		},
		loginSuccess: function() {
			console.log('Success')
			var self = this;

			var Email = self.$('#signup-email').val();
			var Pass  = self.$('#signup-password').val();
			
			Backbone.history.navigate("#account/info/" + Email + '/' + Pass, {trigger: true});
		},
		loginError: function() {
			alert(config.networkProblem);
		},
		showpassword: function (ev) {
			if($('#showpassword').is(':checked')) {
				$('#signup-password').attr('type', 'text');
			} else {
				$('#signup-password').attr('type', 'password');
			}
		},
		labelShowPassword: function () {
			if($('#showpassword').prop('checked') == false){
				$('#showpassword').prop('checked', true);
			}else{
				$('#showpassword').prop('checked', false);
			}
			
			this.showpassword();
		},
		connectFB: function () {
			alert(config.soon);
		},
		isEmail: function (emailFld) {
			var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return regex.test(emailFld);
		},
		close: function() {
			_.each(this.subViews, function(view) { view.remove(); });
			this.remove();
		}
	});
});