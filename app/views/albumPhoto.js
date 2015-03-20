define(function (require) {
	"use strict";

		var $					= require('jquery'),
			_ 					= require('underscore'),
			Backbone 			= require('backbone'),
			config 				= require('app/config'),
			storeData			= {},
			uid					= {},
			jqueryCookie		= require('jqueryCookie'),
			
			AccountModels		= require('app/models/account'),
			photoItemView 		= require('app/views/albumPhotoItem'),
			photoListView 		= require('app/views/albumPhotoList'),
			phototpl 			= require('text!tpl/albumPhotoTemplate.html'),
			photoItemtpl		= require('text!tpl/albumPhotoItem.html'),
			albumPhotoItem 		= require('app/views/albumPhotoItem'),
			template 			= _.template(phototpl);

	return Backbone.View.extend({
		el: $('#innerWrapper'),
		initialize: function () {
			console.log('initialize account album');
			var self = this;

			$("body").append(this.el);

			var dHTML = $('#innerWrapper').contents();
			$('#contentTemplate').html(dHTML);

			this.uid = window.localStorage.getItem('uid');

			this.lureCount 		= new AccountModels.lureCount();
			this.teaserCount 	= new AccountModels.teaserCount();
			this.earningCount 	= new AccountModels.earningCount();
			this.followingCount = new AccountModels.followingCount();
			this.followerCount 	= new AccountModels.followerCount();
			
			$.when(
				this.lureCount.fetch({
					reset: true,
					data: {member_id: this.uid,teaser:0}
				}),
				this.teaserCount.fetch({
					reset: true,
					data: {member_id: this.uid,teaser:1}
				}),
				this.earningCount.fetch({
					reset: true,
					data: {member_id: this.uid}
				}),
				this.followingCount.fetch({
					reset: true,
					data: {member_id: this.uid}
				}),
				this.followerCount.fetch({
					reset: true,
					data: {member_id: this.uid}
				})
			).done(function () {
				self.render().postRender();
			});
		},
		
		render: function () {
			var self 			= this,
				tmpData 		= {},
				userInfo 		= JSON.parse(unescape(window.localStorage.getItem('userInfo' + this.uid))),
				fullname,
				bio,
				lureCount		= 0,
				teaserCount		= 0,
				earningCount	= 0,
				followingCount	= 0,
				followerCount 	= 0;

			if(userInfo.firstname != null) {
				fullname = userInfo.firstname;
			}

			if(userInfo.lastname != null) {
				fullname += ' ' + userInfo.lastname;
			}

			if(userInfo.bio != null) {
				bio = userInfo.bio;
			}

			if(this.lureCount.attributes.no_of_photos != undefined) {
				lureCount = this.lureCount.attributes.no_of_photos;
			}

			if(this.teaserCount.attributes.no_of_photos != undefined) {
				teaserCount = this.teaserCount.attributes.no_of_photos;
			}

			if(this.earningCount.attributes.amount != null) {
				earningCount = this.earningCount.attributes.amount;
			}

			if(this.followingCount.attributes.total_following != null) {
				followingCount = this.followingCount.attributes.total_following;
			}

			if(this.followerCount.attributes.total_followers != null) {
				followerCount = this.followerCount.attributes.total_followers;
			}

			tmpData['fullname'] = fullname;
			tmpData['bio'] 		= bio;
			tmpData['lure'] 	= lureCount;
			tmpData['teaser']	= teaserCount;
			tmpData['earning']	= earningCount;
			tmpData['following']= followingCount;
			tmpData['follower']	= followerCount;
			
			this.$el.append(template(tmpData)).hide();
			
			
			this.subViews = _.map(this.collection.models, function (photoItems){
				return new albumPhotoItem({model: photoItems});
			});
			
			var self = this;
			_.each(self.subViews, function (view) {
				self.$el.find('#photoContent').append(view.$el[0]);
			}, self);

			return this;
		},
		postRender: function () {
			
			$('.gradient').hide();
			
			$('#innerWrapper').removeClass('toClean').addClass('toContent padding-top-10');
			$('#contentTemplate').removeClass('toContent').addClass('toClean');

			$('#innerWrapper').addClass('onTop');

			$('#innerWrapper, .gradient').fadeIn('fast', function() {
				$('#contentTemplate').addClass('blurred');
			});
		},
		switchAccount: function () {
			alert(config.soon)
		},
		close: function() {
			_.each(this.subViews, function(view) { view.remove(); });
			this.remove();
		}
	});
});