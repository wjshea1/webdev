var app = app || {};

var WatchListModel = Backbone.Model.extend({
	
	initialize: function(){
		_.bindAll(this,"setAsset","updateQuote");
	},
	
	setAsset : function(assetObj){
		this.set({asset: assetObj});
		this.get('asset').on("change",this.updateQuote);
	},	
	
	updateQuote: function(model){
		this.set('changedColumns',model.changedAttributes());
	}
});