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
		FeedsModels  	= require('app/models/feeds'),
		tplHome      	= require('text!tpl/profileFeedsHome.html'),
		freewall		= require('freewall'),
		eventBus		= require('eventBus'),
		mainTemplate 	= _.template(tplHome);

	return Backbone.View.extend({
		myscroll: null,
		initialize: function () {
			var self = this;
			this.layout = 'list';
			//$('.toClean').remove();
			//$('.toContent').attr('id','contentTemplate');
			this.render();
			//this.subViews = new FeedsNavView();
			this.listenTo(event_bus, 'refreshScroll', this.refreshScroll);
			this.listenTo(event_bus, 'appendNewPost', this.pullDownAction);
		},
		events: {
			'click #myGrid': 'toggleView'
		},
		render: function () {
			$('#universe').html();

			var self = this;
			var tmpData = {};
			tmpData['member_id'] = window.localStorage.getItem('uid');
			$('#universe').append(mainTemplate(tmpData));

			$('.gradient').hide();
			$('#modalWrapper').hide();

			$('#innerWrapper').removeClass('toClean').addClass('toContent');
			$('#contentTemplate').removeClass('toContent').addClass('toClean');

			//iscroll, pull refresh and pull down append starts here			

			var myScroll,
				pullDownEl, pullDownOffset,
				pullUpEl, pullUpOffset,
				generatedCount = 0;
												  
				pullDownEl = this.$el.find('#pullDown').get(0);
				pullDownOffset = pullDownEl.offsetHeight;
				pullUpEl = this.$el.find('#pullUp').get(0);
				pullUpOffset = pullUpEl.offsetHeight;

				myScroll = new iScroll('profileWrapper', {
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

				document.addEventListener('touchmove', function (e) { 
					e.preventDefault(); 
					}, false);
				//document.getElementById('myGrid').addEventListener('click', function() {
				//	myScroll.refresh();
				//}, false);
				setTimeout(function () {self.$el.find('#profileWrapper').css({left:0});}, 800);
				//setTimeout(function () {document.getElementById('wrapper').style.left = '0';}, 800);
							  
				//iscroll, pull refresh and pull down append ends here
								
				window.onload = function() { myScroll.refresh(); }
				self.myscroll = myScroll;
			return this;
		},
		toggleView: function () {
			$('.icon-grid').toggleClass('active-color');
			$('#contentTemplate').removeAttr('style');

			var self = this;

			if(this.layout === 'list'){
				// grid view
				$('#thelist').hide();
				
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
		refreshScroll: function(){
			this.myscroll.refresh();
			var self = this;
			setTimeout(function () {	
				$('#universe #pullDown').slideUp(1000,function(){
					$(this).addClass('hide').css('display','block');
				});
			}, 1000);
		},
		pullUpAction: function (myScroll) {
			event_bus.trigger('fetchFeed' + this.currentList, 0); 
			event_bus.trigger('setRenderDown'); 
			return false;
		},
		pullDownAction: function (myScroll) {
			event_bus.trigger('fetchFeed' + this.currentList, 1);
			event_bus.trigger('setRenderUp'); 
		},
		cleanupObjects: function(){
			event_bus.trigger('cleanupView');
		}
	});
});