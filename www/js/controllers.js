var appCtrl = angular.module('starter.controllers', ['chart.js']);

appCtrl.controller('DashCtrl', function($scope, DataBase, $ionicPlatform,$ionicHistory , $localStorage, $timeout, cigTime) {
    $ionicPlatform.ready(function(){
        DataBase.setChartLastWeek('NotLearn', new Date(), setMedian);
        DataBase.setChart('Learn', setBaseLine);
        $scope.button = {};
        $scope.button.class = "button button-block button-positive";
        $scope.button.tex = 'loading...';
        $scope.message = ""; 
        $scope.tickInterval = 1000;
        $scope.chartBaseline = [0];
        $scope.chartLastWeek = [0];        
        $scope.labels = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11' , '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
        $scope.learnTime = parseInt($localStorage.get('learnTime'));
        $scope.series = ['Base Line', 'Last Week'];
        $scope.data = [
            $scope.chartBaseline,
            $scope.chartLastWeek 
        ];
        function setChartRange(){
            var labels = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11' , '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
            var bot = 0;
            for(var x = 0; x < 24 ; x++){
                if($scope.chartBaseline[x] === 0 && $scope.chartLastWeek[x] === 0){
                    bot++;
                }else{break;}
            }
            labels.splice(0,bot);
            $scope.chartBaseline.splice(0,bot);
            $scope.chartLastWeek.splice(0,bot);
            $scope.labels = labels   ;
            $scope.data = [
                $scope.chartBaseline,
                $scope.chartLastWeek 
            ];

        }

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
            $scope.chartBaseline = data;
            $scope.data[0] = $scope.chartBaseline;
            setChartRange();
        }
        function setMedian(data){
            $scope.chartLastWeek  = data;
            $scope.data[1] = $scope.chartLastWeek;
            setChartRange();
        }
        function insert() {
            if(cigTime.isLearnFinished($scope.learTime)){
                DataBase.InsertDate(new Date(), 'NotLearn');
                DataBase.setChartLastWeek('NotLearn', new Date(), setMedian);
                DataBase.setChart('Learn', setBaseLine);
                cigTime.setNextCig(new Date());
            }else{
                DataBase.InsertDate(new Date(), 'Learn');
                DataBase.setChart('Learn', setBaseLine);
                DataBase.setChartLastWeek('NotLearn', new Date(), setMedian);
            }
            $localStorage.set('lastCig', new Date());
        } 
        $scope.$on("$ionicView.afterLeave", function () {
            $ionicHistory.clearCache();
        }); 


        $scope.click = function(){
            if($localStorage.get('firstCig')){
                insert();
            }else{
                cigTime.firstCigSet(new Date());
                insert();
            }
        };

    });
});

appCtrl.controller('EcoCtrl', function($scope, $localStorage, DataBase, $ionicHistory){
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
    //$scope.labels.push(months[data[x][0]]+'/'+data[x][1]);

    $scope.$watch('serie', function(){
        $scope.data = [$scope.serie];
    });
    DataBase.getMonths(getdata);

    $scope.$on("$ionicView.afterLeave", function () {
        $ionicHistory.clearCache();
    }); 
});


appCtrl.controller('SettingsCtrl', function($scope, $localStorage){
    $scope.timeFrame = parseInt($localStorage.get('timeFrame')) || 5;
    $scope.price = parseFloat($localStorage.get('price')) || 0;
    $scope.learnTime = parseInt($localStorage.get('learnTime')) || 3;



    $scope.learnTimeChanged = function(data){
        $localStorage.set('learnTime', data);
    };
    $scope.changeTimeFrame = function(data){
        $localStorage.set('timeFrame', data);
    };
    $scope.changePrice = function(data){
        $localStorage.set('price', data);
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
