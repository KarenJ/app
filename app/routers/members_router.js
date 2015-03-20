define(function (require) {
	"use strict";

	var SubRoute 		= require('backbonesubroute'),
		config			= require('app/config'),
		jqueryCookie	= require('jqueryCookie'),
		FeedsModels		= require('app/models/feeds'),
		$content 		= $('#contentTemplate');
		
	return Backbone.SubRoute.extend({
		routes: {
			'': 'followmembers',
			'follow-members': 'followmembers'
		},
		initialize: function() {
			console.log("initialize member subrouters")
		},
		loadView : function(view) {
			this.view && (this.view.close ? this.view.close() : this.view.remove());
			this.view = view;
		},
		followmembers: function () {
			console.log("most list of popular members...");

			var self = this;
									
			self.mostPopular = new FeedsModels.MostPopularCollection();
									
			require(['app/views/followMembers'], function (followMembersView) {
				self.mostPopular.fetch({
					success: function(data) {
						new followMembersView({
							collection: data,
						});
					}
				});
			});
		}
	});
});