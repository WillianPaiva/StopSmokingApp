var appCtrl = angular.module('starter.controllers', ['chart.js']);

appCtrl.controller('DashCtrl', function($scope, DataBase, $ionicPlatform, $localStorage, $timeout, cigTime, $ionicPopup) {
    $ionicPlatform.ready(function(){
        DataBase.setChartLastWeek(new Date(), setMedian);
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
            DataBase.setChart('Learn', setBaseLine);
            //setChartRange();
        }
        function insert() {
            if(cigTime.isLearnFinished($scope.learTime)){
                DataBase.InsertDate(new Date(), 'NotLearn');
                DataBase.setChartLastWeek(new Date(), setMedian);
                cigTime.setNextCig(new Date());
            }else{
                DataBase.InsertDate(new Date(), 'Learn');
                DataBase.setChartLastWeek(new Date(), setMedian);
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
        /****************
        *  comparator  *
        ****************/
        $scope.dateFrom = '12/12/2015';
        $scope.dateTo = '12/12/2015';
        $scope.datepickerObject = {
            titleLabel: 'Title',  //Optional
            todayLabel: 'Today',  //Optional
            closeLabel: 'Close',  //Optional
            setLabel: 'Set',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            //monthList:monthList,  //Optional
            templateType:'popup', //Optional
            modalHeaderColor:'bar-positive', //Optional
            modalFooterColor:'bar-positive', //Optional
            from: new Date(2015, 7, 2),   //Optional
            to: new Date(2015, 7, 29),    //Optional
            callback: function (val) {    //Mandatory
                datePickerCallback(val);
            }
        };

        var datePickerCallback = function (val) {
            if (typeof(val) === 'undefined') {
                console.log('No date selected');
            } else {
                console.log('Selected date is : ', val);
            }
        };



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
