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
        },
        destroy: function(){
            $window.localStorage.clear();
        }

    };
}]);

appServ.factory('chartData',function(DataBase, chart, $rootScope){
    var mainChartData = {
        series:[],
    };
    var count = 0;
    function setMedian(data){
        chart.data('Last Week', data,pushData);
    }
    function setBaseLine(data){
        chart.data('Base Line', data,pushData);
    }
    function countAndSend(){
        if(count > 1){
            $rootScope.$broadcast('$mainChartData.loaded',mainChartData);
        }
    }
    function pushData(data){
        mainChartData.series.push(data);
        count++;
        countAndSend();
      }
    return{
        queryChart: function(){
            mainChartData = {
                series:[],
            };
            DataBase.setChartLastWeek(new Date(), setMedian);
            DataBase.setChart('Learn', setBaseLine);
        },


    };

});


appServ.factory('chart', function(){
    return{
        options: function(multiplier){
            if(Math.abs(multiplier)% 2 == 1){
                multiplier++;
            }
            var height = 150 + ((multiplier/2) * 15);
            var offset = height - 130;
            var options = {
                height: height+'px',
                axisX: {
                    type: Chartist.AutoScaleAxis,
                    //ticks: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11' , '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
                    //stretch: true,
                    high: 23,
                    low: 0,
                    onlyInteger: true,
                    offset: offset,
                },
                axisY: {
                    scaleMinSpace: 15,
                },
                chartPadding: {
                    top: 15,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                low: 0,
                showArea: true,
                showPoint: true,
                fullWidth: true,
                plugins:[
                    legendPlugin({t: 'midle'})
                ],
                lineSmooth: Chartist.Interpolation.cardinal({
                    tension: 0.3
                })
            };
            return options;
        },
        ResponsiveOptions: function(){
            var ResponsiveOptions = [
                ['screen and (min-width: 641px) and (max-width: 1024px)', {
                    axisX: {
                    },
                }],
                ['screen and (max-width: 640px)', {
                    axisX: {
                    }
                }]
            ];
            return ResponsiveOptions;        

        },
        data: function(meta,data,callback){
            var d = [];
            for(var x = 0; x < 24; x++){
                d.push({name: meta, x: x, y: data[x]});
            }
            return callback(d);
        }
    };

});

function PouchService(){
    this.db = new PouchDB('AppDatabase',{adapter: 'websql'});
}


appServ.service('pouchService', PouchService);

appServ.factory('DataBase', function(pouchService, $q, $localStorage){
    pouchService.db.compact().then(function(info){
        console.log(info);
    }).catch(function(err){
        console.log(err);
    });
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
            var time={};
            $q.when(pouchService.db.find({
                selector: {
                    status: {$eq: key},
                    year: {$exists: true},
                    month: {$exists: true},
                    day: {$exists: true},
                    hour: {$exists: true},
                },
                sort:['year', 'month' , 'day' , 'hour'],
            })).then(function(res){
                time.f = res.docs[0].hour;
                return $q.all(res.docs.map(function(doc){
                    time.l = doc.hour;
                    temp2.push(doc.day);
                    return temp[doc.hour]++;
                }));
            }).then(function(data){
                temp2 = temp2.unique();
                var bool = null;

                for(var i = 0; i < 24; i++){
                    if(time.l > time.f){
                        bool = ((time.l >= i ) && (time.f <= i));
                    }else if(time.l === time.h){
                        bool = (time.l < i);
                    }else{
                        bool = ((time.l <= i ) && (time.f >= i));

                    }                    
                    if(bool){
                        if(temp2.length > 0){
                            temp[i] = (temp[i]/temp2.length);
                        }
                    }else{
                        if((temp2.length -1) > 0){
                            temp[i] = (temp[i]/(temp2.length -1));
                        }
                    }

                }
                return temp;
            }).then(function(data){
                return callback(data);
            }).catch(function(err){
                console.log(err);
            });
        },
        setChartLastWeek: function(date, callback){
            var temp = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            var temp2 = [];
            var time = {};
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
                        {hour: {$exists: true}},
                        {month: {$exists: true}},
                    ]
                },
                sort: ['month', 'day', 'hour']
            })).then(function(res){
                time.f=res.docs[0].hour;
                return $q.all(res.docs.map(function(doc){
                    time.l = doc.hour   ;
                    temp2.push(doc.day);
                    return temp[doc.hour]++;
                }));
            }).then(function(data){
                var bool = null;
                temp2 = temp2.unique();
                for(var i = 0; i < 24; i++){
                    if(time.l > time.f){
                        bool = ((time.l >= i ) && (time.f <= i));
                    }else if(time.l === time.h){
                        bool = (time.l < i);
                    }else{
                        bool = ((time.l <= i ) && (time.f >= i));

                    }                    
                    if(bool){
                        if(temp2.length > 0){
                            console.log('test');
                            temp[i] = (temp[i]/temp2.length);
                        }
                    }else{
                        if((temp2.length -1) > 0){
                            temp[i] = (temp[i]/(temp2.length -1));
                        }
                    }

                }
                return temp;
            }).then(function(data){
                return callback(data);
            }).catch(function(err){
                console.log(err);
            });
        },
        getAllDay: function(date, callback){
            var temp = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var day, week, year, month;
            day = date.getDate();
            week = date.getWeek();
            year = date.getFullYear();
            month = date.getMonth();
            $q.when(pouchService.db.find({
                selector: {
                    $and: [
                        {year: {$eq: year}},
                        {day: {$eq: day}},
                        {month: {$eq: month}},
                    ]
                },
            })).then(function(res){
                return $q.all(res.docs.map(function(doc){
                    return temp[doc.hour]++;
                }));
            }).then(function(data){
                return temp;
            }).then(function(data){
                var labe = day+'/'+months[month]+'/'+year ;
                return callback(labe,data);
            }).catch(function(err){
                console.log(err);
            });
        },
        getMedian: function(date, callback){
            var temp2 = [];
            var count = 0;
            var day1, day2, week1, week2, year1, year2, hour;
            day1 = date.getDate();
            week1 = date.getWeek();
            year1 = date.getFullYear();
            hour = date.getHours();
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
                        {hour: {$eq: hour}}
                    ]
                },
            })).then(function(res){
                return $q.all(res.docs.map(function(doc){
                    temp2.push(doc.day);
                    return count++;
                }));
            }).then(function(data){
                temp2 = temp2.unique();
                if(temp2.length > 0){
                    count = count/temp2.length;
                }
                return count;
            }).then(function(data){
                return callback(count);
            }).catch(function(err){
                console.log(err);
            });
        },
        getMonths: function(callback){
            var days = [];
            $q.when(pouchService.db.find({
                selector: {
                    year: {$exists: true},
                    month: {$exists: true}
                },
                sort: ['year','month']
            })).then(function(res){
                return $q.all(res.docs.map(function(doc){
                    if(doc.day){
                        days.push([doc.month , doc.year]);
                        //days.push();
                    }
                    return days;
                }));

            }).then(function(data){
                days = days.unique();
            }).then(function(data){
                callback(days);
            }).catch(function(err){
                console.log(err);
            });

        },
        getMothExpense: function(data, callback){
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

            var count = 0;
            var days = [];
            $q.when(pouchService.db.find({
                selector: {
                    $and: [
                        {year: {$eq: data[0][1]}},
                        {month: {$eq: data[0][0]}},
                    ]
                },
            })).then(function(res){
                return $q.all(res.docs.map(function(doc){
                    days.push(doc.day);
                    return count++;
                }));
            }).then(function(res){
                days = days.unique();
                if(days.length > 0){
                    count = count/days.length;
                }
                count = (count*30)*(parseInt($localStorage.get('price'))/20);
                return count;
            }).then(function(result){
                var label = months[data[0][0]]+'/'+data[0][1];
                data.splice(0,1);
                return callback(label,count,data);
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
        lastWeekWithHour: function(){
            pouchService.db.createIndex({
                index: {fields: ['year', 'week', 'hour', 'day']}
            }).then(function(result){
                console.log(result);
            }).catch(function(err){
                console.log(err);
            });
        },
        allData: function(){
            pouchService.db.createIndex({
                index: {fields: ['month', 'day', 'hour', 'year', 'week']}
            }).then(function(result){
                console.log(result);
            }).catch(function(err){
                console.log(err);
            });
        },
        allData2: function(){
            pouchService.db.createIndex({
                index: {fields: ['year', 'month', 'day', 'hour', 'status']}
            }).then(function(result){
                console.log(result);
            }).catch(function(err){
                console.log(err);
            });
        },
        byMonthYear: function(){
            pouchService.db.createIndex({
                index: {fields: ['year', 'month']}
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



appServ.factory('initialRun', function ($localStorage) {
    return {
        setInitialRun: function (initial) {
            var test = (initial ? "true" : "false");
            $localStorage.set('initialRun', test);
        },
        isInitialRun: function () {
            var value = $localStorage.get('initialRun') || "true";
            return value == "true";
        }
    };
});

appServ.factory('cigTime', function($localStorage, DataBase){
    var plus = 0;
    var dat;
    var getMedian = function (data) {
        if(data === 0){
            plus++;
            dat.addMinutes(60);
            DataBase.getMedian(dat, getMedian);
        }else{
            console.log(data);
            var timeToAdd = 60/data + (parseInt($localStorage.get('timeFrame'))) + (plus * 60) ;
            $localStorage.set('nextCig', new Date($localStorage.get('lastCig')).addMinutes(timeToAdd));

        }



    };


    return{
        isLearnFinished: function(time){
            var test = new Date($localStorage.get('firstCig')).isLearnFinished(time) === true;
            return test;
        },
        firstCigSet: function(date){
            $localStorage.set('firstCig', date);
        },
        firstCigGet: function(){
            return new Date($localStorage.get('firstCig'));
        },
        getNextCig: function(){
            return new Date($localStorage.get('nextCig'));
        },

        setNextCig: function(date){
            plus = 0;
            dat = new Date(date);
            DataBase.getMedian(date, getMedian);
        }
    };
});
