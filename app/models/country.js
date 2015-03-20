define(function (require) {
	"use strict";

	var $			= require('jquery'),
		Backbone	= require('backbone'),
		localStorage = require('localStorage'),
		config 		= require('app/config'),
	   
		Country	= Backbone.Model.extend({
			
			urlRoot: config.apiUrl + 'countries/country',
			idAttribute: 'country_id',
			parse: function(response) {
				if(response.success) {
					window.localStorage.setItem('countryList',JSON.stringify(response.countries));
					return response.countries;
				} else {
					console.log('countries' + config.responseFailed)
				}
			},
			destroy: function (options) {
				var opts = _.extend({url: this.urlRoot + '/' + this.id}, options || {});
				return Backbone.Model.prototype.destroy.call(this, opts);
			}
			
		}),
		CountryCollection = Backbone.Collection.extend({

			model: Country,
			idAttribute: 'country_id',
			url: config.apiUrl + 'countries/country',
			parse: function(response) {
				if(response.success) {
					window.localStorage.setItem('countryList',JSON.stringify(response.countries));
					return response;
				} else {
					console.log('Countries: ' + config.responseFailed)
				}
			}
		});
	return {
		Country: Country,
		CountryCollection: CountryCollection
	};
});