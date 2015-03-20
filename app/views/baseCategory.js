/**  
  * @desc base for feed views
  * examples mostrated, mostPopular, and mostFollowed
  * @required settings.php 
*/ 
define(function (require) {
	"use strict";
	var $					= require('jquery'),
		_					= require('underscore'),
		Backbone			= require('backbone'),
		config 				= require('app/config'),
		storeData			= {},
		FeedsModels		= require('app/models/feeds'),
		eventBus		 	= require('eventBus');
		
	return Backbone.View.extend({
		addNewOne: function(newModel){
			if(!this.subViews)
				return;
				
			var filterData = newModel.attributes, i = 1, dir = this.renderDirection, nview = new this.ItemView({model: newModel, self: this});
			this.subViews.push(nview);
			if(dir === 1){
				this.$el.prepend(this.randomWidthSize(nview.$el[0],i));
			}else{
				this.$el.append(this.randomWidthSize(nview.$el[0],i));
			}

			this.animateImg(nview);
			event_bus.trigger('refreshScroll');
			event_bus.trigger('refreshMasonry');	
		},
		render: function () {
			console.log(this.collection.models);
			var dir = 1;
			var self = this, i = 0;
			this.$el.empty();
			this.subViews = _.map(this.collection.models, function(result) { 
				var filterData = result.attributes;

				if(filterData.photo_type == self.filterPhoto) {
					return new self.ItemView({model: result, self: self});
				}else if(self.filterPhoto == '*'){
					return new self.ItemView({model: result, self:self});
				}else{
					console.log('no items available for ' + self.filterPhoto);
				}
				//this.routes[Backbone.history.fragment]
			});

			_.each(this.subViews, function(view) {
				if(view === undefined){
					console.log('view is undefined');
				}else{
					if(dir === 1){
						self.$el.append( self.randomWidthSize(view.$el[0]) );
					}else{
						self.$el.prepend( self.randomWidthSize(view.$el[0]) );
					}
					self.animateImg();
				}
				i++;
			}, self);
			event_bus.trigger('refreshScroll');
			event_bus.trigger('refreshMasonry');		

		},
		randomWidthSize : function(el){
			/*Randomize width size for masonry items */
			$(el).attr('class','item');
			var widthClasses= ['w2',' ',' ']; //Values set in stylesheet, widths - 50% 75% Default. 	
			var randClass = widthClasses[Math.floor(Math.random() * widthClasses.length)];

			//First and Last item on updateField should no be w2 to minimize masonry gaps
			if(this.lastRes === 'w2'){
				randClass = ' ';
			}
			this.lastRes = randClass;
			$(el).addClass(randClass);
			return el; 
		},
		animateImg: function () {
			$('#thelist li').animate({opacity: 1}, 200);
		},
		swipeGesture: function () {

			var imgElem;
			if(this.$el)
				imgElem = this.$el.find('li > img');
			else
				imgElem = $('#thelist > li > img');
				
			imgElem.swipe({
				swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
						var memid = this.data('member-id');

						if(direction == "left") {
							alert(config.redirection + ' to ' + memid);
							console.log(memid)
							Backbone.history.navigate("#account/profile/", {trigger: true});
						} else if (direction == "right") {
							console.log(config.gestureEmpty);
						}
				},
				threshold:75
			});
		},
		closeView: function() {
			//Clean up all unused objects here
			console.log('cleaning up');
			this.renderDirection = 0;
			this.$el.empty();
		}
	});
});