//Chart View
var app = app || {};
var ChartView = Backbone.View.extend({
    el: '.page',
    initialize: function() {
        console.log("Chart initialize " + app.userProfileModel);
        this.timeinterval;
        this.periodType;
        this.chartInstance;
        this.chartdivId;
        this.chartType = 'candlestick';
        var datetoday = new Date();
        if(datetoday.getHours() <= 9 && datetoday.getMinutes() <= 30){
            datetoday.setDate(datetoday.getDate()-1);
        }

        this.endDate = $.datepicker.formatDate('yymmdd', datetoday);
        this.chartModel = new ChartModel();
        _.bindAll(this,'render','update');

    },
    render: function() {   
        var template = _.template(utils.templates['ChartView'], {});
       // var template = _.template(utils.templates['ChartView']);
        this.$el.html(template);
        if (this.chartModel.get('symbol') !== '')
            $('#chartSymbol').val(this.chartModel.get('symbol'));
        this.drawCharts();

    },
    
    renderTodayChart: function(symbol,divId) {   
    	$('#'+divId).empty();   
    	this.chartdivId = divId;
    	that = this;
    	this.getPriceHistoryForSymbol(symbol,that);    	
    },
    
    destroy: function(){
    	if(this.chartInstance){
			this.chartInstance.destroy();
	}
    },
    
    events: {
        'click #goButton': 'getPriceHistory',
        'change #chartType':  'changeChartType'  
    },
            
    changeChartType:function(){
        this.chartType = $('#chartType').val();
        this.drawCharts();
    },
    
    update: function(model) {
    		//this.collection.each(this.renderOne);
    		var diff = model.get('changedColumns');
    		for(var att in diff){
                if(att == 'last'){
                    if(this.chartInstance.series){
                        series1 = this.chartInstance.series[0];
                        var assetM = app.assetcache.getAssetObject(series1.name);
                        series1.data[series1.data.length-1].update(series1.data[series1.data.length-1].y = assetM.get('last'));
                        series1.chart.yAxis[1].update({opposite: true});
                    }
                }
    		}				
	},
	
    
	getPriceHistoryForSymbol: function(symbol,that)
	{
            this.chartModel.set({symbol: symbol});
            var sessionToken = app.userProfileModel.get('session-id');
            var dailyReq = new XMLHttpRequest();
            var url = app.apiUrl+'/apps/100/PriceHistory?jsessionid=' + sessionToken +
                    '&requestidentifiertype=SYMBOL&requestvalue=' + symbol + '&source=TAG' +
                    '&intervaltype=MINUTE&periodtype=DAY' +
                    '&intervalduration=5&enddate=' + this.endDate + '&period=1' +
                    '&extended=false';
            dailyReq.open('GET', url, true);
            dailyReq.responseType = 'arraybuffer';
            dailyReq.onload = function(oEvent) {
                var arrayBuffer = dailyReq.response;
                that.priceHistoryResponse(arrayBuffer, true,true);
            };
            dailyReq.send(null);
    
    },
    getPriceHistory: function()
    {
        var symbol = $('#chartSymbol').val();
        this.chartModel.set({symbol: symbol});
        var sessionToken = app.userProfileModel.get('session-id');
//        var oReq = new XMLHttpRequest();
//        var url = 'https://apista.tdameritrade.com/apps/100/PriceHistory?jsessionid=' + sessionToken +
//                '&requestidentifiertype=SYMBOL&requestvalue=' + symbol + '&source=TAG' +
//                '&intervaltype=DAILY&periodtype=YEAR' +
//                '&intervalduration=1&enddate=' + this.endDate + '&period=3' +
//                '&extended=false';
//        oReq.open('GET', url, true);
//        oReq.responseType = 'arraybuffer';
//        oReq.onload = function(oEvent) {
//            var arrayBuffer = oReq.response;
//            app.chartView.priceHistoryResponse(arrayBuffer, false);
//        };
//        oReq.send(null);

        var dailyReq = new XMLHttpRequest();
        var url = 'https://apista.tdameritrade.com/apps/100/PriceHistory?jsessionid=' + sessionToken +
                '&requestidentifiertype=SYMBOL&requestvalue=' + symbol + '&source=TAG' +
                '&intervaltype=MINUTE&periodtype=DAY' +
                '&intervalduration=5&enddate=' + this.endDate + '&period=1' +
                '&extended=false';
        dailyReq.open('GET', url, true);
        dailyReq.responseType = 'arraybuffer';
        dailyReq.onload = function(oEvent) {
            var arrayBuffer = dailyReq.response;
            app.chartView.priceHistoryResponse(arrayBuffer, true,false);
        };
        dailyReq.send(null);

    },
    priceHistoryResponse: function(arrayBuffer, dailyChart,quotetab) {
        if (arrayBuffer) {
            var byteArray = new Uint8Array(arrayBuffer);
            var view = new jDataView(byteArray);
            var symCount = view.getInt32();
            var symStr = view.getUTF8String(6, this.chartModel.get('symbol').length);
            var errorCode = view.getInt8();
            var barCount = view.getInt32();
            var ohlc = [],
                    volume = [];
            for (var i = 0; i < barCount; i++)
            {
                var close = view.getFloat32();
                var high = view.getFloat32();
                var low = view.getFloat32();
                var open = view.getFloat32();
                var symVolume = view.getFloat32(); //should be int, from streamer coming in 100s
                symVolume = symVolume * 100;
                var date = view.getLong32();

                ohlc.push([
                    date, // the date
                    open, // open
                    high, // high
                    low, // low
                    close // close
                ]);

                volume.push([
                    date, // the date
                    symVolume // the volume
                ]);
            }
            if(quotetab){
            	this.chartModel.set({dailyohlc: ohlc});
            	if(this.chartInstance){
            		this.chartInstance.destroy();
            	}
            	this.chartInstance = drawUtilTodayCharts(this.chartdivId,this.chartModel.get('symbol'),ohlc);
            	this.chartModel.setAsset(app.assetcache.getAssetObject(this.chartModel.get('symbol')));
            	this.chartModel.on("change",this.update);
            	return;
            }
            if (dailyChart) {
                this.chartModel.set({dailyohlc: ohlc});
                this.chartModel.set({dailyvolume: volume});
                this.drawCharts();
            } else {
                this.chartModel.set({ohlc: ohlc});
                this.chartModel.set({volume: volume});                
            }


        }
    },
    drawCharts: function() {
            Highcharts.setOptions({
                global: {
                    useUTC: false
                }
            });
        var dailyseries = [{
                type: this.chartType,
                color:'red',
                upColor:'green',
                name: this.chartModel.get('symbol'),
                data: this.chartModel.get('dailyohlc')
            }, {
                type: 'column',              
                name: 'Volume',
                data: this.chartModel.get('dailyvolume'),
                yAxis: 1
            }];
        var series = [{
                type: this.chartType,
                name: this.chartModel.get('symbol'),
                data: this.chartModel.get('ohlc')
            }, {
                type: 'column',
                name: 'Volume',
                data: this.chartModel.get('volume'),
                yAxis: 1
            }];
        var chart = new Highcharts.StockChart({
            chart: {
                renderTo: 'chartPage',
                events: {
                    load: function() {
                        var chart = this,
                                buttons = chart.rangeSelector.buttons;                        
                    }
                }
            },
            tooltip: {
	    			crosshairs: [true, true]
	    	},
            rangeSelector: {
                buttons: [{
                        type: 'hour',
                        count: 1,
                        text: '1h'
                    },
                    {
                        type: 'day',
                        count: 1,
                        text: '1d'
 //                   }
//                    , {
//                        type: 'month',
//                        count: 1,
//                        text: '1m'
//                    }, {
//                        type: 'month',
//                        count: 3,
//                        text: '3m'
//                    }, {
//                        type: 'month',
//                        count: 6,
//                        text: '6m'
//                    }, {
//                        type: 'year',
//                        count: 1,
//                        text: '1y'
//                    }, {
//                        type: 'all',
//                        text: 'All'
                    }],
                selected: 1
            },
            title: {
                text: this.chartModel.get('symbol') + ' Historical'
            },
            yAxis: [{
                    title: {
                        text: 'OHLC'
                    },
                    height: 200,
                    lineWidth: 2
                }, {
                    title: {
                        text: 'Volume'
                    },
                    top: 300,
                    height: 100,
                    offset: 0,
                    lineWidth: 2
                }],
            series: dailyseries
        });
    }
    
});