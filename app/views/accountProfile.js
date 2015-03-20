define(function (require) {
	"use strict";

		var $					= require('jquery'),
			_ 					= require('underscore'),
			Backbone 			= require('backbone'),
			config 				= require('app/config'),
			storeData			= {},
			uid					= {},
			jqueryCookie		= require('jqueryCookie'),
			iscrollit 			= require('iscrolljs'),
			freewall			= require('freewall'),
			profileBioView 		= require('app/views/profileBio'),
			profileUniverseView = require('app/views/profileUniverse'),
			moreMenuView		= require('app/views/profileMoreMenu'),
			AccountModels		= require('app/models/account'),
			menuView 			= require('app/views/menu'),
			photoItem 			= require('app/views/albumPhotoItem'),
			FeedsView 			= require('app/views/profileFeedsHome'),
			tpl 				= require('text!tpl/profileTemplate.html'),
			template 			= _.template(tpl);

	return Backbone.View.extend({
		el: $('#innerWrapper'),
		initialize: function (param) {
			this.layout = 'list';
			
			var self = this;
			console.log('account profile view');
			$("body").append(this.el);

			var dHTML = $('#innerWrapper').contents();
			$('#contentTemplate').html(dHTML);

			this.menu = new menuView();
			this.uid = (param && param.uid) ? param.uid : window.localStorage.getItem('uid');
			this.lurePhotos = new AccountModels.photoCollection();
						
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
		events: {
			"click #profile-menu": "loadBio",
			"click #universe-menu": "loadUniverse",
			"click #followersCnt": "loadFollowers",
			"click #followingCnt": "loadFollowing",
			"click #lurePhotos": "loadLurePhotos",
			"click #teaserPhotos": "loadTeaserPhotos",
			"click #ellipCnt": "loadMoreMenu",
			"click #profileMyGrid": "toggleView"
		},
		toggleView: function () {
			$('.icon-grid').toggleClass('active-color');
			$('#contentTemplate').removeAttr('style');

			var self = this;

			if(this.layout === 'list'){
				// grid view
				$('#thelist').hide();
				
				this.startFreewall('#freewall');

		  		$('#scroller > div').css('padding', '0px');

				this.layout = 'grid';
			}else{
				// list view
				$('#freewall').empty();

				$('#thelist').fadeIn('slow');
				
				$('#thelist.list .item').removeAttr('style');

		  		$('#scroller > div').css('padding', '12px');
				
				this.layout = 'list';
			}
		},
		startFreewall: function(e) {
			var colour = [
				"rgb(142, 68, 173)",
				"rgb(243, 156, 18)",
				"rgb(211, 84, 0)",
				"rgb(0, 106, 63)",
				"rgb(41, 128, 185)",
				"rgb(192, 57, 43)",
				"rgb(135, 0, 0)",
				"rgb(39, 174, 96)"
			];

			$(".brick").each(function() {
				this.style.backgroundColor =  colour[colour.length * Math.random() << 0];
			});

			var container = document.querySelector(e);
			
			this.freewall = new freewall(container);
			this.freewall.reset({
				selector: '.brick',
				animate: true,
				cellW: 5,
				cellH: 5,
				delay: 50,
				gutterX: 2,
				gutterY: 2,
				rightToLeft: true,
				onResize: function() {
					this.fitWidth();
				}
			});

			this.freewall.fitWidth();

			var html = "";

			$('ul#thelist > li.item').each(function() {
				var size = "size1-1 size2-2".split(" ");
				var img = $(this).find('.img-feeds > img').attr('src');
				var temp = '<div class="cell {size}" style="background: url(' + img + '); background-size:cover;"><span class="text-mid-yellow icon-camera"></span></div>';

				html += temp.replace('{size}', size[size.length * Math.random() << 0])
							.replace('{color}', colour[colour.length * Math.random() << 0]);
			});

			this.freewall.appendBlock(html);

			$(window).trigger("resize");
		},
		loadBio: function () {
			$('#sociallink').show();

			this.$el.find('#profile-menu').addClass('active');
			this.$el.find('#universe-menu').removeClass('active');

			var view = new profileBioView({uid: this.uid});
			this.$el.find('#profileContent').html(view.render().el);
			
		},
		loadUniverse: function () {
			$('#sociallink').hide();

			this.$el.find('#profile-menu').removeClass('active');
			this.$el.find('#universe-menu').addClass('active');

			this.$el.find('#profileContent').html('<div id="universe"></div>');
			this.feedsView 	= new FeedsView({el:$('#universe')});
			this.feedsView.currentList = "myuniverselist";
			this.universeView = new profileUniverseView({uid:this.uid});
			
		},
		loadFollowers: function () {
			Backbone.history.navigate("#account/followers", {trigger: true});
		},
		loadFollowing: function () {
			Backbone.history.navigate("#account/following", {trigger: true});
		},
		loadMoreMenu: function(){
			this.moreMenu.show();
		},
		loadLurePhotos: function(){
			console.log('lure photos');
			var self = this;
			this.lurePhotos.fetch({
				data: {
					member_id: self.uid,
					teaser: 0
				},
				success: function(data){
					self.subViews = _.map(data.models, function(result) { 
						return new photoItem({model: result});
					});
		
					self.$el.find('div#profileContent').empty();
					self.$el.find('div#sociallink').hide();
					
					_.each(self.subViews, function(view) {
						self.$el.find('div#profileContent').append(view.$el[0]);
					}, this);
					self.myscroll.refresh();
				}
			});
		},
		loadTeaserPhotos: function(){
			console.log('teaser photos');
			var self = this;
			this.lurePhotos.fetch({
				data: {
					member_id: self.uid,
					teaser: 1
				},
				success: function(data){
					self.subViews = _.map(data.models, function(result) { 
						return new photoItem({model: result});
					});
		
					self.$el.find('div#profileContent').empty();
					self.$el.find('div#sociallink').hide();
					
					_.each(self.subViews, function(view) {
						self.$el.find('div#profileContent').append(view.$el[0]);
					}, this);
					self.myscroll.refresh();
				}
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
			
			tmpData['url'] = config.url;
			if((userInfo.primary_photo && userInfo.primary_photo.filename !='')){
				tmpData['path'] = (userInfo.primary_photo && userInfo.primary_photo.path) ? userInfo.primary_photo.path : '';
				tmpData['filename'] = userInfo.primary_photo.filename;
			}else{
				tmpData['path'] = config.defaultPrimaryPhotoPath;
				tmpData['filename'] = config.defaultPrimaryPhotoFilename;
			}		
			
			this.$el.append(template(tmpData)).hide();
		
			this.menu.render();
			this.moreMenu = new moreMenuView({uid: this.uid});
			
			var myScroll = new iScroll( 'profileContent' , {
 					useTransition: true,
					vScroll: true,
			});
			this.myscroll = myScroll;
			this.myscroll.refresh();
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
			this.undelegateEvents();
			this.menu.close();
			this.moreMenu.close();
			
			if(this.universeView)
				this.universeView.$el.remove();
		}
	});
});