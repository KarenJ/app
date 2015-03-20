define(function (require) {

	"use strict";

	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config				= require('app/config'),
		tpl 				= require('text!tpl/commentItem.html'),
		template 			= _.template(tpl);
		
	return Backbone.View.extend({
		tagName: "li",
		initialize: function (param) {
			this.render();
		},
		events:{
			'click .img-circle': 'profilePreview',
			'click .name': 'profilePreview',
			'click .remove' : 'remove'
		},
		render: function () {
			var tmp = this.model.attributes;
			var tmpData = {};
			
			tmpData['id'] = tmp.id;
			tmpData['member_id'] = tmp.member_id;
			tmpData['fullname'] = tmp.member.firstname + ' ' + tmp.member.lastname; 	
			tmpData['comment'] = tmp.comment;
			tmpData['url'] = config.url;	
			//TO DO: format this
			tmpData['date'] = this.getTime(tmp.date_added);

			tmpData['isPreview'] = tmp.isPreview;
			
			if((tmp.member.primary_photo && tmp.member.primary_photo.filename)){
				tmpData['path'] = (tmp.member.primary_photo && tmp.member.primary_photo.path) ? tmp.member.primary_photo.path : '';
				tmpData['filename'] = (tmp.member.primary_photo && tmp.member.primary_photo.filename) ? tmp.member.primary_photo.filename : '';
			}else{
				tmpData['path'] = config.defaultPrimaryPhotoPath;
				tmpData['filename'] = config.defaultPrimaryPhotoFilename;
			}			
			
			if(window.localStorage.getItem('uid')==tmp.member.member_id)
				tmpData['remove'] = '';
			else
				tmpData['remove'] = 'hide';
			this.$el.append(template(tmpData));
			return this;
		},
		profilePreview : function(){
			var member_id = this.model.get('member').member_id;
			Backbone.history.navigate('#account/profile/' + member_id, {trigger: true});
		},
		remove: function(){
			this.$el.remove();
			this.model.destroy();
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
				time = day + ((day==1) ? ' day ago' : ' days ago');
			}else if(hour !=0){
				time = hour + ((hour==1) ? ' hour ago' : ' hours ago');
			}else if(min >0){
				time = min + ((min==1) ? ' min ago' : ' mins ago');
			}else{
				time = 'just now';
			}
			return time;
		},
		close: function(){
			this.undelegateEvents();
		}
	});
});