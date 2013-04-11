

var app = app || {};
// Make the sure the DOM is loaded before go and do something
$(function() {
	console.log('starting application');


    utils.loadTemplates(['QuoteDetailView','QuoteDetailSubView'], function(){
            app.mainView = new MainView();
            var dummyCollection  = new WatchListModelCollection()
            app.watchlistView = new WatchlistView({collection: dummyCollection});
            app.chartView = new ChartView();
            app.assetcache = new AssetCache();

            Backbone.history.start();

        }
      ) ;

});
