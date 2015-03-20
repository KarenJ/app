define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tSwipe   			= require('tswipe'),
		iscrollit 			= require('iscrolljs'),
		PasswordModels		= require('app/models/password'),
		tpl 				= require('text!tpl/resetPassword.html'),
		template 			= _.template(tpl);
		
		
	return Backbone.View.extend({
		el: $('#innerWrapper'),
		isPreview: false,
		myscroll: null,
		initialize: function (param) {
			this.changePassword = new PasswordModels.changePasswordCollection();
			this.session_id = param.session_id;
			this.render();
		},
		events: {
			"click #changePassword": "change"
		},
		render: function () {
			this.$el.html(template());
			return this;
		},
		change: function(){
			
			var password1 = this.$el.find('#new_password').val();
			var password2 = this.$el.find('#new_password2').val();
			
			
			if(password1!=password2){
				alert(config.passwordNotMatch);
			}else{
				var self = this;

				this.changePassword.create(
					{	
					session_id: self.session_id,
					email: self.email,
					new_password: password1
					},
				{success: function(result){

						if(result.get('success')== true){
							window.localStorage.setItem('uid',result.get('member').member_id);
							window.localStorage.setItem('userInfo' + result.get('member').member_id, JSON.stringify(result.get('member')));
							self.close();
							Backbone.history.navigate("#account/profileLogin", {trigger: true});
						}else
							alert(result.get('error'));
					}
				});		
			}
		},
		close: function() {
			this.$el.remove();
			this.undelegateEvents();
		}
	});
});