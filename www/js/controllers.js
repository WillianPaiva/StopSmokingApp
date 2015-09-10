//$scope.chartHTML = $sce.trustAsHtml('<canvas id="comparator" class="chart chart-line" data="compData" labels="compLabels" legend="true" series="compSeries" ></canvas>');
var appCtrl = angular.module('starter.controllers', ['ngSanitize','angular-chartist']);

function dashcontoler($ionicPlatform, $ionicPopup, $localStorage, $scope, $timeout, DataBase, buttonTimeOut, chart, chartData, cigTime, ionicMaterialInk, ionicMaterialMotion) {
    $ionicPlatform.ready(function(){
        /**************************
        *  chart configuration   *
        **************************/
        $scope.cigButtonDisable = false;
        $scope.type = 'Line';
        $scope.lineData = {
            series:[] 
        };
        $scope.heightMainChart = $scope.lineData.series.length ;
        $scope.lineOptions = chart.options($scope.heightMainChart); 
        $scope.ResponsiveOptions = chart.ResponsiveOptions(); 
        $scope.event = {
            draw: function eventHandler(data) {
                if(data.type === 'line' || data.type === 'area') {
                    data.element.animate({
                        d: {
                            begin: 500 * data.index,
                            dur: 1000,
                            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
                            to: data.path.clone().stringify(),
                            easing: Chartist.Svg.Easing.easeOutQuint
                        }
                    });
                }
            }
        };
        //load the chart data upon event
        $scope.$on('$mainChartData.loaded', function(event, data){
            $scope.lineData = data;
            $scope.heightMainChart = $scope.lineData.series.length ;
            $scope.lineOptions = chart.options($scope.heightMainChart); 
        });
        /***********************************************
        *  main insert cig button config and timers   *
        ***********************************************/
        $scope.button = {};
        $scope.button.class = "col button button-raised button-positive";
        $scope.button.tex = 'loading...';
        $scope.showCravingPopup = false;
        $scope.$on('$button.refreshed', function(event, data){
            $scope.button = data.button;
            $scope.showCravingPopup = data.cravingPopup;
        });
        /*****************
        *  undo button  *
        *****************/
        $scope.undoButton = function(){
            DataBase.deleteItem($localStorage.getObject('lastEntrance'));    
            chartData.queryChart();
        };
        /****************************************
        *  function to insert data on the db   *
        ****************************************/
        function timeOutButton(){
            $scope.cigButtonDisable = true;
            $timeout(function() {
                $scope.cigButtonDisable = false;
            }, 5000); 
        }
        function insert() {
            if(cigTime.isLearnFinished($localStorage.get('learnTime'))){
                DataBase.InsertDate(new Date(), 'NotLearn');
                cigTime.setNextCig(new Date());
            }else{
                DataBase.InsertDate(new Date(), 'Learn');
            }
            $localStorage.set('lastCig', new Date());
            if($scope.showCravingPopup === true){
                $scope.cravingPopup();
            }
            chartData.queryChart();
            timeOutButton();
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
        $scope.toogleCompChart = false;
        /******************
        *  cravin popup  *
        ******************/
        $scope.reasons = $localStorage.getObject('reasons');
        console.log($scope.reasons);
        $scope.reason = '';
        $scope.setReason = function(reason){
            $scope.reason = reason;
        };
        $scope.cravingReasonInsert = function(reason){
            var temp = $localStorage.getObject('reasons');
            if(!(temp.hasOwnProperty(reason))){
                temp[reason] = 1;
                $localStorage.setObject('reasons',temp) ;
            }else{
                temp[reason]++;
                $localStorage.setObject('reasons',temp) ;
            }
            $scope.reasons = $localStorage.getObject('reasons');
        };
        $scope.insertNewReason = function(reason){
            console.log(reason);
            var temp = $localStorage.getObject('reasons');
            if(!(temp.hasOwnProperty(reason))){
                temp[reason]=0;
                console.log(temp);
                $localStorage.setObject('reasons',temp) ;
            }else{
                alert(reason + ' already exists');
            }
            $scope.reasons = $localStorage.getObject('reasons');
        };
        $scope.cravingPopup = function(){
            var craPopup = $ionicPopup.show({
                templateUrl: 'templates/CravinReasonSelect.html',
                title: 'enter a why you cant resist you piece of shit',
                scope: $scope,
                buttons:[
                    {
                        text: 'Select',
                        type: 'button-assertive',
                        onTap: function(){
                            $scope.cravingReasonInsert($scope.reason);
                        }
                    },
                ],
            });
        }        ;
        // Set Motion
        $timeout(function() {
            ionicMaterialMotion.fadeSlideIn({
            });
        }, 200);
        ionicMaterialInk.displayEffect();
    });
}

var dashArgs =
[
    '$ionicPlatform',
    '$ionicPopup',
    '$localStorage',
    '$scope',
    '$timeout',
    'DataBase',
    'buttonTimeOut',
    'chart',
    'chartData',
    'cigTime',
    'ionicMaterialInk',
    'ionicMaterialMotion',
    dashcontoler
];

appCtrl.controller( 'DashCtrl', dashArgs);

function ecoController(ionicMaterialInk, ionicMaterialMotion, $timeout, $localStorage, $scope, DataBase, chart){
    /************************
     *  line chart config   *
     ************************/
    
    $scope.type = 'line';
    $scope.x = 0;
    $scope.lineData = { 
        series: []
    };
    $scope.axis = [];
    $scope.heightMainChart = $scope.lineData.series.length ;
    $scope.lineOptions = chart.optionsLineWithAxisX($scope.heightMainChart,$scope.axis); 
    $scope.ResponsiveOptions = chart.ResponsiveOptions(); 
    $scope.event = {
        draw: function eventHandler(data) {
            if(data.type === 'line' || data.type === 'area') {
                data.element.animate({
                    d: {
                        begin: 500 * data.index,
                        dur: 1000,
                        from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
                        to: data.path.clone().stringify(),
                        easing: Chartist.Svg.Easing.easeOutQuint
                    }
                });
            }
        }
    };


    /***************
     *  set Price  *
     ***************/
    
    $scope.price = parseFloat($localStorage.get('price')) ;
    $scope.submitPrice = function(data){
        $localStorage.set('price', data);
        DataBase.getMonths(getdata);
    };



    function getdata(data) {
        $scope.axis = [];
        $scope.x = 0;
        $scope.data = [];
        $scope.lineData = { 
            series: []
        };
        startup(data);
    }
    function startup(data){
        if(data.length > 0){
            DataBase.getMothExpense(data,insertSerie);
        }else{
        $scope.lineData.series.push($scope.data);
        console.log($scope.lineData.series);
        $scope.heightMainChart = $scope.lineData.series.length ;
        $scope.lineOptions = chart.optionsLineWithAxisX($scope.heightMainChart,$scope.axis); 
        
        }

    }
    function insertSerie(label,value,data){
        $scope.axis.push(label);
        $scope.data.push({name:'Expenses',x:$scope.x,y:value});
        $scope.x++;
        startup(data);
    }
    $scope.$watch('serie', function(){
        $scope.data = [$scope.serie];

    });
    DataBase.getMonths(getdata);
    //$scope.$on("$ionicView.afterLeave", function () {
    //$ionicHistory.clearCache();
    //}); 

    $timeout(function() {
        ionicMaterialMotion.fadeSlideIn({
        });
    }, 200);

    ionicMaterialInk.displayEffect();
}

var ecoArgs =
[
    'ionicMaterialInk',
    'ionicMaterialMotion',
    '$timeout',
    '$localStorage',
    '$scope',
    'DataBase',
    'chart',
    ecoController
];

appCtrl.controller('EcoCtrl',ecoArgs );

function settingsController($ionicPopup, $localStorage, $scope, $window, DataBase, pouchService){
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

}
var settingsArgs =
[
    '$ionicPopup',
    '$localStorage',
    '$scope',
    '$window',
    'DataBase',
    'pouchService',
    settingsController
];
appCtrl.controller('SettingsCtrl',settingsArgs );

function introController($ionicPopup, $scope, $state) {
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
}
var introArgs =
[
'$ionicPopup',
'$scope',
'$state',
introController
];
appCtrl.controller('introCtrl', introArgs );
