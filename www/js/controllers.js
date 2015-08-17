var appCtrl = angular.module('starter.controllers', ['highcharts-ng']);

appCtrl.controller('DashCtrl', function($scope, ChartCreate, DataBase, $ionicPlatform, $localStorage) {
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
        function insert() {
            if(((new Date($localStorage.get('firstCig'))).isLearnFinished(1)) === true){
                DataBase.InsertDate(new Date(), 'NotLearn');
                DataBase.setChartLastWeek('NotLearn', new Date(), setMedian);
            }else{
                DataBase.InsertDate(new Date(), 'Learn');
                DataBase.setChart('Learn', setBaseLine);
            }
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
