define(function (require) {
	"use strict";

	var $        		= require('jquery'),
		_        		= require('underscore'),
		Backbone		= require('backbone'),
		config 			= require('app/config'),
		localStorage	= require('localStorage'),
		storeData 		= {},
		uid				= {},
		jqueryCookie	= require('jqueryCookie'),
		postPhotoView 	= require('app/views/postPhoto'),
		tplMenu      	= require('text!tpl/menu.html'),
		mainTemplate 	= _.template(tplMenu);
		
		
	return Backbone.View.extend({
		el: $('#innerWrapper'),
		initialize: function () {
			console.log('build menu');
			event_bus.on('closeMenu', this.close, this);
		},
		events: {
			'click #cameraNav': 'loadCamera'
			//'click #cameraNav': 'loadPostPhoto'
		},
		render: function () {
			
			$('#innerWrapper').append(mainTemplate());
			
			return this;
		},
		loadPostPhoto: function(){
			this.postPhoto = new postPhotoView();
			this.postPhoto.render();
			this.postPhoto.show();
		},
		loadCamera: function () {

			if (!navigator.camera) {
				alert("Camera" + config.apiNotSupported, config.errorType);
				return;
			}						
			var options =   {
								quality: 50,
								destinationType: Camera.DestinationType.FILE_URI,
								sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Album
								encodingType: 0     // 0=JPG 1=PNG
							};
			var self= this;
			navigator.camera.getPicture( function(result){
				self.cameraSuccess(result, self);
			}, this.cameraFailed ,options);
			
			return false;
		},
		cameraSuccess: function(imageUri, self){
			this.postPhoto = new postPhotoView();
			self.postPhoto.render(imageUri);
			self.postPhoto.show();
		},
		cameraFailed: function(message){
			alert('Failed because: ' + message);
		},
		close: function(){
			//alert('undelegate events in menu');
			this.undelegateEvents();
			//this.postPhoto.close();
			//this.$el.find('#navLoggedIn').remove();
		}
	});
});