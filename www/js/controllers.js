var appCtrl = angular.module('starter.controllers', ['highcharts-ng']);

appCtrl.controller('DashCtrl', function($scope, ChartCreate, DataBase, $ionicPlatform, $localStorage, $timeout, cigTime) {
    $ionicPlatform.ready(function(){

        $scope.chartConfig = ChartCreate;
        DataBase.setChartLastWeek('NotLearn', new Date(), setMedian);
        DataBase.setChart('Learn', setBaseLine);
        $scope.button = {};
        $scope.button.class = "button button-block button-positive";
        $scope.button.tex = 'loading...';
        $scope.message = ""; 
        $scope.tickInterval = 1000;



        var tick = function(){
            var str = [];
            if(cigTime.isLearnFinished(1)){
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


        function setChartRange(beg,fin) {
            var range =  ['00', '01', '02', '03', '04', '05','06', '07', '08', '09', '10', '11' , '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
            range.splice(0,beg);
            range.splice((23-fin),fin);
            $scope.chartConfig.xAxis.categories = range;
        }


        function setBaseLine(data){
            var beg = 0;
            var fin = 0;
            for(var x = 0; x<24; x++){
                if(data[x] === 0){
                    beg++; 
                }else{
                    break;
                }
            }

            for(var y = 23 ; x>0 ; x--){
                if(data[x] === 0){
                    fin++; 
                }else{
                    break;
                }
            }
            data.splice(0,beg);
            data.splice((23-fin),fin);

            $scope.chartConfig.series[0].data = data;
            setChartRange(beg,fin);
        }
        function setMedian(data){
            var beg = 0;
            var fin = 0;
            for(var x = 0; x<24; x++){
                if(data[x] === 0){
                    beg++; 
                }else{
                    break;
                }
            }

            for(var y = 23 ; x>0 ; x--){
                if(data[x] === 0){
                    fin++; 
                }else{
                    break;
                }
            }
            data.splice(0,beg);
            data.splice((23-fin),fin);

            $scope.chartConfig.series[1].data = data;
            setChartRange(beg,fin);
        }
        function insert() {
            if(cigTime.isLearnFinished(1)){
                DataBase.InsertDate(new Date(), 'NotLearn');
                DataBase.setChartLastWeek('NotLearn', new Date(), setMedian);
                cigTime.setNextCig(new Date());
            }else{
                DataBase.InsertDate(new Date(), 'Learn');
                DataBase.setChart('Learn', setBaseLine);
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
