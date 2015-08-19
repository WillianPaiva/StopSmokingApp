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


function PouchService(){
    this.db = new PouchDB('AppDatabase',{adapter: 'websql'});
}


appServ.service('pouchService', PouchService);



appServ.factory('DataBase', function(pouchService, $q, $localStorage){
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
                var h = new Date().getHours();
                for(var i = 0; i < 24; i++){
                    if(i <= h){
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
                var h = new Date().getHours();
                for(var i = 0; i < 24; i++){
                    if(i <= h){
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
            $q.when(pouchService.db.allDocs({
                include_docs: true
            })).then(function(res){
                return $q.all(res.rows.map(function(row){
                    if(row.doc.day){
                        days.push([row.doc.month , row.doc.year]);
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
        getMothExpense: function(month,year, dat){
            var count = 0;
            var days = [];
            $q.when(pouchService.db.find({
                selector: {
                    $and: [
                        {year: {$eq: year}},
                        {month: {$eq: month}},
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
                return dat.push(count);
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
    var getMedian = function (data) {
        var timeToAdd = 60/data + (parseInt($localStorage.get('timeFrame'))) ;
        $localStorage.set('nextCig', new Date($localStorage.get('lastCig')).addMinutes(timeToAdd));
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
            DataBase.getMedian(date, getMedian);
        }
    };
});
