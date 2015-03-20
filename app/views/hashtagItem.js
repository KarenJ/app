define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tpl 				= require('text!tpl/hashtagItem.html'),
		template 			= _.template(tpl);
		
	return Backbone.View.extend({
		tagName: "li",
		initialize: function (param) {
			this.followingCollection = param.followingCollection;
			this.uid = window.localStorage.getItem('uid');
			this.render();
		},
		events:{
			'click .img-feeds':'openContent',
			'click .img-circle': 'profilePreview',
			'click .name': 'profilePreview',
			'click .search-add-icon': 'follow',
			'click .unfollow': 'unfollow',
			'click .more':'hashtagFeeds'
		},
		render: function () {
			var tmp = this.model.attributes;
			var tmpData = {};
			tmpData['hashtag'] = tmp.hashtag;
			tmpData['count'] = tmp.count;
			
			this.$el.append(template(tmpData));
			return this;
		},
		openContent : function(){
			var tmp = this.model.attributes;
			Backbone.history.navigate('#preview/photo/' + tmp.photo_id,{trigger: true});
		},
		profilePreview : function(){
			var member_id = this.model.get('member').member_id;
			Backbone.history.navigate('#account/profile/' + member_id,{trigger: true});
		},
		hashtagFeeds: function(){
			var hashtag =  this.model.attributes.hashtag;
			hashtag = hashtag.replace('#', '');
			Backbone.history.navigate('#search/hashtag/' + hashtag,{trigger: true});
		}
	});
});