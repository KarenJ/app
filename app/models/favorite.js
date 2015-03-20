define(function (require) {
	"use strict";

	var $			= require('jquery'),
		Backbone	= require('backbone'),
		localStorage = require('localStorage'),
		config 		= require('app/config'),
			   
		Favorite	= Backbone.Model.extend({
			
			urlRoot: config.apiUrl + 'favorites/favorite',
			idAttribute: 'favorite_id',
			parse: function(response) {
				if(response) {

					return response;
				} else {
					console.log('Favorite' + config.responseFailed)
				}
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
			
		}),
		FavoriteCollection = Backbone.Collection.extend({

			model: Favorite,
			idAttribute: 'favorite_id',
			url: config.apiUrl + 'favorites/favorite',
			parse: function(response) {
				if(response.success) {
					window.localStorage.setItem('favorite'+window.localStorage.getItem('uid'),JSON.stringify(response.favorite));
					return response.favorite;
				} else {
					console.log('Favorites: ' + config.responseFailed)
				}
			}
		}),
		MemberFavorite	= Backbone.Model.extend({
			
			urlRoot: config.apiUrl + 'favorites/favorite',
			idAttribute: 'favorite_id',
			parse: function(response) {
				if(response) {

					return response;
				} else {
					console.log('Favorite' + config.responseFailed)
				}
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
			
		}),
		MemberFavoriteCollection = Backbone.Collection.extend({

			model: Favorite,
			idAttribute: 'favorite_id',
			url: config.apiUrl + 'favorites/favorite',
			parse: function(response) {
				if(response.success) {
					return response.favorite;
				} else {
					console.log('Favorites: ' + config.responseFailed)
				}
			}
		});
	return {
		Favorite: Favorite,
		FavoriteCollection: FavoriteCollection,
		MemberFavorite: MemberFavorite,
		MemberFavoriteCollection: MemberFavoriteCollection
	};
});