define(function (require) {
	"use strict";

		var $					= require('jquery'),
			_ 					= require('underscore'),
			Backbone 			= require('backbone'),
			config 				= require('app/config'),
			localStorage        = require('localStorage'),
			storeData			= {},
			uid					= {},
			jqueryCookie		= require('jqueryCookie'),
			AccountModels		= require('app/models/account'),
			menuView 			= require('app/views/menu'),
			Passwordtpl 		= require('text!tpl/changePassword.html'),
			template 			= _.template(Passwordtpl);

	return Backbone.View.extend({
		el: $('#innerWrapper'),
		initialize: function () {
			console.log('initialize change password');
			this.AccountModel = new AccountModels.changePasswordCollection();		
			$('body').append(this.el);

			var dHTML = $('#innerWrapper').contents();
			$('#contentTemplate').html(dHTML);
			this.menu = new menuView();
						
			this.render();
			this.postRender();
		},
		events: {
			"click #btn-changePassword": "changePassword"
		},
		render: function () {
			var self = this;
			console.log('render change password template');
			

			this.$el.append(template()).hide();
			this.menu.render();
			
			return this;
		},
		postRender: function(){
			$('.gradient').hide();
			
			$('#innerWrapper').removeClass('toClean').addClass('toContent padding-top-10');
			$('#contentTemplate').removeClass('toContent').addClass('toClean');

			$('#innerWrapper').addClass('onTop');

			$('#innerWrapper, .gradient').fadeIn('fast', function() {
				$('#contentTemplate').addClass('blurred');
			});
		},
		changePassword: function(event){
			event.preventDefault();
			var self = this;
			
			var old_password = this.$('#old_password').val();
			var new_password = this.$('#new_password').val();
			var new_password2 = this.$('#new_password2').val();
			
			if(!new_password)
				alert(config.invalidPassword);
			else if(!this.validate(new_password, new_password2))
				alert(config.passwordNotMatch);
			else{
				var userInfo = $.parseJSON(window.localStorage.getItem('userInfo' + window.localStorage.getItem('uid')));
				
				var result = self.AccountModel.create({
					"email": userInfo.email, 
					"old_password": old_password,
					"new_password": new_password
					},{
						wait: true,
						success: function(model, response) {
							if(response.success) {
								alert(response.message);
								Backbone.history.navigate("#account/settings", {trigger: true});
							} else {
								alert(response.error);
							}
						},
						error: function(model, err) {
							alert(config.loginFail);
						}
				});
			}
		},
		validate: function(new_password, new_password2){
			return (new_password==new_password2);
		},
		close(){
			this.undelegateEvents();
			this.menu.close();
		}
		});
});