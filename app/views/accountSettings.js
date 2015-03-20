define(function (require) {
	"use strict";

		var $					= require('jquery'),
			_ 					= require('underscore'),
			Backbone 			= require('backbone'),
			config 				= require('app/config'),
			localStorage        = require('localStorage'),
			openFB        		= require('openFB'),
			storeData			= {},
			uid					= {},
			jqueryCookie		= require('jqueryCookie'),
			AccountModels		= require('app/models/account'),
			menuView 			= require('app/views/menu'),
			Settingstpl 		= require('text!tpl/settingsTemplate.html'),
			ProfilePicture		= require('app/views/profilePictureModal'),
			template 			= _.template(Settingstpl),
			Accounttpl 			= require('text!tpl/addAccountItem.html'),
			accountTemplate 	= _.template(Accounttpl);

	return Backbone.View.extend({
		el: $('#innerWrapper'),
		initialize: function () {
			console.log('initialize account settings');
			this.menu = new menuView();
			this.AccountModel = new AccountModels.signInCollection();
			this.accountProfile = new AccountModels.profileCollection();
			this.uid = window.localStorage.getItem('uid');
			openFB.init({appId: config.facebookAppId});
			$('body').append(this.el);
	
			var dHTML = $('#innerWrapper').contents();
			$('#contentTemplate').html(dHTML);
			
			var self = this;
			self.accountProfile.fetch({
					data: {member_id: self.uid},
					success: function(data) {
						self.render().postRender();
						self.navigate('General Settings','#general-settings');
					}
				});
				
			var accounts = JSON.parse(window.localStorage.getItem('accounts'));
			_.each(accounts, function (account){
				self.buildAccountsHTML(account);
			});
		},
		events: {
			"click .settings-checkbox": "enableDisable",
			"click #disable_account": "enableDisableMyAccount",
			"click .icon-settings": "switchPanel",
			"click #add-account-link": "showAddAccountForm",
			"click #logInAnotherAccount": "logIn",
			"click #cancel": "hideAddAccountForm",
			"click .onOffAccount": "enableDisableAccount",
			"click .remove-account": "removeAccount",
			"click .social-settings-checkbox": "addSocialAccount",
			"click #signOut": "logOut",
			"click #profilePicture": "changeProfilePicture"
		},
		addSocialAccount: function(event){
			//revoke permission, use for testing
			/**
			openFB.revokePermissions(
	              function() {
	                   alert('Permissions revoked');
	        });
	        **/
			var self = this;
			var facebook_id = self.collection.models[0].get('facebook_id');
			var name = event.target.name;
			if(name=='facebook_enabled'){
				if(event.target.checked){
					if((facebook_id =='') || (facebook_id==0))
						this.connectToFacebook(event.target);
					else{
						self.collection.models[0].set('facebook_enabled', 1);
						self.collection.models[0].save();
					}
				}else{
					event.target.checked = 0;
					self.collection.models[0].set('facebook_enabled', 0);
					self.collection.models[0].save();
				}
			}
		},
		appendNewAccount: function(member){
			
			var self = this;
			var accounts = new Array;
			
			self.$("#login-email").val('');
			self.$("#login-password").val('');
			
			self.hideAddAccountForm();
			//account on/off
			member.switchAccount_status = 1;
			self.buildAccountsHTML(member);

			if(window.localStorage.getItem('accounts'))
				accounts = JSON.parse(window.localStorage.getItem('accounts'));
				
			accounts.push(member);
			
			window.localStorage.setItem('accounts' , JSON.stringify(accounts));
		},
		buildAccountsHTML: function(member){
			var tmpData = {};
			tmpData['email'] = member.email;
			tmpData['switchAccount_status'] = member.switchAccount_status;
			this.$('#accountList').append(accountTemplate(tmpData));
		},
		checkAccountInLocalStorage: function(email){
			
			var accounts = JSON.parse(window.localStorage.getItem('accounts'));
			var acc =  null;
			acc = _.filter(accounts, function(account){ return account.email == email; });

			return (acc.length > 0);
		},
		enableDisable: function(event){
			var name = event.target.name;
			var value = (event.target.checked) ? 1 : 0;
			this.collection.models[0].set(name,value);
			this.collection.models[0].save();
		},
		enableDisableAccount: function(event){
			var email = $(event.target).data('email');
			var value = (event.target.checked) ? 1 : 0;
			var accounts = JSON.parse(window.localStorage.getItem('accounts'));
			
			_.each(accounts, function (account){
				if(account.email == email)
					account.switchAccount_status = value;
			});
			window.localStorage.setItem('accounts' , JSON.stringify(accounts));
		},
		isLoginUser: function(email){
			var user = JSON.parse(window.localStorage.getItem('userInfo' + window.localStorage.getItem('uid')));
			return (user.email == email);
		},
		hideAddAccountForm: function(){
			var self = this;
			self.$('#add-account-form').hide();
			self.$('#add-account-link').show();
		},
		isEmail: function (emailFld) {
			var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return regex.test(emailFld);
		},
		logIn: function(){
			var self = this;

			var emailEL = self.$("#login-email");
			var passwEL = self.$("#login-password");

			var email = emailEL.val();
			var passw = passwEL.val();
			var inCache = self.checkAccountInLocalStorage(email);
			var isLoginUser = self.isLoginUser(email);
			
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
				} else if(inCache){
					alert(config.accountExist);
				}else if(isLoginUser){
					alert(config.sameUser)
				}
				else {
					self.AccountModel.create({
						email: email,
						password: passw,
					},{
						wait: true,
						success: function(model, response) {
							if(response.success) {
								//alert(response.message);
								self.appendNewAccount(response.member);
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
		logOut: function () {
			console.log('signing out')
			window.localStorage.clear();

			Backbone.history.navigate('',{trigger: true});
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
		navigate: function(title,page){
			var self = this;
			var settings = new Array('#general-settings','#profile-settings', '#privacy-settings', '#social-settings', '#support');
			$('#settings-title').html(title);
			
			_.each(settings, function(elem){
				if(page==elem){
					self.$(elem).show();
				}else{
					self.$(elem).hide();
				}
			});
			this.hideAddAccountForm();
		},
		render: function () {
			console.log('render account settings template');
			var tmpData = this.collection.models[0].attributes;
			tmpData['disable_account'] = this.accountProfile.models[0].attributes.status;
			this.$el.append(template(tmpData)).hide();
			this.menu.render();
			return this;
		},
		removeAccount: function(event){
			var email = $(event.target).data('email');
			$(event.target).parents('li').remove();
			
			var accounts = JSON.parse(window.localStorage.getItem('accounts'));
			var accounts = _.filter(accounts, function(acc){ return acc.email !=email });
			
			window.localStorage.setItem('accounts' , JSON.stringify(accounts));
		},
		showAddAccountForm: function(event){
			event.preventDefault();
			self.$('#add-account-form').show();
			self.$('#add-account-link').hide();
		},
		switchPanel: function(event){
			event.preventDefault();
			var target = $(event.target).attr('href');
			var title = $(event.target).data('title');
			
			var children = $(event.target).parent().parent().children();
			_.each(children, function(elem){
				$(elem.children[0]).removeClass('active');
			});
			$(event.target).addClass('active');
			this.navigate(title, target);
		},
		connectToFacebook: function(elem){
			var self = this;
			
			
			openFB.login(function(response){
				if (response.authResponse) {
					//alert(JSON.stringify(response.authResponse));
							openFB.api({
								path: '/me',
								success: function(data) {
									elem.checked = 1;
									var userID = data.id;
									self.collection.models[0].set('facebook_id',userID);
									self.collection.models[0].set('facebook_enabled', 1);
									self.collection.models[0].set('facebook_accesstoken', response.authResponse.token);
									self.collection.models[0].save();
								},
								error: function(){alert(config.facebookError)}});
								
					   } else {
						    self.collection.models[0].set('facebook_enabled', 0);
						    self.collection.models[0].save();
							elem.checked = 0;
					   }
			},{scope:'email,user_birthday,status_update,publish_stream,user_about_me,publish_actions'});
		 },
		 enableDisableMyAccount: function(event){
		 	this.accountProfile.models[0].set('status', 0);
		 	this.accountProfile.models[0].save();
		 },
		 changeProfilePicture: function(e){
		 	e.preventDefault();
		 	new ProfilePicture();
		 },
		 close: function() {
			this.undelegateEvents();
			this.menu.close();
		}
		});
});