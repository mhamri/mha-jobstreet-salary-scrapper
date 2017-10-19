$(function () {
    "use strict";
    var calculateAverage = function (arr) {
        var sum = arr.reduce((previous, current) => current += previous);
        var avg = sum / arr.length;
        return avg;
    }

    var decomposeUrl = function (reportUrl) {
        var reportLine = reportUrl.replace(/^\.\//, '');
        var reportParts = reportLine.split('/');
        var reportDate = reportParts[1];
        var language = reportParts[2].replace(".json", "");
        var chartid = (reportDate + language).replace(/[\W]/g, '');
        return [reportDate, language, chartid];
    }

    $.get("reports/reports.json", function (reports) {
        for (var i = 0; i < reports.length; i++) {
            var language, reportDate, chartid;
            [reportDate, language, chartid] = decomposeUrl(reports[i]);
            $("#main").append(
                "<div>" +
                "<h2>" + language + " - " + reportDate + "</h2>" +
                "<canvas id='" + chartid + "' width='400 height='400'></canvas>" +
                "</div>"
            );

            $.get(encodeURIComponent(reports[i]), function (data) {
                var language, reportDate, chartid;
                [reportDate, language, chartid] = decomposeUrl(decodeURIComponent(this.url));


                var min = [], max = [], labels = [];
                data = data.sort(function (first, second) {
                    var a = Number(first.min);
                    var b = Number(second.min);
                    if (a > b) return 1;
                    if (a < b) return -1;
                    if (a == b) return 0;
                });

                for (var j = 0; j < data.length; j++) {
                    var salary = data[j];
                    min.push(Number(salary.min));
                    max.push(Number(salary.max));
                    labels.push(salary.min + "-" + salary.max);
                }



                var linspace = function linspace(a, b, n) {
                    if (typeof n === "undefined") n = Math.max(Math.round(b - a) + 1, 1);
                    if (n < 2) { return n === 1 ? [a] : []; }
                    var i, ret = Array(n);
                    n--;
                    for (i = n; i >= 0; i--) { ret[i] = (i * b + (n - i) * a) / n; }
                    return ret;
                }

                var histogramMin = histogram({
                    data: min,
                    bins: min
                });

                var histogramMax = histogram({
                    data: max,
                    bins: max
                });


                var minAvg = calculateAverage(min);
                var maxAvg = calculateAverage(max);

                window.mhajssc = window.mhajssc || {};
                var chart = $('#' + chartid);

                window.mhajssc[chartid] = new Chart(chart, {

                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                yAxisID: 'left-y-axis',
                                label: language + "-min",
                                data: min,
                                backgroundColor: "rgba(255, 99, 132, 0.2)",
                                borderColor: "rgba(255, 99, 132, 0.2)",


                            },
                            {
                                yAxisID: 'left-y-axis',
                                label: language + "-max",
                                data: max,
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                borderColor: 'rgba(75, 192, 192, 0.2)'

                            },
                            {
                                yAxisID: 'left-y-axis',
                                label: "min-avg",
                                data: Array.apply(null, Array(min.length)).map(function () { return minAvg }),

                                fill: false,
                                borderColor: 'rgba(255,99,132,1)',
                                backgroundColor: 'rgba(255,99,132,1)'
                            },
                            {
                                yAxisID: 'left-y-axis',
                                label: "max-avg",
                                data: Array.apply(null, Array(max.length)).map(function () { return maxAvg }),
                                fill: false,
                                borderColor: 'rgba(75, 192, 192, 1)',
                                backgroundColor: 'rgba(75, 192, 192, 1)'

                            },
                            {
                                yAxisID: 'right-y-axis',
                                label: "frequency-min",
                                data: histogramMin,
                                borderColor: 'rgba(153, 102, 255, 0.2)',
                                backgroundColor: 'rgba(153, 102, 255, 0.2)'


                            },
                            {
                                yAxisID: 'right-y-axis',
                                label: "frequency-max",
                                data: histogramMax,
                                borderColor: 'rgba(75, 192, 192, 1)',
                                backgroundColor: 'rgba(75, 192, 192, 1)'
                            },
                        ]
                    },
                    options: {
                        tooltips: {
                            intersect: false,
                            titleFontSize: 20,
                            bodyFontSize: 20,
                            callbacks: {
                                title: function (tooltipItem, data) {
                                    var tooltip = tooltipItem["0"];
                                    var dataset = data.datasets[tooltip.datasetIndex];
                                    var label = dataset.label;
                                    var labelParts = label.split('-');
                                    var minOrMax = labelParts[labelParts.length - 1];
                                    var result = "";
                                    if (labelParts[0] == "frequency") {
                                        debugger;
                                        var datapool = data.datasets[tooltip.datasetIndex];
                                        var searchIndex = tooltip.index;
                                        var lowerBoundry = 0, upperBoundry = 0;
                                        while (datapool.data[searchIndex] && datapool.data[searchIndex].y && datapool.data[searchIndex].y != 0) {
                                            searchIndex--;
                                            if (datapool.data[searchIndex] && datapool.data[searchIndex].y == 0) {
                                                lowerBoundry = datapool.data[searchIndex].x;
                                            }
                                        }
                                        var searchIndex = tooltip.index;
                                        while (datapool.data[searchIndex] && datapool.data[searchIndex].y != 0) {
                                            searchIndex++;
                                            if (datapool.data[searchIndex] && datapool.data[searchIndex].y == 0) {
                                                upperBoundry = datapool.data[searchIndex].x;
                                            }
                                        }

                                        if (lowerBoundry != 0 && upperBoundry == 0) {
                                            result += '>=' + lowerBoundry + ' | ';
                                        }
                                        else if (lowerBoundry == 0 && upperBoundry != 0) {
                                            result += '<=' + upperBoundry + ' | ';
                                        }
                                        else {
                                            result += lowerBoundry + ' - ' + upperBoundry + ' | ';
                                        }
                                    }
                                    switch (minOrMax) {
                                        case "min":
                                            result += tooltip.xLabel.split('-')[0]
                                            break;
                                        case "max":
                                            result += tooltip.xLabel.split('-')[1]
                                            break;

                                        default:
                                            result += tooltip.xLabel;
                                            break;
                                    }

                                    if (label == "max-avg" || label == "min-avg") {
                                        return "";
                                    }

                                    return result;
                                }
                            }
                        },
                        scales: {
                            yAxes: [{
                                id: 'left-y-axis',
                                type: 'linear',
                                position: 'left',

                            }, {
                                id: 'right-y-axis',
                                type: 'linear',
                                position: 'right',
                                display: true,
                                labelString: 'frequnecy'
                            }]
                        }
                    }

                });

            });
        }
    })

});