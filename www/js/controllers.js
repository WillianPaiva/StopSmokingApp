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
            console.log($scope.timeToAdd);
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
