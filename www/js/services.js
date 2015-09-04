var appServ = angular.module('starter.services', []);



appServ.factory('buttonTimeOut', function(cigTime,$localStorage, $timeout, $rootScope){
    var button = {};
    var cravingPopup = false;
    var tickInterval = 1000;
    var tick = function(){
        if(cigTime.isLearnFinished($localStorage.get('learnTime'))){
            if(cigTime.getNextCig().getTime() > new Date().getTime()){
                showCravingPopup = true;
                var diff = Math.floor((cigTime.getNextCig().getTime() - new Date().getTime())/1000);
                var days, hours, minutes, seconds;
                days = Math.floor(diff / 86400);
                diff -= days * 86400;
                hours = Math.floor(diff / 3600) % 24;
                diff -= hours * 3600;
                minutes = Math.floor(diff / 60) % 60;
                diff -= minutes * 60;
                seconds = diff % 60;
                if(days > 0){
                    button.tex = 'too early wait: ' + days + 'd ' +  hours + 'h ' +  minutes + 'm ' +  seconds + 's';
                    button.class = "col button button-raised button-large button-assertive" ;
                }else if(hours > 0){
                    button.tex ='too early wait: ' +  hours + 'h ' +  minutes + 'm ' +  seconds + 's';
                    button.class = "col button button-raised button-large button-assertive" ;
                }else if(minutes > 0){
                    button.tex = 'too early wait: ' + minutes + 'm ' + seconds + 's';
                    button.class = "col button button-raised button-large button-assertive" ;
                }else if(seconds > 0){
                    button.tex = 'almost there wait: ' +  seconds + 's';
                    button.class = "col button button-raised button-large button-energized" ;
                }
            }else{
                showCravingPopup = false;
                button.tex = 'Ready' ;
                button.class = "col button button-raised button-balanced";
            }
        }else{
            showCravingPopup = false;
            button.class = "col button button-raised button-large button-calm";
            button.tex = "Register a smoking time";
        }
        $rootScope.$broadcast('$button.refreshed',{button: button, cravingPopup: cravingPopup});
        $timeout(tick, tickInterval);
    };
    $timeout(tick, tickInterval);
    return true;
});

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
                    offset: 17,
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
            return $q.when(pouchService.db.post({
                status: status,
                date: date,
            })).then(function(resp){
                $localStorage.setObject('lastEntrance', resp);
                console.log(resp);
            }).catch(function(err){
                console.log(err);
            });
        },
        deleteItem: function(doc){
            console.log(doc);
            return $q.when(pouchService.db.get(doc.id))
            .then(function(resp){
                return pouchService.db.remove(resp);
            }).then(function(suss){
                console.log(suss);
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
                    date: {$exists: true},
                },
                sort:['date'],
            })).then(function(res){
                if(res.hasOwnProperty('docs')){
                    time.f = new Date(res.docs[0].date).getHours();
                }
                return $q.all(res.docs.map(function(doc){
                    time.l = new Date(doc.date).getHours();
                    temp2.push(new Date(doc.date).getDay());
                    return temp[new Date(doc.date).getHours()]++;
                }));
            }).then(function(data){
                temp2 = temp2.unique();
                var bool = null;
                for(var i = 0; i < 24; i++){
                    if((i >= time.l) && (i >= time.f)){
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
            var date2 = new Date(date);
            date2.addDays(-7);
            $q.when(pouchService.db.find({
                selector: {
                    $and: [
                        {date: {$lte: date}},
                        {date: {$gte: date2}},
                    ]
                },
                sort: ['date']
            })).then(function(res){
                if(res.hasOwnProperty('docs')){
                    time.f = new Date(res.docs[0].date).getHours();
                }
                return $q.all(res.docs.map(function(doc){
                    time.l = new Date(doc.date).getHours()   ;
                    temp2.push(new Date(doc.date).getDay());
                    return temp[new Date(doc.date).getHours()]++;
                }));
            }).then(function(data){
                var bool = null;
                temp2 = temp2.unique();
                for(var i = 0; i < 24; i++){
                    if((i >= time.l) && (i>=time.f)){
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
            var d1 = new Date(date);
            var d2 = new Date(date);
            d1.setHours(0,0,0,0);
            d2.addDays(1);
            d2.setHours(0,0,0,0);
            $q.when(pouchService.db.find({
                selector: {
                    $and: [
                        {date: {$gte: d1}},
                        {date: {$lt: d2}},
                    ]
                },
            })).then(function(res){
                return $q.all(res.docs.map(function(doc){
                    return temp[new Date(doc.date).getHours()]++;
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
            var date2 = new Date(date);
            date2.addDays(-7);
            $q.when(pouchService.db.find({
                selector: {
                    $and: [
                        {date: {$lte: date}},
                        {year: {$gte: date2}},
                    ]
                },
            })).then(function(res){
                return $q.all(res.docs.map(function(doc){
                    temp2.push(new Date(doc.date).getDay());
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
                    date: {$exists: true}
                },
                sort: ['date']
            })).then(function(res){
                return $q.all(res.docs.map(function(doc){
                    if(doc.day){
                        var temp = new Date(doc.date);
                        days.push([temp.getMonth() , temp.getFullYear()]);
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
            var d1 = new Date();
            var d2 = new Date();
            d1.setFullYear(data[0][1]);
            d1.setMonth(data[0][0]);
            d1.setTime(0,0,0,0);
            d1.setDate(1);
            d2.setFullYear(data[0][1]);
            d2.setMonth((data[0][0])+1);
            d2.setTime(0,0,0,0);
            d2.setDate(1);
            $q.when(pouchService.db.query({
                selector: {
                    $and: [
                        {date: {$gte: d1}},
                        {date: {$lt: d2}},
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
        byDate: function(){
            pouchService.db.createIndex({
                index: {fields: ['date']}
            }).then(function(result){
                console.log(result);
            }).catch(function(err){
                console.log(err);
            });
        },
        allData: function(){
            pouchService.db.createIndex({
                index: {fields: ['date','status']}
            }).then(function(result){
                console.log(result);
            }).catch(function(err){
                console.log(err);
            });
        },
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
