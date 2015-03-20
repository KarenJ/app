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
			//moreMenu 			= require('text!tpl/moreMenuTemplate.html'),
			profilePhotoAction 	= require('text!tpl/profilePhotoAction.html'),
			postPhotoView 		= require('app/views/postPhoto'),
			//template			= _.template(moreMenu),
			profilePhotoTemplate	= _.template(profilePhotoAction);
			

	return Backbone.View.extend({
		//el: $('body'),
		id: "photoActionModal",
		isBuilt : false,
		modalContainer: null,
		initialize: function (param) {
			
			this.photoModel = new AccountModels.photoCollection();
			this.reportModel = new AccountModels.reportCollection();
			this.source = (param.source) ? param.source : null;
			
			this.model = param.model;
			this.container = param.container;
			this.uid = (param.model.get('member_id'));
			if(this.uid == window.localStorage.getItem('uid'))
				this.isSelf = true;
			else
				this.isSelf = false;

		},
		events: {
			"click #editPhoto": "editPhoto",
			"click #delete": "deletePhoto",
			"click #reportAbused" : "reportAbused"
		},
		render: function () {
			var self = this;
				var photo_id = this.model.get('photo_id');
				
				var tmpData = {};
				tmpData['photo_id'] = photo_id;
				tmpData['owner'] = (this.isSelf) ? 'true' : 'false'

				this.$el.append(profilePhotoTemplate(tmpData));
				$('#innerWrapper').after(this.$el);
				
				this.isBuilt = true;
				this.modalContainer = this.$el.find('#photoActionModal_'+photo_id);
				this.modalContainer.modal({
				    backdrop: 'static',
				    keyboard: false,
				    show:false
				});
			return this;
		},
		show: function(photo_id){
			this.modalContainer.modal('show');
		},
		hide: function(photo_id){
			this.modalContainer.modal('hide');
		},
		editPhoto: function(){
			var model;
			if(this.source=="photoPreview")
				var model = new AccountModels.photoList(this.model.attributes);
			else
				model = new AccountModels.photoList(this.model.get('_photo'));
				
			this.loadEditPhoto(model, this.model.collection);
			
			/**
			var self = this;
			if(this.photoModel.models.length ==0){
				this.photoModel.fetch({
					data:{
						photo_id: self.model.get('photo_id')
					},
					success: function(result, response){
						self.loadEditPhoto(result.models[0]);
					}});
			}else{
				self.loadEditPhoto(this.photoModel.models[0]);
			}
			**/
		},
		loadEditPhoto: function(model, collection){
			this.postPhoto = new postPhotoView({model: model, collection: collection, container: this.container, source: this.source});
		
			this.postPhoto.render();
			this.hide();
			this.postPhoto.show();
			
		},
		deletePhoto: function(){
			var self = this;
			
			if(this.photoModel.models.length ==0){
				this.photoModel.fetch({
					data:{
						photo_id: self.model.get('photo_id')
					},
					success: function(result, response){
						self.deletePhotoHandler(result);
					}});
			}else{
				self.deletePhotoHandler(this.photoModel);
			}
		},
		deletePhotoHandler: function(result){
			result.models[0].destroy();
			this.model.destroy();
			this.hide();
			if(this.source=='photoPreview'){
				this.container.empty();
				//TO DO: temporarily go back to the profile page
				Backbone.history.navigate('#account/profile',{trigger: true});
			}else{
				this.container.remove();
				event_bus.trigger('refreshScroll');
			}
		},
		reportAbused: function(){
			this.hide();
			var self = this;
			this.reportModel.create({
				reporter_member_id: window.localStorage.getItem('uid'),
				photo_id: self.model.get('photo_id')
			},{
				success: function(model, response){
					if(response.success)
						alert(response.message);
					else
						alert(response.error);
				}
			});
		},
		close: function() {
			this.undelegateEvents();
			$('#photoActionModal').remove();
		}
	});
});