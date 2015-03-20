define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		iscrollit 			= require('iscrolljs'),
		AccountModels		= require('app/models/account'),
		CommentModel		= require('app/models/comment'),
		menuView 			= require('app/views/menu'),
		tpl 				= require('text!tpl/commentList.html'),
		DefaultItem 	    = require('app/views/commentItem'),
		template 			= _.template(tpl);
		
		
	return Backbone.View.extend({
		el: $('#innerWrapper'),
		isPreview: false,
		initialize: function (param) {
			
			var self = this;
			this.photo_id = param.photo_id;
			this.uid = (param.uid) ? param.uid : window.localStorage.getItem('uid');
			this.isPreview = !(param.uid == window.localStorage.getItem('uid'));
			this.commentModel = new CommentModel.commentCollection();
			this.menu = new menuView();
			this.render();
			this.postRender();

		},
		events: {
			'click #button-comment': 'postComment'
		},
		render: function () {
			var self = this;
			var tmpData = {};

			tmpData['profile_id'] = (this.isPreview) ? '/'+this.uid : '';
			if(!window.localStorage.getItem('uid'))
				tmpData['form'] = 'hide';
			else 
				tmpData['form'] = '';
				
			this.$el.html(template(tmpData));

			var myScroll = new iScroll( 'comments' , {
 					useTransition: true,
					vScroll: true,
			});
			this.myscroll = myScroll;
			
			this.subViews = _.map(this.collection.models, function(result) { 
				return new DefaultItem({model: result});
			});

			_.each(this.subViews, function(view) {
				this.$el.find('ul#commentList').append(view.$el[0]);
			}, this);
			
			this.myscroll.refresh();
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
		postComment: function(event){
			event.preventDefault();
			var comment = this.$el.find('#comment').val();
			this.$el.find('#comment').val('');
			var self = this;
			this.commentModel.create({
				comment: comment,
				member_id: window.localStorage.getItem('uid'),
				photo_id: self.photo_id
				}, {
					success: function(result){
					self.appendToList(result);
				}});
		},
		appendToList: function(model){
			 console.log(model);
			 //add to subview
			 this.collection.add(model);
			 var view = new DefaultItem({model: model});
			 this.$el.find('ul#commentList').append(view.$el[0]);
		},
		close: function() {
			_.each(this.subViews, function(view) { view.remove(); });
			this.menu.close();
			this.undelegateEvents();
		}
	});
});