var appCtrl = angular.module('starter.controllers', ['highcharts-ng']);

appCtrl.controller('DashCtrl', function($scope, ChartCreate) {
    $scope.chartConfig = ChartCreate;
    for(var x = 0; x < 24; x++){
        $scope.chartConfig.series[0].data.push(Math.random());
        $scope.chartConfig.series[1].data.push(Math.random());
    }
});


