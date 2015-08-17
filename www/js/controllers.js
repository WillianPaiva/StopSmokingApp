var appCtrl = angular.module('starter.controllers', ['highcharts-ng']);

appCtrl.controller('DashCtrl', function($scope, ChartCreate, DataBase, $ionicPlatform, $localStorage, $timeout) {
    $ionicPlatform.ready(function(){


        $scope.chartConfig = ChartCreate;
        DataBase.setChart('Learn', setBaseLine);
        DataBase.setChartLastWeek('NotLearn', new Date(), setMedian);
        $scope.button = {};
        $scope.button.class = "button button-block button-positive";
        $scope.button.tex = 'loading...';
        $scope.message = ""; 
        $scope.tickInterval = 1000;



        var tick = function(){
            var str = [];
            if(((new Date($localStorage.get('firstCig'))).isLearnFinished(1)) === true){
                if(new Date($localStorage.get('nextCig')).getTime() > new Date().getTime()){
                    var diff = Math.floor((new Date($localStorage.get('nextCig')).getTime() - new Date().getTime())/1000);
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
                        $scope.button.class = "button button-block button-large button-assertive" ;
                    }else if(hours > 0){
                        $scope.button.tex ='too early wait: ' +  hours + 'h ' +  minutes + 'm ' +  seconds + 's';
                        $scope.button.class = "button button-block button-large button-assertive" ;
                    }else if(minutes > 0){
                        $scope.button.tex = 'too early wait: ' + minutes + 'm ' + seconds + 's';
                        $scope.button.class = "button button-block button-large button-assertive" ;
                    }else if(seconds > 0){
                        $scope.button.tex = 'almost there wait: ' +  seconds + 's';
                        $scope.button.class = "button button-block button-large button-energized" ;
                    }
                }else{
                    $scope.button.tex = 'Ready' ;
                    $scope.button.class = "button button-block button-large button-balanced";

                }
            }else{
                $scope.message = "In learn period";
                $scope.button.class = "button button-block button-large  button-calm";
                $scope.button.tex = "Register a smoking time";
            }
            $timeout(tick, $scope.tickInterval);
        };


        $timeout(tick, $scope.tickInterval);




        function getMedian(data) {
            $scope.timeToAdd = 60/data + (parseInt($localStorage.get('timeFrame'))) ;
            $localStorage.set('nextCig', new Date($localStorage.get('lastCig')).addMinutes($scope.timeToAdd));
        }

        function setBaseLine(data){
            $scope.chartConfig.series[0].data = data;
        }
        function setMedian(data){
            $scope.chartConfig.series[1].data = data;
        }
        function insert() {
            if(((new Date($localStorage.get('firstCig'))).isLearnFinished(1)) === true){
                DataBase.InsertDate(new Date(), 'NotLearn');
                DataBase.setChartLastWeek('NotLearn', new Date(), setMedian);
                DataBase.getMedian(new Date(), getMedian);
            }else{
                DataBase.InsertDate(new Date(), 'Learn');
                DataBase.setChart('Learn', setBaseLine);
                DataBase.getMedian(new Date(), getMedian);
            }
            $localStorage.set('lastCig', new Date());
        } 

        $scope.click = function(){
            if($localStorage.get('firstCig')){
                insert();
            }else{
                $localStorage.set('firstCig', new Date());
                insert();
            }
        };

    });
});

appCtrl.controller('SettingsCtrl', function($scope, $localStorage){
    $scope.timeFrame = parseInt($localStorage.get('timeFrame'));
    $scope.price = parseFloat($localStorage.get('price'));
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
