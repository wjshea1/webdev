
// Main Application View
var app = app || {};

var MainView = Backbone.View.extend({
	el: '.page',
	loginView: {},
	initialize: function(){
		console.log("initialize");

        //TODO: check to see if session is valid -  For now if the api returns invalid session please set the user model to {}
		if ( !is_empty(app.userProfileModel)) {
            app.loginView = new LoginView();
            app.loginView.render();
        }
        else {
            this.render();
        }


	},		

	render: function() {
		console.log('rendering');
        var template = _.template($('#tda-main-page').html(), {});
        this.$el.html(template);
	}
});