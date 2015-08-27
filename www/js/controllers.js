//$scope.chartHTML = $sce.trustAsHtml('<canvas id="comparator" class="chart chart-line" data="compData" labels="compLabels" legend="true" series="compSeries" ></canvas>');
var appCtrl = angular.module('starter.controllers', ['ngSanitize','angular-chartist']);

appCtrl.controller('DashCtrl', function( $ionicLoading, $scope, DataBase, $ionicPlatform, $localStorage, $timeout, cigTime, $ionicPopup, chart, $rootScope, ionicMaterialInk, ionicMaterialMotion ) {
    /****************************
    *  comparator date picker  *
    ****************************/
    $scope.datepickerObject = {
        //titleLabel: 'Select a Day to plot',  //Optional
        todayLabel: 'Today',  //Optional
        closeLabel: 'Close',  //Optional
        setLabel: 'Set',  //Optional
        errorMsgLabel : 'Please select time.',    //Optional
        setButtonType : 'button-assertive',  //Optional
        inputDate: new Date(),    //Optional
        mondayFirst: true,    //Optional
        //disabledDates: disabledDates, //Optional
        //weekDaysList: weekDaysList,   //Optional
        //monthList: monthList, //Optional
        templateType: 'popup', //Optional
        modalHeaderColor: 'bar-positive', //Optional
        modalFooterColor: 'bar-positive', //Optional
        from: new Date($localStorage.get('firstCig')),   //Optional
        to: new Date(),    //Optional
        callback: function (val) {    //Mandatory
            $scope.insertDate(val);
        }
    };

    $ionicPlatform.ready(function(){
        /********************
        *  load chart data *
        *******************/

        DataBase.setChartLastWeek(new Date(), setMedian);



        /**************************
        *  chart configuration   *
        **************************/

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






        /***********************************************
        *  main insert cig button config and timers   *
        ***********************************************/

        $scope.button = {};
        $scope.button.class = "col button button-raised button-positive";
        $scope.button.tex = 'loading...';
        $scope.message = ""; 
        $scope.tickInterval = 1000;
        $scope.chartBaseline = [0];
        $scope.chartLastWeek = [0];        
        $scope.showCravingPopup = false;
        var tick = function(){
            if(cigTime.isLearnFinished($localStorage.get('learnTime'))){
                if(cigTime.getNextCig().getTime() > new Date().getTime()){
                    $scope.showCravingPopup = true;
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
                        $scope.button.class = "col button button-raised button-large button-assertive" ;
                    }else if(hours > 0){
                        $scope.button.tex ='too early wait: ' +  hours + 'h ' +  minutes + 'm ' +  seconds + 's';
                        $scope.button.class = "col button button-raised button-large button-assertive" ;
                    }else if(minutes > 0){
                        $scope.button.tex = 'too early wait: ' + minutes + 'm ' + seconds + 's';
                        $scope.button.class = "col button button-raised button-large button-assertive" ;
                    }else if(seconds > 0){
                        $scope.button.tex = 'almost there wait: ' +  seconds + 's';
                        $scope.button.class = "col button button-raised button-large button-energized" ;
                    }
                }else{
                    $scope.showCravingPopup = false;
                    $scope.button.tex = 'Ready' ;
                    $scope.button.class = "col button button-raised button-balanced";


                }
            }else{
                $scope.showCravingPopup = false;
                $scope.message = "In learn period";
                $scope.button.class = "col button button-raised button-large button-calm";
                $scope.button.tex = "Register a smoking time";
            }
            $timeout(tick, $scope.tickInterval);
        };


        $timeout(tick, $scope.tickInterval);






        /***********************************************
        *  callback functions to load the chart data  *
        ***********************************************/

        function setBaseLine(data){
            chart.data('Base Line', data,pushData);
            $timeout(function() {
                ionicMaterialMotion.fadeSlideIn({
                    selector: '.animate-fade-slide-in .item'
                });
            }, 200);

        }
        $scope.$on('$ionicView.enter', function(){
            ionicMaterialInk.displayEffect();
            ionicMaterialMotion.fadeSlideIn({
                selector: '.animate-fade-slide-in .item'
            });
        });
        function setMedian(data){
            $scope.lineData.series = [] ;
            chart.data('Last Week', data,pushData);
            DataBase.setChart('Learn', setBaseLine);
        }
        /****************************************
        *  function to insert data on the db   *
        ****************************************/

        function insert() {
            if(cigTime.isLearnFinished($localStorage.get('learnTime'))){
                DataBase.InsertDate(new Date(), 'NotLearn');
                DataBase.setChartLastWeek(new Date(), setMedian);
                cigTime.setNextCig(new Date());
            }else{
                DataBase.InsertDate(new Date(), 'Learn');
                DataBase.setChartLastWeek(new Date(), setMedian);
            }
            $localStorage.set('lastCig', new Date());
            if($scope.showCravingPopup === true){
                $scope.cravingPopup();
            }
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
        /****************************
        *  comparator date picker  *
        ****************************/
        $scope.datepickerObject = {
            //titleLabel: 'Select a Day to plot',  //Optional
            todayLabel: 'Today',  //Optional
            closeLabel: 'Close',  //Optional
            setLabel: 'Set',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates: disabledDates, //Optional
            //weekDaysList: weekDaysList,   //Optional
            //monthList: monthList, //Optional
            templateType: 'popup', //Optional
            modalHeaderColor: 'bar-positive', //Optional
            modalFooterColor: 'bar-positive', //Optional
            from: new Date($localStorage.get('firstCig')),   //Optional
            to: new Date(),    //Optional
            callback: function (val) {    //Mandatory
                $scope.insertDate(val);
            }
        };
        /**************************************************
        *  chart configuration for the comparator chart  *
        **************************************************/

        $scope.lineDataComp = {
            series:[] 
        };
        $scope.heightCompChart = $scope.lineDataComp.series.length ;
        $scope.DateToInsert = new Date();    
        $scope.insertDate = function(d){
            if (typeof(d) === 'undefined') {
                console.log('No date selected');
            } else {
                $scope.toogleCompChart = true;
                DataBase.getAllDay(d,isertDateOnChart);
            }
        };
        var test = false;
        $scope.lineCompOptions = chart.options($scope.heightCompChart); 


        /*******************************************
        *  callback functions to load chart data  *
        *******************************************/

        function isertDateOnChart(serie,data){
            chart.data(serie, data, insertSerie);
        }

        /****************************************************
        *  funtion to insert a date an lunch the db query  *
        ****************************************************/

        function insertSerie(data){
            $scope.lineDataComp.series.push(data);
            $scope.heightCompChart = $scope.lineDataComp.series.length ;
            $scope.lineCompOptions = chart.options($scope.heightCompChart); 
        }
        /********************************
        *  clear the comparator chart  *
        ********************************/
        $scope.removeItem = function(index){
            console.log(index);
            $scope.lineDataComp.series.splice(index,1);
            $scope.heightCompChart = $scope.lineDataComp.series.length ;
            $scope.lineCompOptions = chart.options($scope.heightCompChart); 
            if($scope.lineDataComp.series.length === 0){
                $scope.toogleCompChart = false;
            }


        };

        $scope.clearData = function(){
            $scope.lineDataComp = {
                series:[]
            };
            $scope.heightCompChart = $scope.lineDataComp.series.length ;
            $scope.lineCompOptions = chart.options($scope.heightCompChart); 

        };
        $scope.removePopup = function(){
            var remPopup = $ionicPopup.show({
                templateUrl: 'templates/removeDatePopUp.html',
                title: 'remove date',
                scope: $scope,
                buttons:[
                    {
                        text: 'Remove All',
                        type: 'button-assertive',
                        onTap: function(){
                            $scope.lineDataComp = {
                                series:[]
                            };
                            $scope.heightCompChart = $scope.lineDataComp.series.length ;
                            $scope.lineCompOptions = chart.options($scope.heightCompChart); 
                            $scope.toogleCompChart = false;
                        }
                    },
                    {
                        text: 'Finish',
                        type: 'button-positive',
                    },

                ],


            });
        }        ;
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
        ionicMaterialInk.displayEffect();
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
