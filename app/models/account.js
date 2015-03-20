define(function (require) {
	"use strict";

	var $			= require('jquery'),
		Backbone	= require('backbone'),
		localStorage = require('localStorage'),
		config 		= require('app/config'),
	   
		LogIn	= Backbone.Model.extend({
			urlRoot: config.apiUrl + 'members/sign_in',
			idAttribute: 'id',
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),

		LogInCollection = Backbone.Collection.extend({

			model: LogIn,

			url: config.apiUrl + 'members/sign_in',
			parse: function(response) {
				if(response.attributes.success) {
					window.localStorage.setItem('uid',response.attributes.member.member_id);
					window.localStorage.setItem('userInfo' + response.attributes.member.member_id,JSON.stringify(response.attributes.member));
					this.uid = window.localStorage.getItem('uid');
					return response;
				} else {
					console.log('Log-in ' + config.responseFailed)
				}
			}
		}),

		memberProfilePict = Backbone.Model.extend({
			// url: config.apiUrl + 'members/member',
			initialize: function (models, options) {
				this.id = options.member_id;
			},
			url: function(){
				return config.apiUrl + 'members/profile_picture?member_id=' + this.id;
			},
			parse: function(response) {
				if(response.success != undefined) {
					// window.localStorage.setItem('uid',response.attributes.member.member_id);
					// window.localStorage.setItem('userInfo' + response.attributes.member.member_id,JSON.stringify(response.attributes.member));

					return response;
				} else {
					console.log('Log-in ' + config.responseFailed)
				}
			}
		}),

		validateEmail = Backbone.Model.extend({
			urlRoot: config.apiUrl + 'members/validate_email',
			idAttribute: 'member_id',
			initialize: function () {
				console.log('validate email' + config.initial)
			},
			parse: function(response) {
				return response;
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),
	   
	   userRegistration	= Backbone.Model.extend({
			urlRoot: config.apiUrl + 'members/member',
			idAttribute: 'member_id',
			initialize: function () {
				console.log('user registration' + config.initial)
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),

		userRegistrationCollection = Backbone.Collection.extend({

			model: userRegistration,

			url: config.apiUrl + 'members/member',
			parse: function(response) {
				if(response.success) {
					this.responseData = response.members;
					return this.responseData;
				} else {
					console.log('user registration' + config.responseFailed)
				}
			}
		}),
		lureCount = Backbone.Model.extend({
			urlRoot: config.apiUrl + 'photos/count',
			idAttribute: 'member_id',
			initialize: function () {
				console.log('lure photos count' + config.initial)
			},
			parse: function(response) {
				if(response.success) {
					return response;
				} else {
					console.log('lure photos count' + config.responseFailed)
				}
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),
		teaserCount = Backbone.Model.extend({
			urlRoot: config.apiUrl + 'photos/count',
			idAttribute: 'id',
			initialize: function () {
				console.log('teaser photos count' + config.initial)
			},
			parse: function(response) {
				if(response.success) {
					return response;
				} else {
					console.log('teaser photos count' + config.responseFailed)
				}
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),
		earningCount = Backbone.Model.extend({
			urlRoot: config.apiUrl + 'member_revenue/total_earning',
			idAttribute: 'id',
			initialize: function () {
				console.log('earning count' + config.initial)
			},
			parse: function(response) {
				if(response.success) {
					return response.total_earning;
				} else {
					console.log('earning count' + config.responseFailed)
				}
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),
		followingCount = Backbone.Model.extend({
			urlRoot: config.apiUrl + 'friends/total_following',
			idAttribute: 'id',
			initialize: function () {
				console.log('following count' + config.initial)
			},
			parse: function(response) {
				if(response.success) {
					return response;
				} else {
					console.log('earning count' + config.responseFailed)
				}
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),
		followerCount = Backbone.Model.extend({
			urlRoot: config.apiUrl + 'friends/total_followers',
			idAttribute: 'id',
			initialize: function () {
				console.log('follower count' + config.initial)
			},
			parse: function(response) {
				if(response.success) {
					return response;
				} else {
					console.log('followers count' + config.responseFailed)
				}
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),
		/*albumList = Backbone.Model.extend({
			urlRoot: config.apiUrl + 'albums/album',
			idAttribute: 'member_id',
			initialize: function () {
				console.log('album count' + config.initial)
			},
			parse: function(response) {
				if(response.success) {
					return response;
				} else {
					console.log('album count' + config.responseFailed)
				}
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		});
*/
		albumList	= Backbone.Model.extend({
			urlRoot: config.apiUrl + 'albums/album',
			idAttribute: 'member_id',
			parse: function(response) {
				if(response.success) {
					window.localStorage.setItem('albumList' + window.localStorage.getItem('uid'),JSON.stringify(response.albums));
					return response.albums;
				} else {
					console.log('album' + config.responseFailed)
				}
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),

		albumCollection = Backbone.Collection.extend({

			model: albumList,
			idAttribute: 'member_id',
			url: config.apiUrl + 'albums/album',
			parse: function(response) {
				// console.log(response);
				if(response.success) {
					// window.localStorage.setItem('uid',response.attributes.member.member_id);
					window.localStorage.setItem('albumList' + window.localStorage.getItem('uid'),JSON.stringify(response.albums));
					return response;
				} else {
					console.log('Album: ' + config.responseFailed)
				}
			}
		}),
		
		settingsList	= Backbone.Model.extend({
			
			urlRoot: config.apiUrl + 'member_settings/settings',
			idAttribute: 'member_id',
			parse: function(response) {
				if(response.success) {
					window.localStorage.setItem('settingsList' + window.localStorage.getItem('uid'),JSON.stringify(response.settings));
					return response.settings;
				} else {
					console.log('Settings' + config.responseFailed)
				}
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
			
		}),
		settingsCollection = Backbone.Collection.extend({

			model: settingsList,
			idAttribute: 'member_id',
			url: config.apiUrl + 'member_settings/settings',
			parse: function(response) {
				if(response.success) {
					window.localStorage.setItem('settingsList' + window.localStorage.getItem('uid'),JSON.stringify(response.settings));
					return response;
				} else {
					console.log('Settings: ' + config.responseFailed)
				}
			}
		}),
	
		signInCollection = Backbone.Collection.extend({
			//Use for the add account signin, do not set the uid in localstorage
			model: LogIn,

			url: config.apiUrl + 'members/sign_in',
			parse: function(response) {
				if(response.attributes.success) {
					return response;
				} else {
					console.log('Sign-in ' + config.responseFailed)
				}
			}
		}),
		follow	= Backbone.Model.extend({
			urlRoot: config.apiUrl + 'friends/following',
			idAttribute: 'id',
			initialize: function () {
				console.log('follow a member' + config.initial)
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),

		followCollection = Backbone.Collection.extend({

			model: follow,

			url: config.apiUrl + 'friends/is_following',
			parse: function(response) {
				if(response.success) {
					//this.responseData = response.members;
					return this.response.message;
				} else {
					console.log('follow member' + config.responseFailed)
				}
			}
		}),
		followersList	= Backbone.Model.extend({
			urlRoot: config.apiUrl + 'friends/followers',
			idAttribute: 'id',
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),

		followersCollection = Backbone.Collection.extend({

			model: followersList,
			url: config.apiUrl + 'friends/followers',
			parse: function(response) {
				// console.log(response);
				if(response.success) {
					// window.localStorage.setItem('uid',response.attributes.member.member_id);
					window.localStorage.setItem('followersList' + window.localStorage.getItem('uid'),JSON.stringify(response.followers));
					return response.followers;
				} else {
					console.log('followersList: ' + config.responseFailed)
				}
			}
		}),
		followingList	= Backbone.Model.extend({
			urlRoot: config.apiUrl + 'friends/following',
			idAttribute: 'id',
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),

		followingCollection = Backbone.Collection.extend({

			model: followingList,
			url: config.apiUrl + 'friends/following',
			parse: function(response) {
				// console.log(response);
				if(response.success) {
					// window.localStorage.setItem('uid',response.attributes.member.member_id);
					window.localStorage.setItem('followingList' + window.localStorage.getItem('uid'),JSON.stringify(response.following));
					return response.following;
				} else {
					console.log('followingList: ' + config.responseFailed);
				}
			}
		}),

		profileList	= Backbone.Model.extend({
			
			urlRoot: config.apiUrl + 'members/member',
			idAttribute: 'member_id',
			parse: function(response) {
				if(response.success) {
					window.localStorage.setItem('userinfo' + window.localStorage.getItem('uid'),JSON.stringify(response.member));
					return response.member;
				} else {
					console.log('Member' + config.responseFailed)
				}
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),

		profileCollection = Backbone.Collection.extend({
			model: profileList,
			idAttribute: 'member_id',
			url: config.apiUrl + 'members/member',
			parse: function(response) {
				if(response.success) {
					return response;
				} else {
					console.log('Member: ' + config.responseFailed)
				}
			}
		}),
		changePasswordModel = Backbone.Model.extend({
			urlRoot: config.apiUrl + 'members/change_password',
			idAttribute: 'id',
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),
		changePasswordCollection = Backbone.Collection.extend({

			model: changePasswordModel,

			url: config.apiUrl + 'members/change_password',
			parse: function(response) {
				if(response.attributes.success) {
					return response;
				} else {
					console.log(response.attributes.message)
				}
			}
		}),
		photoList	= Backbone.Model.extend({
			urlRoot: config.apiUrl + 'photos/photo',
			idAttribute: 'photo_id',
			parse: function(response) {
					//window.localStorage.setItem('albumPhotos' + response.photos[0].album_id,JSON.stringify(response.photos));
				return response;
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),

		photoCollection = Backbone.Collection.extend({

			model: photoList,
			idAttribute: 'photo_id',
			url: config.apiUrl + 'photos/photo',
			parse: function(response) {
				// console.log(response);
				if(response.success) {
					// window.localStorage.setItem('uid',response.attributes.member.member_id);
					//window.localStorage.setItem('albumList' + window.localStorage.getItem('uid'),JSON.stringify(response.photos));
					return response.photos;
				} else {
					console.log('Photos: ' + config.responseFailed)
				}
			}
		}),
		blockedList	= Backbone.Model.extend({
			urlRoot: config.apiUrl + 'blocked/block',
			idAttribute: 'blocked_id',
			parse: function(response) {
					return response;
			},
			
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),

		blockedCollection = Backbone.Collection.extend({

			model: blockedList,

			url: config.apiUrl + 'blocked/block',
			parse: function(response) {
				if(response.success) {
					return response.blocked;
				} else {
					console.log('Blocked ' + config.responseFailed)
				}
			}
		}),
		report	= Backbone.Model.extend({
			urlRoot: config.apiUrl + 'reported_abused/report',
			idAttribute: 'report_id',
			parse: function(response) {
					return response;
			},
			
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
		}),

		reportCollection = Backbone.Collection.extend({

			model: report,

			url: config.apiUrl + 'reported_abused/report',
			parse: function(response) {
				if(response.success) {
					return response;
				} else {
					console.log('Blocked ' + config.responseFailed)
				}
			}
		})
		;
	return {
		LogIn: LogIn,
		LogInCollection: LogInCollection,
		userRegistration: userRegistration,
		userRegistrationCollection: userRegistrationCollection,
		validateEmail: validateEmail,
		lureCount: lureCount,
		teaserCount: teaserCount,
		earningCount: earningCount,
		followingCount: followingCount,
		followerCount: followerCount,
		albumList: albumList,
		albumCollection: albumCollection,
		settingsList: settingsList,
		settingsCollection: settingsCollection,
		signInCollection: signInCollection,
		follow: follow,
		followCollection: followCollection,
		followersList: followersList,
		followersCollection: followersCollection,
		followingList: followingList,
		followingCollection: followingCollection,
		profileList: profileList,
		profileCollection: profileCollection,
		changePasswordModel: changePasswordModel,
		changePasswordCollection: changePasswordCollection,
		memberProfilePict: memberProfilePict,
		photoList: photoList,
		photoCollection: photoCollection,
		blockedList: blockedList,
		blockedCollection: blockedCollection,
		report: report,
		reportCollection: reportCollection
	};
	
});