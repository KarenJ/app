define(function (require) {
	"use strict";

	var $			= require('jquery'),
		Backbone	= require('backbone'),
		localStorage = require('localStorage'),
		config 		= require('app/config'),
			   
		comment	= Backbone.Model.extend({
			
			urlRoot: config.apiUrl + 'comments/comment',
			idAttribute: 'comment_id',
			parse: function(response) {
				if(response) {

					return response;
				} else {
					console.log('Comment' + config.responseFailed)
				}
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
			
		}),
		commentCollection = Backbone.Collection.extend({

			model: comment,
			idAttribute: 'tag_id',
			url: config.apiUrl + 'comments/comment',
			parse: function(response) {
				if(response.success) {
					return response.comments;
				} else {
					console.log('Comment: ' + config.responseFailed)
				}
			}
		});
	return {
		comment: comment,
		commentCollection: commentCollection
	};
});