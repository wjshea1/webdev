var app = app || {}

app.QuoteDetailView = Backbone.View.extend({
	el:'.page',
    initialize: function () {

       //this.render();
    },
	render: function (symbol) {
			var tmp = _.template(utils.templates['QuoteDetailView'], {name:'Quote Details'});
			this.$el.html(tmp);

            // TODO: add symbol look up here

			this.quoteDetailSubView = new app.QuoteDetailSubView();
            this.quoteDetailSubView.renderSubView(symbol,'QuoteDetailSubView','QuoteDetailSubView');
	}
});