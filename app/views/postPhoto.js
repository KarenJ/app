define(function (require) {
	"use strict";

		var $					= require('jquery'),
			_ 					= require('underscore'),
			Backbone 			= require('backbone'),
			config 				= require('app/config'),
			storeData			= {},
			uid					= {},
			jqueryCookie		= require('jqueryCookie'),
			eventBus			= require('eventBus'),
			AccountModels		= require('app/models/account'),
			FeedsModel			= require('app/models/feeds'),
			userTag         	= require('app/models/userTag'),
			autoCompleteView	= require('app/views/memberAutoComplete'),
			userTagItemView		= require('app/views/userTagItem'),
			postPhoto		 	= require('text!tpl/postPhoto.html'),
			searchModel			= require('app/models/search'),
			template			= _.template(postPhoto);
			

	return Backbone.View.extend({
		id: 'postPhotoContainer',
		initialize: function (param) {
			this.userTag = new userTag.userTagCollection();
			this.searchModel = new searchModel.SearchMemberCollection();
			this.photoModel = new AccountModels.photoCollection();

			this.followerCollection = new AccountModels.followersCollection();
			//this.followerModel = new AccountModels.followersList();
			this.followingCollection = new AccountModels.followingCollection();
			//this.followingModel = new AccountModels.followingList();
			
			if(param && param.model){
				this.model = param.model;
				this.container = param.container;
				this.collection = param.collection;
			}
			this.source = (param.source) ? param.source : null;
		},
		events: {
			"click #publishPhoto": "publish",
			"keyup #tag": "autoComplete",
			"change #teaser" : "toggleAmount",
		},
		render: function (imageUri) {
			
				var tmpData = {};
				
				//if the imageUri is not set, it means we are in edit mode
				if(this.model && ((imageUri=='') || (imageUri==undefined))){
					tmpData['title'] = this.model.get('title');
					tmpData['teaser'] = this.model.get('is_teaser');
					tmpData['amountcontainer'] = (this.model.get('is_teaser')==1) ? '' : 'hide';
					tmpData['privacy'] = this.model.get('privacy');
					tmpData['amount'] = this.model.get('amount');
					tmpData['tag'] = '';
					tmpData['imageUri'] = '';
					//Load the tagged members
					this.getTaggedHtml();
				}else{
					tmpData['title'] = '';
					tmpData['teaser'] = '';
					tmpData['privacy'] = '';
					tmpData['amount'] = '';
					tmpData['amountcontainer'] = 'hide';
					tmpData['tag'] = '';
					
					tmpData['imageUri'] = imageUri;
				}

				console.log(tmpData['imageUri']);
				console.log('rendered');

				this.$el.append(template(tmpData));
				$('#innerWrapper').after(this.$el);
				
				

			return this;
		},
		show: function(){
			$('#postPhoto').modal('show');
		},
		hide: function(){
			$('#postPhoto').modal('hide');
		},
		publish: function(){

			this.hide();
			var imageUri = this.$el.find('input#imageUri').val();

			//Upload the photo
			console.log('publishing photo');
			//If the model is set, it means we are editing
			if(imageUri!=''){
				this.uploadPhoto(imageUri, this);
			}
			else{
				this.saveEditedPhoto();
			}
			
		},
		uploadPhoto: function(imageUri, self){
			console.log('uploading photo');
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
		savePhotoInfo: function(path, filename){
			console.log('save photo info');
			var title = this.$el.find('input#name').val();
			var teaser = this.$el.find('select#teaser').val();
			var privacy = this.$el.find('input#privacy').val();
			var amount = this.$el.find('input#amount').val();
			var video_id = 0;
			var multiple_photo_id = 0;
			var self = this;
			
			this.$el.find('input#name').val('');
			//this.$el.find('select#teaser').val('');
			this.$el.find('input#privacy').val('');
			this.$el.find('input#amount').val('');
			this.$el.find('input#imageUri').val('');
			this.$el.find('#tag').val();

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
		
							if(model.get('photo_id'))
								self.savePost(model.get('photo_id'), privacy);
							else
								alert(model.get('error'));
						},
						error: function(model, err) {
							alert(config.responseFailed);
						}
					});			
		},
		saveEditedPhoto: function(){
			console.log('save edited photo');
			var title = this.$el.find('input#name').val();
			var teaser = this.$el.find('select#teaser').val();
			var privacy = this.$el.find('input#privacy').val();
			var amount = this.$el.find('input#amount').val();
			var video_id = 0;
			var multiple_photo_id = 0;
			var self = this;
			
			//TO DO: update the privacy of the post?
			this.model.set('title', title);
			this.model.set('is_teaser', teaser);
			this.model.set('privacy', privacy);
			this.model.set('amount', amount);
			this.model.save();
			this.saveTagged(this.model.get('photo_id'));
			
			var self = this;
			var model = _.find(this.collection.models, function(model){
				return (model.get('photo_id')==self.model.get('photo_id'));
			});
			if(this.source=='photoPreview'){
				model.set('title', title);
				model.set('is_teaser', teaser);
				model.set('privacy', privacy);
				model.set('amount', amount);
			}else{
				model.attributes._photo.title = title;
				model.attributes._photo.is_teaser = teaser;
				model.attributes._photo.privacy= privacy;
				model.attributes._photo.amount = amount;
			}
			
			this.close();
		},
		refreshPost: function(){
			//If the container is set, it means we are editing the photo
			if(this.container){
				var title = this.model.get('title');
				this.container.find('.title').html(title);
				this.getTaggedUsers();
			}
		},
		getTaggedUsers: function(){
			var photo_id = this.model.get('photo_id');
			var self = this;
			this.userTag.fetch({data:{
				photo_id: photo_id,
				pending:0
			}, success: function(result){
				self.addTaggedMembers(result.models, self);
			}});
		},
		addTaggedMembers: function(models, self){
			var container = this.container.find('#userTag');
			var count = models.length;
			if(count < 1){
				container.html('');
				return;
			}
			var tagHtml = '- with ';

			models = models.slice(0,3);
			
			var x = 0;
			_.each(models, function(model){
				tagHtml += '<a href="#account/profile/'+model.get('member_id')+'" class="text-yellow">'+model.get('firstname') + ' '+ model.get('lastname')+ '</a>';
				x++;
				if((x < 3) && (x < count)){
					tagHtml += ', ';
				}
			});
			
			if(count > 3){
				tagHtml += ' and <a href="#photo/tag/'+self.model.get('photo_id')+'" class="text-yellow">'+(Number(count)-3)+" other </a>";
			}
			container.html(tagHtml);
		},
		savePost: function(photo_id, privacy){
			//Attach it to a post, put this inside the photo model
			console.log('save post');
			var self = this;
			this.postPhoto = new FeedsModel.MyUniverseCollection();
			this.postPhoto.create({
						member_id	: window.localStorage.getItem('uid'),
						photo_id 	: photo_id,
						privacy		: privacy
					},{
						success: function(model, response) {
							console.log('posted!');
							console.log(response.success);
							if(response.success) {
								self.saveTagged(photo_id);
								event_bus.trigger('appendNewPost');
								self.close();
							} else {
								alert(response.error);
							}
						},
						error: function(model, err) {
							alert(config.responseFailed);
						}
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
		onUploadError: function(result){
			console.log(config.responseFailed);
		},
		autoComplete: function(event){
			var container = this.$el.find('.autocompleter');
			var keywordField = $(event.target).val();

			var keyword = keywordField;
			if(keyword =='')
				container.empty();
				
			if(!this.friendList){
				
				var self = this;
				//Get the list of followers in localstorage, if not yet set, do backend call
				this.followers = window.localStorage.getItem('followersList'+ window.localStorage.getItem('uid'));
				this.following = window.localStorage.getItem('followingList'+ window.localStorage.getItem('uid'));

				if(!this.followers){
					this.followerCollection.fetch({
						data:{member_id: window.localStorage.getItem('uid')},
						success: function(result){
							console.log(result);
							self.followers = result;
							if(!following){
								self.followingCollection.fetch({
								data:{member_id: window.localStorage.getItem('uid')},
								success: function(result){
									console.log(result);
									self.following = result;
									//merge the following and follower
									self.friendList = self.followers.models.concat(self.following.models);
									self.getMatchedMembers(self.friendList, keyword, container);
								}
							});
							}else{
								var followingList = JSON.parse(self.following);
								var following = _.map(followingList, function(following){
									return new AccountModels.followingList(following);
								})
								
								self.friendList = self.followers.models.concat(following);
								self.getMatchedMembers(self.friendList, keyword, container);
								
							}
					}});
				}else if(this.followers && !this.following){
							this.followingCollection.fetch({
								data:{member_id: window.localStorage.getItem('uid')},
								success: function(result){
									console.log(result);
									self.following = result;
									//merge the following and follower
									var followersList = JSON.parse(self.followers);
									var followers = _.map(followersList, function(followers){
										return new AccountModels.followersList(follower);
									})
									self.friendList = self.following.models.concat(followers);
									self.getMatchedMembers(self.friendList, keyword, container);
								}
							});
					
				}else{
					
					var followingList = JSON.parse(self.following);
					var following = _.map(followingList, function(following){
							return new AccountModels.followingList(following);
					});
					var followersList = JSON.parse(self.followers);
					var followers = _.map(followersList, function(follower){
							return new AccountModels.followersList(follower);
					})				
					
					
					this.friendList = following.concat(followers);
					this.getMatchedMembers(this.friendList, keyword, container);
				}
			}else{
				this.getMatchedMembers(this.friendList, keyword, container);
			}
			
			//This is the code for tag any member, not only friends
			/**	
			var self = this;
			this.searchModel.fetch({data: {
				keyword: keyword,
				type : 'member',
				viewer_member_id : window.localStorage.getItem('uid')
			},
				success: function(result, response){
					//TO DO: Remove the elements that are already tagged								
					//Autocomplete view, pass the search result and element where to put the autocomplete
					if(result.models.length > 0)
						new autoCompleteView({result: result.models, container: container});
					else
						container.empty();
				}});	
			**/	
		},
		saveTagged: function(photo_id){
			//Get the list of all tagged elements
			var members = this.$el.find('.taggedMember');
			this.$el.find('#tagged').empty();
			var self = this;
			//Delete all the members tagged in the photo
			var member_ids = [];
			_.each(members, function(elem){
				member_ids.push($(elem).val());
			});
			
			//loop on the old tagged list
			if(this.userTag.models.length > 0){
				_.each(this.userTag.models, function(tag){
					//check if the member_id is in the member_ids
					var item = _.contains(member_ids, tag.get('member_id'));
					if(item){
						member_ids = _.without(member_ids, tag.get('member_id'));
					}else{
						tag.destroy();
					}
				})
			}
			
			
			//if yes, delete in member_ids
			//if not, delete in the tagged list
			//the remaining member_ids will be the included in saving
			
								
			//save it
			if(member_ids.length > 0){
				self.userTag.create({
					member_ids: member_ids,
					photo_id: photo_id,
					type: 'photo'
				}, {
					success: function(result){
						if(result.get('success')== 'false'){
							alert(result.error);
						}else{
							self.refreshPost();
						}
				}});
			}else{
				this.refreshPost();
			}
		},
		getTaggedHtml: function(){
			var photo_id = this.model.get('photo_id');
			var self = this;
			this.userTag.fetch({data:{
				photo_id: photo_id
			}, success: function(result){
				self.buildHtml(result.models);
			}});
		},
		buildHtml: function(tags){
			var self = this;
			var html = '';
			$('#tagged').empty();
			_.each(tags, function(tag){
				var view = new userTagItemView({model:tag});
				$('#tagged').append(view.$el[0]);
			});
		},
		getMatchedMembers: function(friendList, keyword, container){
			
			var members = this.$el.find('.taggedMember');
			var self = this;
			//Delete all the members tagged in the photo
			var member_ids = [];
			_.each(members, function(elem){
				member_ids.push($(elem).val());
			});
			
			//Remove duplicates
			var friends = _.filter(friendList, function(friend){
				//Make sure that there is a member node
				if(friend.get('member')){
					var firstname = friend.get('member').firstname.toLowerCase().search(keyword);
					var lastname = friend.get('member').lastname.toLowerCase().search(keyword);
					//Remove the members that are already in the member_ids list
					var member_id = friend.get('member').member_id;
					var selected = _.find(member_ids, function(member){
						return (member == member_id);
					});
					
					if(((firstname !=-1)||(lastname !=-1))&&(!selected))
						return friend;
				}
			});
			
			friends = _.uniq(friends, false, function(friend){
				return friend.get('member').member_id;
			});
			
			
			if(friends.length > 0)
				new autoCompleteView({result: friends, container: container});
			else
				container.empty();
		},
		toggleAmount: function(event){
			var value = $(event.target).val();
			var elem = this.$el.find('.amountcontainer');
			if(value=='1'){
				elem.removeClass('hide');
			}else{
				elem.addClass('hide');
				$(event.target).val('');
			}
		},
		close: function() {
			console.log('undelegate events in postPhoto');
			this.undelegateEvents();
			this.$el.remove();
			$('.modal-backdrop').remove();
			//$('#postPhoto').remove();
		}
	});
});