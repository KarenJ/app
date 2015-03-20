define(function (require) {
	"use strict";

		var $					= require('jquery'),
			_ 					= require('underscore'),
			Backbone 			= require('backbone'),
			config 				= require('app/config'),
			localStorage        = require('localStorage'),
			storeData			= {},
			uid					= {},
			jqueryCookie		= require('jqueryCookie'),
			AccountModels		= require('app/models/account'),
			menuView 		= require('app/views/menu'),
			CountryModels		= require('app/models/country'),
			Profiletpl 			= require('text!tpl/editProfile.html'),
			template 			= _.template(Profiletpl);

	return Backbone.View.extend({
		el: $('#innerWrapper'),
		initialize: function () {
			console.log('initialize edit profile');
			this.AccountModel = new AccountModels.signInCollection();
			this.CountryModel = new CountryModels.CountryCollection();
			
			$('body').append(this.el);

			var dHTML = $('#innerWrapper').contents();
			$('#contentTemplate').html(dHTML);
			
			this.menu = new menuView();
						
			this.render();
			this.postRender();
		},
		buildCountriesHTML: function(countries, country_id){
		
			var html = '<option value=""></option>';
			_.each(countries, function(country){
				 html += '<option value="'+country.country_id+'"';
				 if(country.country_id==country_id)
				 	html += 'selected';
				 html += '>'+country.name+'</option>';
			});
			
			$('#country_id').html(html);
			
		},
		events: {
			"click #btn-editprofile": "saveProfile"
		},
		render: function () {
			var self = this;
			console.log('render account settings template');
			
			var tmpData = this.collection.models[0].attributes;
			self.CountryModel.fetch({
					success: function(data) {
						var countries = data.models[0].attributes;
						self.buildCountriesHTML(countries, self.collection.models[0].get('country_id'));
					}
				});
			this.$el.append(template(tmpData)).hide();
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
		saveProfile: function(event){
			event.preventDefault();
			var self = this;
			
			var inputElements = this.$('#profile input');
			var selectElements = this.$('#profile select');
			var requiredElem = this.$('.required');
			var error = this.validate(requiredElem);
				
			if(error){
				_.each(requiredElem, function(elem){
					if($.inArray(elem.id, error) != -1)
					$(elem).addClass('error');
				});
				alert(config.filloutform);
				return;
			}
			
			_.each(inputElements, function(elem){
				self.collection.models[0].set(elem.name, elem.value);
			});
			_.each(selectElements, function(elem){
				self.collection.models[0].set(elem.name, elem.value);
			});
			
			self.collection.models[0].save();
			alert(config.profileUpdated);
			return;
		},
		validate: function(elements){
			var error = [];
			_.each(elements, function(elem){
				if($(elem).val()=="")
				error.push(elem.id);
			});
			return (error) ? error : false;
		},
		close(){
			this.undelegateEvents();
			this.menu.close();
		}
		});
});