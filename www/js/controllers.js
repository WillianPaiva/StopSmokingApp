var appCtrl = angular.module('starter.controllers', ['highcharts-ng']);

appCtrl.controller('DashCtrl', function($scope, ChartCreate, DataBase, $ionicPlatform, pouchService) {
    $ionicPlatform.ready(function(){
        $scope.chartConfig = ChartCreate;
        DataBase.setChart('Learn', setBaseLine);
        DataBase.setChartLastWeek('NotLearn', new Date(), setMedian);
        $scope.button = {};
        $scope.button.class = "button button-block button-positive";
        $scope.button.tex = 'text';
        function setBaseLine(data){
            $scope.chartConfig.series[0].data = data;
        }
        function setMedian(data){
            $scope.chartConfig.series[1].data = data;
        }
        $scope.click = function(){
            DataBase.InsertDate(new Date(), 'Learn');
            DataBase.setChart('Learn', setBaseLine);
            DataBase.setChartLastWeek('NotLearn', new Date(), setMedian);
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
