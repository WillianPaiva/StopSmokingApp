var appVersion = "0.1.0";

var app = angular.module('starter', ['ionic', 'starter.directives', 'starter.controllers', 'starter.services',  'ionic.wizard', 'ng-mfb', 'ionic-datepicker', 'ngAnimate', 'ionic-material']);

app.run(function($ionicPlatform, DataBase) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }
        var admobid = {};
        // select the right Ad Id according to platform
        if( /(android)/i.test(navigator.userAgent) ) { 
            admobid = { // for Android
                banner: 'ca-app-pub-1276072278118519/5171040607',
                interstitial: ''
            };
        } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
            admobid = { // for iOS
                banner: 'ca-app-pub-1276072278118519/8124507002',
                interstitial: ''
            };
        } else {
            admobid = { // for Windows Phone
                banner: '',
                interstitial: ''
            };
        }
        //show admob banner at botton 
        if(window.AdMob){window.AdMob.createBanner( admobid.banner );}


    });
});

//app.run( function(pouchService , $localStorage){
//pouchService.db.destroy();
//$localStorage.destroy();
//}
//);

app.run(function($ionicPlatform, chartData){
    $ionicPlatform.ready(function(){
        chartData.queryChart(); 
    
    });
});




app.run( function($ionicPlatform, $state, DataBase, initialRun, $localStorage){
    $ionicPlatform.ready( function(){
        var state = "tab.dash";  // whatever, the main page of your app
        if (initialRun.isInitialRun()) {
            $localStorage.setObject('reasons',{'After Coffe':0, 'After sex':0, 'After Meal':0});
            initialRun.setInitialRun(false);
            state = "wizard.intro";
            DataBase.byStatus();
            DataBase.byDate();
            DataBase.allData();
            $localStorage.set('timeFrame', 10);
            $localStorage.set('learnTime', 3);
            $localStorage.set('price', 0.00);
            $localStorage.set('firstRun', true);
        }
        $state.go(state);
    });
}
);



app.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    .state('wizard', {
        url: '/wizard',
        abstract: true,
        template: '<ion-nav-view></ion-nav-view>'
    })

    .state('wizard.intro', {
        url: '/intro',
        templateUrl: 'templates/intro.html',
        controller: 'introCtrl'
    })


    // setup an abstract state for the tabs directive
    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
        url: '/dash',
        views: {
            'tab-dash': {
                templateUrl: 'templates/tab-dash.html',
                controller: 'DashCtrl'
            }
        }
    })

    .state('tab.charts', {
        url: '/charts',
        views: {
            'tab-charts': {
                templateUrl: 'templates/tab-charts.html',
                controller: 'ChartsCtrl'
            }
        }
    })

    .state('tab.eco', {
        url: '/eco',
        views: {
            'tab-eco': {
                templateUrl: 'templates/tab-eco.html',
                controller: 'EcoCtrl'
            }
        }
    })


    .state('tab.settings', {
        url: '/settings',
        views: {
            'tab-settings': {
                templateUrl: 'templates/tab-settings.html',
                controller: 'SettingsCtrl'
            }
        }
    });


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

});


//app.config(['ChartJsProvider', function (ChartJsProvider) {
    //// Configure all charts
    //ChartJsProvider.setOptions({
        //colours: ['#FF3300', '#3399FF'],
        //responsive: true,
        //animation : false,
        ////animationSteps: 10,
        ////animationEasing: "linear",
        ////showTooltips: false,
    //});
    //// Configure all line charts
    //ChartJsProvider.setOptions('Line', {
        //datasetFill: true
    //});
//}]);
