define(function (require) {
	"use strict";

	var SubRoute 		= require('backbonesubroute'),
		config			= require('app/config'),
		jqueryCookie	= require('jqueryCookie'),
		AccountModels	= require('app/models/account'),
		UserTagModels	= require('app/models/userTag'),
		$content 		= $('#contentTemplate');
		
	return Backbone.SubRoute.extend({
		routes: {
			'': 'accountLogin',
			'login': 'accountLogin',
			'signup': 'accountSignUp',
			'info/:e/:p': 'accountInfo',
			'profile': 'accountProfile',
			'profile/:id': 'accountProfile',
			'profileLogin': 'accountProfileLogin',
			'album': 'accountAlbum',
			'settings': 'accountSettings',
			'toa': 'accountTOA',
			'socialnetwork': 'accountSocial',
			'logout': 'accountLogout',
			'editprofile' : 'profile',
			'changepassword' : 'changePassword',
			'photo/:id': 'accountPhotos',
			'followers': 'followers',
			'following': 'following',
			'approval': 'followerRequest',
			'vip': 'vip',
			'blocked': 'blocked',
			'tag': 'tagRequest',
			'forgotPassword': 'forgotPassword'
		},
		initialize: function() {
			console.log("initialize account subrouters");
			this.uid = window.localStorage.getItem('uid');
		},
		loadView : function(view) {
			this.view && (this.view.close ? this.view.close() : this.view.remove());
			this.view = view;
			//event_bus.trigger('setView', );
		},
		checkLogged: function () {
			var uid = window.localStorage.getItem('uid');

			if(uid) {
				this.uid = uid;
				Backbone.history.navigate("#feeds", {trigger: true});
			}
		},
		closeMenu: function(){
			//If switch router, make sure all the menu are close, revise this if needed
			//if(!this.view)
				event_bus.trigger('closeMenu');
		},
		accountLogin: function () {
			console.log("account login")

			var self = this;

			self.checkLogged();

			require(['app/views/accountLogin','app/models/account'], function (loginView, AccountModels) {
				self.loadView(new loginView({
					model: AccountModels
				}));
			});
		},
		accountSignUp: function () {
			console.log("account sign-up")
			
			var self = this;

			self.checkLogged();
									
			require(['app/views/accountSignUp','app/models/account'], function (signupView, AccountModels) {
				self.closeMenu();
				self.loadView(new signupView({
					model: AccountModels
				}));
			});
		},
		accountInfo: function (email,pass) {
			console.log("account sign-up")

			var self = this;

			var predata = {};

			predata.email = email;
			predata.pass = pass;

			require(['app/views/accountInfo', 'app/models/countries'], function (infoView, CountryModels) {
				self.Countries = new CountryModels.Countries();

				self.Countries.fetch({
					success: function(data) {
						self.loadView(new infoView({
							collection: data,
							model: predata
						}));
					}
				});
			});
		},
		accountProfile: function (id) {
			console.log('account profile')

			//for testing
			if(id){
				this.uid = id;
				window.localStorage.setItem('preview_uid', this.uid);
				this.accountProfile = new AccountModels.profileCollection();
				
				var self = this;
				this.accountProfile.fetch({
					data: {member_id: self.uid},
					success: function(data) {
						//window.localStorage.setItem('preview_uid', self.uid);
						window.localStorage.setItem('userInfo'+self.uid, JSON.stringify(data.get(self.uid).attributes));
						
						require(['app/views/accountProfile'], function (profileView) {
							self.closeMenu();
							self.loadView(new profileView({uid: self.uid}));
						});
						}
				});
			}else{
				this.uid = window.localStorage.getItem('uid');
				var self = this;
				require(['app/views/accountProfile'], function (profileView) {
					self.closeMenu();
					self.loadView(new profileView({uid: self.uid}));
				});
			}
		},
		accountProfileLogin: function () {
			console.log('account profile login')

			var self = this;

			self.checkLogged();

			require(['app/views/accountProfileLogin'], function (profileViewLogin) {
				self.closeMenu();
				self.loadView(new profileViewLogin());
			});
		},
		accountAlbum: function () {
			console.log('account album')

			var self = this;

			self.accountAlbum = new AccountModels.albumCollection();
									
			require(['app/views/accountAlbum'], function (accountAlbum) {
				self.accountAlbum.fetch({
					data: {member_id: self.uid},
					success: function(data) {
						self.closeMenu();
						self.loadView(new accountAlbum({
							collection: data,
						}));
					}
				});
			});
		},
		accountTOA: function () {
			console.log("account toa")
									
			var self = this;
									
			require(['app/views/accountToa'], function (toaView) {
				self.closeMenu();
				self.loadView(new toaView());
			});
		},
		accountSettings: function () {
			console.log('account settings');

			var self = this;

			self.accountSettings = new AccountModels.settingsCollection();
			
			require(['app/views/accountSettings'], function (settings) {
				
				self.accountSettings.fetch({
					data: {member_id: self.uid},
					success: function(data) {
						self.closeMenu();
						self.loadView(new settings({
							collection: data
						}));
					}
				});
			});
		},
		accountSocial: function () {
			console.log("account social")
									
			var self = this;
									
			require(['app/views/accountSocial'], function (socialInviteView) {
				self.closeMenu();
				self.loadView(new socialInviteView());
			});
		},
		accountLogout: function () {
			var self = this;

			window.localStorage.removeItem('uid');

			Backbone.history.navigate("#feeds", {trigger: true});
		},
		profile: function(id){
			var self = this;
			self.accountProfile = new AccountModels.profileCollection();
			
			require(['app/views/editProfile'], function (editProfile) {
				
				self.accountProfile.fetch({
					data: {member_id: self.uid},
					success: function(data) {
						new editProfile({
							collection: data
						});
					}
				});
			});
		},
		changePassword: function(){
	
			require(['app/views/changePassword'], function (changePassword) {
				new changePassword();
			});
		},
		accountPhotos: function (album_id) {
			console.log('account Photos')

			var self = this;

			self.albumPhoto = new AccountModels.photoCollection();
									
			require(['app/views/albumPhoto'], function (albumPhoto) {
				self.albumPhoto.fetch({
					data: {album_id: album_id},
					success: function(data) {
						new albumPhoto({
							collection: data,
						});
					}
				});
			});
		},
		followers: function () {
			console.log('list of followers')

			var self = this;

			self.followers = new AccountModels.followersCollection();
									
			require(['app/views/followersList'], function (followers) {
				self.followers.fetch({
					data: {member_id: self.uid,
					is_pending: 0,
					viewer_member_id: window.localStorage.getItem('uid')
					},
					success: function(data) {
						self.closeMenu();
						self.loadView(new followers({
							collection: data,
							uid: self.uid
						}));
					}
				});
			});
		},
		following: function () {
			console.log('list of following')

			var self = this;

			self.following = new AccountModels.followingCollection();
									
			require(['app/views/followingList'], function (following) {
				self.following.fetch({
					data: {member_id: self.uid,
						is_pending: 0,
						viewer_member_id: window.localStorage.getItem('uid')
					},
					success: function(data) {
						self.closeMenu();
						self.loadView(new following({
							collection: data,
							uid:self.uid
						}));
					}
				});
			});
		},
		followerRequest: function(){
			console.log('list of followers waiting for approval')

			var self = this;

			self.followers = new AccountModels.followersCollection();
									
			require(['app/views/FollowerRequestList'], function (requestList) {
				self.followers.fetch({
					data: {member_id: self.uid,
					is_pending: 1
					},
					success: function(data) {
						self.closeMenu();
						self.loadView(new requestList({
							collection: data,
						}));
					}
				});
			});
		},
		tagRequest: function(){
			console.log('list of tags waiting for approval')

			var self = this;

			self.userTag = new UserTagModels.approvalTagCollection();
									
			require(['app/views/tagRequestList'], function (requestList) {
				self.userTag.fetch({
					data: {member_id: self.uid
					},
					success: function(data) {
						self.closeMenu();
						self.loadView(new requestList({
							collection: data,
						}));
					}
				});
			});
		},
		vip: function(){
			console.log('list of VIPs')

			var self = this;

			self.vip = new AccountModels.followersCollection();
									
			require(['app/views/vipList'], function (vipList) {
				self.vip.fetch({
					data: {member_id: self.uid,
					is_vip: 1
					},
					success: function(data) {
						self.closeMenu();
						self.loadView(new vipList({
							collection: data,
						}));
					}
				});
			});
		},
		blocked: function(){
			console.log('list of blocked members')

			var self = this;

			self.blocked = new AccountModels.blockedCollection();
									
			require(['app/views/blockedList'], function (blockedList) {
				self.blocked.fetch({
					data: {member_id: self.uid
					},
					success: function(data) {
						self.loadView(new blockedList({
							collection: data,
						}));
					}
				});
			});
		},
		forgotPassword: function(){
			var self = this;
			require(['app/views/forgotPassword'], function (forgotPassword) {
						self.loadView(new forgotPassword());
				});
		}
	});
});
