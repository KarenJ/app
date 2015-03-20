define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		AccountModels   	= require('app/models/account'),
		tpl 				= require('text!tpl/feedsHashtagItem.html'),
		template 			= _.template(tpl);
		
	return Backbone.View.extend({
		tagName: "li",
		attributes: {
		  class:  "item"
		},
		initialize: function () {
			var self = this;
			this.render();
		},
		render: function () {
			var self = this;

			var tmp = self.model.attributes;
			var tmpData = {};
			
			tmpData['member_id'] = tmp.member.member_id;
			tmpData['fullname'] = tmp.member.firstname + ' ' + tmp.member.lastname;
			tmpData['status_message'] = tmp.status_message;
			tmpData['url'] = config.url;
			
			if((tmp.member.primary_photo && tmp.member.primary_photo.filename)){
				tmpData['path'] = (tmp.member.primary_photo && tmp.member.primary_photo.path) ? tmp.member.primary_photo.path : '';
				tmpData['filename'] = (tmp.member.primary_photo && tmp.member.primary_photo.filename) ? tmp.member.primary_photo.filename : '';
			}else{
				tmpData['path'] = config.defaultPrimaryPhotoPath;
				tmpData['filename'] = config.defaultPrimaryPhotoFilename;
			}
			
			if(tmp.photo && tmp.photo.filename){
				tmpData['feedsImage'] = config.url + tmp.photo.path + tmp.photo.filename;
				tmpData['date_added'] = tmp.photo.date_added;
				tmpData['title'] = tmp.photo.title;
			}else{
				tmpData['feedsImage'] = '';
				tmpData['date_added'] = '';
				tmpData['title'] = '';
			}
			
			tmpData['time'] = self.getTime(tmp.date_added);
			
			this.$el.append(template(tmpData));
			
			return this;
		},
		openContent : function(event){
			var tmp = this.model.attributes;
			Backbone.history.navigate('#preview/photo/' + tmp.photo_id,{trigger: true});
		},
		getTime : function(datefeed){
			//datefeed = parseInt(datefeed);

			var parts = datefeed.split(' ');
			var date = parts[0].split('-');
			var time = parts[1].split(':');
			// new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
			 datefeed = new Date(date[0], date[1]-1, date[2],time[0],time[1],time[2]); // Note: months are 0-based
			  
			var minutes = 1000 * 60;
			var hours = minutes * 60;
			var days = hours * 24;
			var years = days * 365;
			var datenow = new Date().getTime();
			var datefeed = Date.parse(datefeed);
			var t = datenow - datefeed;
			
			var day = Math.round(t / days);
			var hour = Math.round(t/ hours);
			var min = Math.round(t / minutes);
			
			var time = null;
			if((day !=0) && (day > 30))
				time = new Date(datefeed).toDateString();
			else if((day !=0) && (day < 30)){
				time = day + ((day==1) ? ' day' : ' days');
			}else if(hour !=0){
				time = hour + ((hour==1) ? ' hour' : ' hours');
			}else if(min !=0){
				time = min + ((min==1) ? ' min' : ' mins');
			}else{
				time = 'just now';
			}
			return time;
		}
	});
});