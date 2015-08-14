var appServ = angular.module('starter.services', []);

appServ.factory('localStorage', ['$window', function($window){
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        },
        removeItem: function(key){
            $window.localStorage.removeItem(key);
        }

    };
}]);

appServ.factory('ChartCreate',[function(){
    var chart = {
            title: {
                text: 'Weekly Smoke Pattern',
            },
            xAxis: {
                title:{
                    text: 'Hours Of the Day'
                },
                categories: ['00', '01', '02', '03', '04', '05',
                '06', '07', '08', '09', '10', '11' , '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
            },
            yAxis: {
                title: {
                    text: 'cig per hour'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }],
                min: 0
            },
            tooltip: {
            },
            legend: {
                layout: 'vertical',
                align: 'center',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [{
                name: 'Base line',
                data: []
            }, 
            {
                name: 'last 7 days',
                data: []
            },
            ],
        };
    return chart;
}]);
