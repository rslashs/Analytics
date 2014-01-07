﻿angular.module("umbraco").controller("Analytics.CountryController",
    function ($scope, $location, statsResource, settingsResource, assetsService) {

        var profileID = "";

        $scope.loadingViews = true;

        assetsService.loadJs('http://www.google.com/jsapi')
            .then(function () {
                google.load("visualization", "1",
                {
                    callback: initChart,
                    packages: ['geochart']
                });
            });

        $scope.dateFilter = settingsResource.getDateFilter();

        $scope.$watch('dateFilter', function() {

            settingsResource.setDateFilter($scope.dateFilter.startDate, $scope.dateFilter.endDate);
            initChart();
        });
        
        function initChart() {
            //Get Profile
            settingsResource.getprofile().then(function(response) {
                $scope.profile  = response.data;
                profileID       = response.data.Id;

                if (profileID == null || profileID == "") {
                    $location.path("/analytics/analyticsTree/edit/settings");
                    return;
                }
                
                //Get Countires via statsResource - does WebAPI GET call
                statsResource.getcountries(profileID, $scope.dateFilter.startDate, $scope.dateFilter.endDate).then(function (response) {
                    $scope.data         = response.data.ApiResult;
                    $scope.loadingViews = false;

                    var chartData       = response.data.ChartData;
                    var chartMapData    = google.visualization.arrayToDataTable(chartData);

                    //Options for map (currently use defaults)
                    var options = {};

                    //Create the GeoChart with the countryChart DIV
                    var geochart = new google.visualization.GeoChart(document.getElementById('countryChart'));

                    //Draw the chart with the data & options
                    geochart.draw(chartMapData, options);

                });
            });
        };

    });