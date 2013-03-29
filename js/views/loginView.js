var app = app || {}


app.LoginView = Backbone.View.extend({
		el:'.page',
		render: function(){
			console.log('render');
			var template = _.template($('#tda-login-page').html(), {});
			this.$el.html(template);
		},

		events:{
			'click #loginButton':'login'
		},

		login: function(ev) {
			ev.preventDefault();
			
			var userDetails = {
				username: $('#inputUsername').val(),
				password: $('#inputPassword').val()
			};
			
			// This should moved it is here now because we need trigger an event
			// if login is successful
			var url = 'https://apis.tdameritrade.com/apps/100/LogIn';
			$.ajax({
				url:url,
				type:'POST',
				dataType:'',
				data:'userid=' + userDetails.username + '&password=' + userDetails.password + '&source=TST&version=1001',
				success:function(data) {
					// convert data in JSON from XML
					// Save Response 
					console.log(data);
					var xml = parseXml( data );
					var jsonResponse  = xmlToJson(xml);
					if ( jsonResponse.amtd.error ){
						alert(JSON.stringify(jsonResponse.amtd.error));

					}	
					else
					{ 
						// we need trigger and event

						userProfileModel.set(jsonResponse.amtd["xml-log-in"]);
						console.log( JSON.stringify(userProfileModel));
						alert(JSON.stringify(jsonResponse.amtd["xml-log-in"]["session-id"]));

					}
					console.log(jsonResponse);
					
				}
			});		
		}


	});	