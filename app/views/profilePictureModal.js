define(function (require) {
	"use strict";

		var $					= require('jquery'),
			_ 					= require('underscore'),
			Backbone 			= require('backbone'),
			config 				= require('app/config'),
			storeData			= {},
			uid					= {},
			jqueryCookie		= require('jqueryCookie'),
			AccountModels		= require('app/models/account'),
			ProfilePictureTpl	 = require('text!tpl/profilePictureAction.html'),
			mainTemplate		= _.template(ProfilePictureTpl);
			

	return Backbone.View.extend({
		//el: $('body'),
		id: "profilePictureModal",
		isBuilt : false,
		modalContainer: null,
		initialize: function (param) {
			console.log('change profile picture');
			this.render();
		},
		events: {
			"click #camera": "camera",
			"click #folder": "folder"
		},
		render: function () {
			this.photoModel = new AccountModels.photoCollection();
			var self = this;
				this.$el.append(mainTemplate());
				$('#innerWrapper').after(this.$el);
				
				this.isBuilt = true;
				this.modalContainer = this.$el.find('#profilePictureModal');
				this.modalContainer.modal({
				    backdrop: 'static',
				    keyboard: false,
				    show:true
				});
			return this;
		},
		show: function(){
			this.modalContainer.modal('show');
		},
		hide: function(){
			this.modalContainer.modal('hide');
		},
		camera: function(){
			console.log('from camera');
			this.hide();
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
		folder: function(e){

			console.log('from folder');
			this.hide();

			e.preventDefault();
			if (!navigator.camera) {
				alert("Folder" + config.apiNotSupported, config.errorType);
				return;
			}	
			
			var options =   {
								quality: 50,
								destinationType: Camera.DestinationType.FILE_URI,
								sourceType: 2,      // 0:Photo Library, 1=Camera, 2=Saved Album
								encodingType: 0     // 0=JPG 1=PNG
							};
			var self= this;

			navigator.camera.getPicture( function(result){
				self.cameraSuccess(result, self);
			}, this.cameraFailed ,options);
			
			return false;
		},
		cameraSuccess: function(imageUri, self){
			console.log('uploading photo');
			this.hide();
			window.resolveLocalFileSystemURL(imageUri, function(fileEntry) {

		            fileEntry.file(function(fileObj) {
		                var fileName = fileObj.localURL;
						var serverURL = config.apiUrl+"photos/upload";
						var options = new FileUploadOptions();
						options.fileKey = 'file';
						options.fileName = imageUri.substr(imageUri.lastIndexOf('/')+1);
						options.mimeType = "image/jpeg";
						var headers={'X-API-KEY':'61ad82618772b5bc1d708c88fdb7de47'
							};
						options.headers = headers;

						var ft = new FileTransfer();
						ft.upload(fileName, encodeURI(serverURL), function(result){self.onUploadSuccess(result, self);}, self.onUploadError, options);

		            });
		        });
		},
		onUploadSuccess: function(result,self){
			console.log('save photo upload result');
	
			var res = result.response.replace('(', "");
			res = res.replace(')', "");
			res = JSON.parse(res);

			if(res.success){
				self.savePhotoInfo(res.folder, res.filename);
			}else{
				alert(config.responseFailed);
			}
		},
		savePhotoInfo: function(path, filename){
			console.log('save photo info');
			var title = '';
			var teaser = 0;
			var privacy = 'public';
			var amount = 0
			var video_id = 0;
			var multiple_photo_id = 0;
			var self = this;
			

			//Save the photo information
			this.photoModel.create({
						member_id	: window.localStorage.getItem('uid'),
						title: title,
						path 	: path,
						filename: filename,
						privacy: privacy,
						is_teaser: teaser,
						amount: amount
					},{
						success: function(model, response) {
		
							if(model.get('photo_id')){
								self.setProfilePicture(model, privacy);
							}else
								alert(model.get('error'));
						},
						error: function(model, err) {
							alert(config.responseFailed);
						}
					});			
		},
		setProfilePicture: function(photo, privacy){
			//Attach it to a post, put this inside the photo model
			console.log('set profile picture');
			var photo_id = photo.get('photo_id');
			var self = this;
			var model = JSON.parse(window.localStorage.getItem('userInfo' + window.localStorage.getItem('uid')));
			
			this.profilePicture = new AccountModels.profileList(model);
			this.profilePicture.get('photo_id');
			this.profilePicture.set('photo_id', photo_id);
			this.profilePicture.set('primary_photo', photo.attributes);
			this.profilePicture.save();

			window.localStorage.setItem('userInfo' + window.localStorage.getItem('uid'), JSON.stringify(this.profilePicture) );
		},
		cameraFailed: function(message){
			alert('Failed because: ' + message);
		},
		close: function() {
			this.undelegateEvents();
			$('#profilePictureModal').remove();
		}
	});
});