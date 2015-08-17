var appServ = angular.module('starter.services', []);

appServ.factory('$localStorage', ['$window', function($window){
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
function PouchService(){
    this.db = new PouchDB('AppDatabase',{adapter: 'websql'});
}


appServ.service('pouchService', PouchService);



appServ.factory('DataBase', function(pouchService, $q){
    return{
        InsertDate: function(date, status){
            var day, month, year, week, hour, minute, weekDay;  
            day = date.getDate();
            month = date.getMonth();
            year = date.getFullYear();
            week = date.getWeek();
            hour = date.getHours();
            minute = date.getMinutes();
            weekDay = date.getDay();
            return $q.when(pouchService.db.post({
                status: status,
                day: day,
                month: month,
                year: year,
                week: week,
                hour: hour,
                minute: minute,
                weekDay: weekDay,
            })).then(function(resp){
                console.log(resp);
            }).catch(function(err){
                console.log(err);
            });
        },
        setChart: function(key, callback){
            var temp = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            var temp2 = [];
            $q.when(pouchService.db.find({
                selector: {status: {$eq: key}},
            })).then(function(res){
                return $q.all(res.docs.map(function(doc){
                    temp2.push(doc.day);
                    return temp[doc.hour]++;
                }));
            }).then(function(data){
                temp2 = temp2.unique();
                for(var i = 0; i < 24; i++){
                    if(temp2.length > 0){
                        temp[i] = (temp[i]/temp2.length);
                    }
                }
                return temp;
            }).then(function(data){
                return callback(data);
            }).catch(function(err){
                console.log(err);
            });
        },
        setChartLastWeek: function(key, date, callback){
            var temp = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            var temp2 = [];
            var day1, day2, week1, week2, year1, year2;
            day1 = date.getDate();
            week1 = date.getWeek();
            year1 = date.getFullYear();
            date.addDays(-7);
            day2 = date.getDate();
            week2 = date.getWeek();
            year2 = date.getFullYear();
            $q.when(pouchService.db.find({
                selector: {
                    $and: [
                        {year: {$lte: year1}},
                        {year: {$gte: year2}},
                        {day: {$lte: day1}},
                        {day: {$gte: day2}},
                        {week: {$lte: week1}},
                        {week: {$gte: week2}},
                        {status: {$eq: key}}
                    ]
                },
            })).then(function(res){
                return $q.all(res.docs.map(function(doc){
                    temp2.push(doc.day);
                    return temp[doc.hour]++;
                }));
            }).then(function(data){
                temp2 = temp2.unique();
                for(var i = 0; i < 24; i++){
                    if(temp2.length > 0){
                        temp[i] = (temp[i]/temp2.length);
                    }
                }
                return temp;
            }).then(function(data){
                return callback(data);
            }).catch(function(err){
                console.log(err);
            });
        },
        byStatus: function(){
            pouchService.db.createIndex({
                index: {fields: ['status']}
            }).then(function(result){
                console.log(result);
            }).catch(function(err){
                console.log(err);
            });
        },
        lastWeek: function(){
            pouchService.db.createIndex({
                index: {fields: ['year', 'week', 'day', 'status']}
            }).then(function(result){
                console.log(result);
            }).catch(function(err){
                console.log(err);
            });
        }

    };
});


