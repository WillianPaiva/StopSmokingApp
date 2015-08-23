//$scope.chartHTML = $sce.trustAsHtml('<canvas id="comparator" class="chart chart-line" data="compData" labels="compLabels" legend="true" series="compSeries" ></canvas>');
var appCtrl = angular.module('starter.controllers', ['ngSanitize','angular-chartist']);

appCtrl.controller('DashCtrl', function($sce, $window, $scope, DataBase, $ionicPlatform, $localStorage, $timeout, cigTime, $ionicPopup, chart, $rootScope) {
    $ionicPlatform.ready(function(){
        $scope.type = 'Line';
        $scope.lineData = {
            series:[] 
        };
        $scope.heightMainChart = $scope.lineData.series.length ;
        $scope.lineOptions = chart.options($scope.heightMainChart); 

        $scope.ResponsiveOptions = chart.ResponsiveOptions(); 

        function pushData(data){
            $scope.lineData.series.push(data);
            $scope.heightMainChart = $scope.lineData.series.length ;
            $scope.lineOptions = chart.options($scope.heightMainChart); 
        }
        $scope.event = {
            draw: function eventHandler(data) {
                if(data.type === 'line' || data.type === 'area') {
                    data.element.animate({
                        d: {
                            begin: 2000 * data.index,
                            dur: 2000,
                            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
                            to: data.path.clone().stringify(),
                            easing: Chartist.Svg.Easing.easeOutQuint
                        }
                    });
                }

            }

        };

        DataBase.setChartLastWeek(new Date(), setMedian);
        $scope.button = {};
        $scope.button.class = "button button-block button-positive";
        $scope.button.tex = 'loading...';
        $scope.message = ""; 
        $scope.tickInterval = 1000;
        $scope.chartBaseline = [0];
        $scope.chartLastWeek = [0];        
        $scope.learnTime = parseInt($localStorage.get('learnTime'));

        var tick = function(){
            var str = [];
            if(cigTime.isLearnFinished($scope.learnTime)){
                if(cigTime.getNextCig().getTime() > new Date().getTime()){
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
                        $scope.button.tex = 'too early wait: ' + days + 'd ' +  hours + 'h ' +  minutes + 'm ' +  seconds + 's';
                        $scope.button.class = "button button-block button-assertive" ;
                    }else if(hours > 0){
                        $scope.button.tex ='too early wait: ' +  hours + 'h ' +  minutes + 'm ' +  seconds + 's';
                        $scope.button.class = "button button-block button-assertive" ;
                    }else if(minutes > 0){
                        $scope.button.tex = 'too early wait: ' + minutes + 'm ' + seconds + 's';
                        $scope.button.class = "button button-block button-assertive" ;
                    }else if(seconds > 0){
                        $scope.button.tex = 'almost there wait: ' +  seconds + 's';
                        $scope.button.class = "button button-block button-energized" ;
                    }
                }else{
                    $scope.button.tex = 'Ready' ;
                    $scope.button.class = "button button-block button-balanced";

                }
            }else{
                $scope.message = "In learn period";
                $scope.button.class = "button button-block button-calm";
                $scope.button.tex = "Register a smoking time";
            }
            $timeout(tick, $scope.tickInterval);
        };


        $timeout(tick, $scope.tickInterval);

        function setBaseLine(data){
            chart.data('Base Line', data,pushData);
        }
        function setMedian(data){
            $scope.lineData.series = [] ;
            chart.data('Last Week', data,pushData);
            DataBase.setChart('Learn', setBaseLine);
        }
        function insert() {
            if(cigTime.isLearnFinished($scope.learTime)){
                DataBase.InsertDate(new Date(), 'NotLearn');
                DataBase.setChartLastWeek(new Date(), setMedian);
                cigTime.setNextCig(new Date());
            }else{
                DataBase.InsertDate(new Date(), 'Learn');
                DataBase.setChartLastWeek(new Date(), setMedian);
            }
            $localStorage.set('lastCig', new Date());
        } 

        $scope.click = function(){
            if($localStorage.get('firstCig')){
                insert();
            }else{
                cigTime.firstCigSet(new Date());
                insert();
            }
        };
        /****************
        *  comparator  *
        ****************/
        $scope.lineDataComp = {
            series:[] 
        };
        $scope.DateToInsert = new Date();    
        $scope.insertDate = function(d){
            DataBase.getAllDay(d,isertDateOnChart);
        };
        var test = false;
        function isertDateOnChart(serie,data){
            chart.data(serie, data, insertSerie);
        }

        function insertSerie(data){
            $scope.lineDataComp.series.push(data);
        }

        $scope.clearData = function(){
            $scope.lineDataComp = {
                series:[]
            };

        };
    });
});

appCtrl.controller('EcoCtrl', function($scope, $localStorage, DataBase){
    $scope.price = parseFloat($localStorage.get('price')) ;
    $scope.submitPrice = function(data){
        $localStorage.set('price', data);
        DataBase.getMonths(getdata);
    };


    $scope.serie = [0];
    $scope.data = [$scope.serie];
    $scope.labels = [];
    $scope.series = ['Expenses'];
    $scope.dat = [[]];

    function getdata(data) {
        $scope.serie = [];
        $scope.labels = [];
        startup(data);
    }
    function startup(data){
        if(data.length > 0){
            DataBase.getMothExpense(data,insertSerie);
        }

    }
    function insertSerie(label,value,data){
        $scope.labels.push(label);
        $scope.serie.push(value);
        startup(data);
    }
    $scope.$watch('serie', function(){
        $scope.data = [$scope.serie];

    });
    DataBase.getMonths(getdata);
    //$scope.$on("$ionicView.afterLeave", function () {
    //$ionicHistory.clearCache();
    //}); 
});


appCtrl.controller('SettingsCtrl', function($window,$scope, $localStorage, $ionicPopup, pouchService, DataBase){
    $scope.timeFrame = parseInt($localStorage.get('timeFrame')) ;
    $scope.learnTime = parseInt($localStorage.get('learnTime')) ;



    $scope.learnTimeChanged = function(data){
        $localStorage.set('learnTime', data);
    };
    $scope.changeTimeFrame = function(data){
        $localStorage.set('timeFrame', data);
    };

    $scope.wipe = function(){
        var confirmPopup = $ionicPopup.confirm({
            title: 'Data Wipe',
            template: 'This will Wipe all your data are you sure of that'
        });
        confirmPopup.then(function(res){
            if(res){
                pouchService.db.destroy().then(function(){
                    pouchService.db = new PouchDB('AppDatabase',{adapter: 'websql'});
                    DataBase.byStatus();
                    DataBase.lastWeek();
                    DataBase.lastWeekWithHour();
                    DataBase.byMonthYear();
                    $window.location.reload();
                });

                $localStorage.destroy();                         

                $localStorage.set('timeFrame', 10);
                $localStorage.set('learnTime', 3);
                $localStorage.set('price', 0.00);
                $localStorage.set('firstRun', true);
            }else{
                console.log('nothing done');
            }
        });
    };

});

appCtrl.controller('introCtrl',['$scope', '$ionicPopup', '$state', function($scope, $ionicPopup, $state) {
    $scope.start = function() {
        $state.go('tab.dash');
    };

    $scope.$on('wizard:StepFailed', function(e, args) {
        if (args.index == 1 && args.direction == "next") {
            $ionicPopup.alert({
                title: 'Empty field',
                template: 'Please enter a value!'
            }).then(function (res) {
                console.log('Field is empty');
            });
        }
    });
}] );
