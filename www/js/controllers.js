var appCtrl = angular.module('starter.controllers', ['highcharts-ng']);

appCtrl.controller('DashCtrl', function($scope, ChartCreate, pouchService, DataBase, $ionicPlatform) {
    $ionicPlatform.ready(function(){
    $scope.chartConfig = ChartCreate;
    //pouchService.db.destroy();

    //for(var x = -3; x < 4; x++){
        //var dat = new Date();
        //dat = dat.addDays(x);
        //for(var y = 0; y < 24; y++){
            //dat = dat.addMinutes(Math.floor((Math.random() * 60) + 30));
            //DataBase.InsertDate(dat, 'Learn');
        //}
    //}
    

    //for(var x = -3; x < 4; x++){
        //var dat = new Date();
        //dat = dat.addDays(x);
        //for(var y = 0; y < 24; y++){
            //dat = dat.addMinutes(Math.floor((Math.random() * 60) + 30));
            //DataBase.InsertDate(dat, 'NotLearn');
        //}
    //}
    
    function setBaseLine(data){
        $scope.chartConfig.series[0].data = data;
    }
    function setMedian(data){
        $scope.chartConfig.series[1].data = data;
    }

    DataBase.setChart('Learn', setBaseLine);
    DataBase.setChartLastWeek('NotLearn', new Date(), setMedian);
    

    DataBase.byStatus();
    DataBase.lastWeek();
    });
});


