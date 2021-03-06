define(function (require) {
	"use strict";

	var $        		= require('jquery'),
		_        		= require('underscore'),
		Backbone		= require('backbone'),
		config 			= require('app/config'),
		localStorage	= require('localStorage'),
		storeData 		= {},
		uid				= {},
		tSwipe   		= require('tswipe'),
		iscrollit 		= require('iscrolljs'),
		jqueryCookie	= require('jqueryCookie'),
		menuView 		= require('app/views/menu'),
		FeedsModels  	= require('app/models/feeds'),
		FeedsNavView 	= require('app/views/feedsNav'),
		tplHome      	= require('text!tpl/feedsUniverse.html'),
		masonry			= require('masonry'),
		freewall		= require('freewall'),
		eventBus		= require('eventBus'),
		mainTemplate 	= _.template(tplHome);

	return Backbone.View.extend({
		masonry: null,
		myscroll: null,
		initialize: function () {
			var self = this;
			this.layout = 'list';
			$('.toClean').remove();
			$('.toContent').attr('id','contentTemplate');
			this.render();
			this.subViews = new FeedsNavView();
			this.listenTo(event_bus, 'refreshScroll', this.refreshScroll);
			this.listenTo(event_bus, 'refreshMasonry', this.refreshMasonry);
			$(window).on("load resize orientationchange", function() {
				self.refreshMasonry();
			});
			this.menu = new menuView();
		},
		events: {
			'click #myGrid': 'toggleView',
			'click #cameraNav': 'loadCamera'
		},
		render: function () {
			this.$el.html();

			var self = this;
			var tmpData = {};
			tmpData['member_id'] = window.localStorage.getItem('uid');
			this.$el.append(mainTemplate(tmpData));

			$('.gradient').hide();
			$('#modalWrapper').hide();

			$('#innerWrapper').removeClass('toClean').addClass('toContent');
			$('#contentTemplate').removeClass('toContent').addClass('toClean');

			//iscroll, pull refresh and pull down append starts here			

			var myScroll,
				pullDownEl, pullDownOffset,
				pullUpEl, pullUpOffset,
				generatedCount = 0;
												  
				pullDownEl = document.getElementById('pullDown');
				pullDownOffset = pullDownEl.offsetHeight;
				pullUpEl = document.getElementById('pullUp');
				pullUpOffset = pullUpEl.offsetHeight;

				myScroll = new iScroll('wrapper', {
								useTransition: true,
								vScroll: true,
								topOffset: pullDownOffset,
								onRefresh: function () {
									if (pullDownEl.className.match('loading')) {
										pullDownEl.className = '';
										pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
									} else if (pullUpEl.className.match('loading')) {
										pullUpEl.className = '';
										pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
									}
								},
								onScrollMove: function () {
									if (this.y > 5 && !pullDownEl.className.match('flip')) {
										pullDownEl.className = 'flip';
										pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
										this.minScrollY = 0;
									} else if (this.y < 5 && pullDownEl.className.match('flip')) {
										pullDownEl.className = '';
										pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
										this.minScrollY = -pullDownOffset;
									} else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
										pullUpEl.className = 'flip';
										pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Release to refresh...';
										this.maxScrollY = this.maxScrollY;
									} else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
										pullUpEl.className = '';
										pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
										this.maxScrollY = pullUpOffset;
									}
								},
								onScrollEnd: function () {
									if (pullDownEl.className.match('flip')) {
										pullDownEl.className = 'loading';
										pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';
										self.pullDownAction(myScroll);
									} else if (pullUpEl.className.match('flip')) {
										pullUpEl.className = 'loading';
										pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Loading...';
										self.pullUpAction(myScroll);
									}
								}
							});

				document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
				document.getElementById('myGrid').addEventListener('click', function() {
					myScroll.refresh();
				}, false);

				setTimeout(function () {document.getElementById('wrapper').style.left = '0';}, 800);
							  
				//iscroll, pull refresh and pull down append ends here
								
				window.onload = function() { myScroll.refresh(); }
				self.myscroll = myScroll;
				
				this.menu.render();
			return this;
		},
		loadCamera: function () {
			if (!navigator.camera) {
				alert("Camera" + config.apiNotSupported, config.errorType);
				return;
			}							
			var options =   {
								quality: 50,
								destinationType: Camera.DestinationType.DATA_URL,
								sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Album
								encodingType: 0     // 0=JPG 1=PNG
							};

			navigator.camera.getPicture( function(imageData) {
				console.log(imageData)
			}, function() {
				alert(config.errorCamera, config.errorType);
			},options);
			
			return false;
		},
		toggleView: function () {
			$('.icon-grid').toggleClass('active-color');
			$('#contentTemplate').removeAttr('style');

			var self = this;

			if(this.layout === 'list'){
				// grid view
				$('#thelist').hide();
				
				// this.startMasonry('#thelist.grid');
				this.startFreewall('#freewall');

				self.refreshScroll();

		  		$('#scroller > div').css('padding', '0px');

				this.layout = 'grid';
			}else{
				// list view
				$('#freewall').empty();

				$('#thelist').fadeIn('slow');
				
				$('#thelist.list .item').removeAttr('style');

				self.refreshScroll();

		  		$('#scroller > div').css('padding', '12px');
				
				this.layout = 'list';
			}
		},
		startFreewall: function(e) {
			var colour = [
				"rgb(142, 68, 173)",
				"rgb(243, 156, 18)",
				"rgb(211, 84, 0)",
				"rgb(0, 106, 63)",
				"rgb(41, 128, 185)",
				"rgb(192, 57, 43)",
				"rgb(135, 0, 0)",
				"rgb(39, 174, 96)"
			];

			$(".brick").each(function() {
				this.style.backgroundColor =  colour[colour.length * Math.random() << 0];
			});

			var container = document.querySelector(e);
			
			this.freewall = new freewall(container);
			this.freewall.reset({
				selector: '.brick',
				animate: true,
				cellW: 5,
				cellH: 5,
				delay: 50,
				gutterX: 2,
				gutterY: 2,
				rightToLeft: true,
				onResize: function() {
					this.fitWidth();
				}
			});

			this.freewall.fitWidth();

			var html = "";

			$('ul#thelist > li.item').each(function() {
				var size = "size1-1 size2-2".split(" ");
				var img = $(this).find('.img-feeds > img').attr('src');
				var temp = '<div class="cell {size}" style="background: url(' + img + '); background-size:cover;"><span class="text-mid-yellow icon-camera"></span></div>';

				html += temp.replace('{size}', size[size.length * Math.random() << 0])
							.replace('{color}', colour[colour.length * Math.random() << 0]);
			});

			this.freewall.appendBlock(html);

			$(window).trigger("resize");
		},
		startMasonry: function(e){
			if (e === ''){
				e = '#thelist.grid';
			}
			var container = document.querySelector(e);
			var self = this;
			this.masonry = new masonry( container, {
				columnWidth: '.item',
				// "isFitWidth": true,
				itemSelector: '.item',
				// 'isOriginTop' : true
			});
			this.refreshMasonry();
		},
		refreshMasonry: function(){
			try{
				$('.grid .item').each(function( index, value ) {
					var cw = $(this).width();
					$(this).css({'height':cw+'px'});
				});
				this.masonry.reloadItems();
				this.masonry.layout();
			}catch(e){

			}
		},
		refreshScroll: function(){
			this.myscroll.refresh();
			setTimeout(function () {	
				$('#pullDown').slideUp(1000,function(){
					$(this).addClass('hide').css('display','block');
				});
			}, 1000);
		},
		pullUpAction: function (myScroll) {
			event_bus.trigger('fetchFeed' + this.currentList); 
			event_bus.trigger('setRenderDown'); 
		},
		pullDownAction: function (myScroll) {
			event_bus.trigger('fetchFeed' + this.currentList);
			event_bus.trigger('setRenderUp'); 
		},
		cleanupObjects: function(){
			event_bus.trigger('cleanupView');
			this.menu.close();
			this.undelegateEvents();
		}
	});
});