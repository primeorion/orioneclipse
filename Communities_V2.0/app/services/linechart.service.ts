import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as d3 from 'd3';

@Injectable()
export class LineChartService {

    public renderLineChart(DomElement, lineData, SelectedTimeFrame, colorInfo, modelName) {
        var that = this;
        //define parameters for the chart
        var DataArray = [];
        var TempDataArray = [];
        var lineHeight = 500;
        var lineWidth = document.documentElement.clientWidth - 300;
        var marginleft = 20;
        var marginright = 20;
        var margintop = 20;
        var marginbottom = 40;
        var marginbottomForxlabels = 120;
        var linemargin = 80;
        var axislength = lineWidth - 100;
        var marginTopForText = 605;
        var XaxisTick; //to define ticks of x axis 
        var XtickRange = undefined; // to define difference between ticks 
        var ymin;
        var ymax;
        var maxArray = [];
        var minArray = [];
        var xmin;
        var xmax;
        var XmaxArray = [];
        var XminArray = [];
        var tickFormat;


        for (var k = 0; k < lineData.length; k++) {

            var tempData = lineData[k].dailyStatistics;

            for (var m = 0; m < tempData.length; m++) {
                var tempData2 = tempData[m];
                DataArray.push({
                    'x': tempData2.date,
                    'y': tempData2.distribution + tempData2.contribution,
                    'name': lineData[k].name

                })
            }
        };


        var nestedData = d3.nest()
            .key(<any>function (d) {
                return d.name;
            })
            .entries(DataArray)

        //function to set x axis interval according to days
        function d3_time_range(floor, step, number) {

            return function (t0, t1, dt) {
                var time = floor(t0), times = [];
                if (time < t0) step(time);
                if (dt > 1) {
                    while (time < t1) {
                        var date = new Date(+time);
                        if (!(number(date) % dt)) times.push(date);
                        step(time);
                    }
                } else {
                    while (time < t1) times.push(new Date(+time)), step(time);
                }
                return times;
            };
        }

        d3.time['daysTotal'] = d3_time_range(d3.time.day, function (date) {
            date.setDate(date.getDate() + 1);

        }
            , function (date) {

                return ~~(date / 86400000);
            });


        //defining x scale
        var linexscale = d3.time.scale()
            .range([0, axislength]);

        //defining y scale
        var lineyscale = d3.scale.linear()
            .range([lineHeight, 0]);
        var lineColor = d3.scale.ordinal().range(colorInfo);

        //finding min and max of x and y from all lineData 

        for (var n = 0; n < nestedData.length; n++) {
            var tempData3 = nestedData[n].values;
            ymax = d3.max(tempData3, function (d) { return d["y"] });
            ymin = d3.min(tempData3, function (d) { return d["y"] });

            maxArray.push(ymax)
            minArray.push(ymin)

            xmax = d3.max(tempData3, function (d) { return new Date(d["x"]) });
            xmin = d3.min(tempData3, function (d) { return new Date(d["x"]) });

            XmaxArray.push(xmax)
            XminArray.push(xmin)
        };



        var ydomainMax = Math.max.apply(null, maxArray);
        // var ydomainMin = Math.min.apply(null, minArray);
        var ydomainMin = 0;
        var yext = [ydomainMin, ydomainMax]
        var xdomainMax = Math.max.apply(null, XmaxArray);
        var xdomainMin = Math.min.apply(null, XminArray);
        var xext = [xdomainMin, xdomainMax];

        //rearrange X-scale accroding to selected time range from dropdown
        var tickArray = [];
        if (SelectedTimeFrame == 'Daily') {
            XaxisTick = d3.time.days;
            XtickRange = 2;
            tickFormat = d3.time.format("%m/%d/%y");
            renderChart(XaxisTick, XtickRange, tickFormat);
        }
        else if (SelectedTimeFrame == 'Weekly') {
            XaxisTick = d3.time.weeks;
            XtickRange = undefined;
            tickFormat = d3.time.format("%m/%d/%y");
            renderChart(XaxisTick, XtickRange, tickFormat);
        }
        else if (SelectedTimeFrame == 'Monthly') {
            XaxisTick = d3.time.months;
            XtickRange = undefined;
            tickFormat = d3.time.format("%b'%y");
            renderChart(XaxisTick, XtickRange, tickFormat);
        }
        else if (SelectedTimeFrame == 'Quarterly') {
            XaxisTick = d3.time.months;
            XtickRange = 90;
            tickFormat = d3.time.format("%b'%y");
            // tickArray = ['03/01/2016', '06/01/2016', '9/01/2016', '12/01/2016']
            renderChart(XaxisTick, XtickRange, tickFormat);
        } else if (SelectedTimeFrame == 'Custom') {
            var startDate = new Date(xdomainMin);
            var endDate = new Date(xdomainMax);
            var diffofDate = calcDate(endDate, startDate)

            if (diffofDate <= 30) {
                XaxisTick = d3.time.days;
                XtickRange = 2;
                tickFormat = d3.time.format("%m/%d/%y");
                renderChart(XaxisTick, XtickRange, tickFormat);

            } else if (30 < diffofDate && diffofDate <= 365) {
                XaxisTick = d3.time.month;
                XtickRange = undefined;
                tickFormat = d3.time.format("%b'%y");
                renderChart(XaxisTick, XtickRange, tickFormat);
            } else if (diffofDate > 365) {
                XaxisTick = d3.time.year;
                XtickRange = undefined;
                tickFormat = d3.time.format("%m'%y");
                renderChart(XaxisTick, XtickRange, tickFormat);
            }


        } else {
            //render chart
            XaxisTick = d3.time.days;
            XtickRange = 2;
            tickFormat = d3.time.format("%m/%d/%y");
            renderChart(XaxisTick, XtickRange, tickFormat);
        }
        function calcDate(date1, date2) {
            var diff = Math.floor(date1.getTime() - date2.getTime());
            var day = 1000 * 60 * 60 * 24;

            var days = Math.floor(diff / day);
            var months = Math.floor(days / 31);
            var years = Math.floor(months / 12);

            return days;
        }



        //function for plotting chart
        function renderChart(XaxisTick, XtickRange, tickFormat) {

            //remove svg //
            d3.select('.LineSvgTimeScale').remove();
            //create svg for the chart
            var lineSvg = d3.select(DomElement).append("svg")
                .attr("height", lineHeight + margintop + marginbottom + marginbottomForxlabels)
                .attr("width", lineWidth + marginleft + marginright)
                .attr("class", "LineSvgTimeScale")
                .append("g")

            linexscale.domain(xext);
            lineyscale.domain(yext);
            //change xaxis accroding to timerange

            if (XtickRange) {
                var linexaxis = d3.svg.axis()
                    .scale(linexscale)
                    .orient("bottom")
                    .innerTickSize(-lineHeight)
                    .outerTickSize(0)
                    .tickPadding(10)
                    .ticks(XaxisTick)
                    .ticks(d3.time['daysTotal'], XtickRange)
                    .tickFormat(<any>function (d, i) {
                        var parse = tickFormat;
                        return parse(new Date(d));
                    })
            } else {
                var linexaxis = d3.svg.axis()
                    .scale(linexscale)
                    .orient("bottom")
                    .innerTickSize(-lineHeight)
                    .outerTickSize(0)
                    .tickPadding(10)
                    .ticks(XaxisTick)
                    .tickFormat(<any>function (d, i) {
                        var parse = tickFormat;
                        return parse(new Date(d));
                    })

            }

            var lineyaxis = d3.svg.axis()
                .scale(lineyscale)
                .orient("left")
                .innerTickSize(-axislength)
                .outerTickSize(0)
                .tickPadding(10)
                .tickFormat(d3.format("s"))


            var line = d3.svg.line()
                .x(function (d) {
                    return linexscale(<any>new Date(d["x"]))
                })
                .y(function (d) { return lineyscale(d["y"]) })
                .interpolate('linear')
            //call x axis
            lineSvg.append("g")
                .attr("class", "linexaxis")
                .attr("transform", "translate(" + linemargin + "," + (lineHeight + margintop) + ")")
                .call(linexaxis)

            lineSvg.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function (d) {
                    return "rotate(-65)"
                });
            lineSvg.append('text')
                .attr('transform', "translate(" + ((lineWidth - 160) / 2) + "," + (marginTopForText) + ")")
                .text("Days")
                .style('fill', '#c8c8c8');

            // .append('text')
            // .attr('transform', "translate(" + ((lineWidth - 160) / 2) + "," + (marginTopForText) + ")")
            // .text("Days")
            //customize the x axis line
            d3.selectAll('.linexaxis line').style("fill", "none")
                .style("stroke", "#c8c8c8")
                .style("stroke-width", 0.2)
            //customize x axis text
            d3.selectAll('.linexaxis text')
                .style("fill", "#c8c8c8");

            //call y axis
            lineSvg.append("g")
                .attr("class", "lineyaxis")
                .call(lineyaxis)
                .attr("transform", "translate(" + linemargin + "," + marginright + ")")
                .append('text')
                .attr('transform', "translate(" + -(marginbottom) + "," + -(marginleft / 2) + ")")
                .text("Value")
            //customize the y axis line
            d3.selectAll('.lineyaxis line').style("fill", "none")
                .style("stroke", "#c8c8c8")
                .style("stroke-width", 0.4)
            //customize y axis text
            d3.selectAll('.lineyaxis text')
                .style("fill", "#c8c8c8")
            //looping all line data for every  lines

            // var ToolTip = d3.select('.lineChartDiv').append('div')
            //     .style('display', 'none');

            for (var j = 0; j < nestedData.length; j++) {

                var LineG = lineSvg.append('g').datum(nestedData[j].values).attr('class', 'LineGelement')

                var path = LineG.append("path")
                    .attr("class", "line")
                    .attr("d", line)
                    .attr("transform", "translate(" + linemargin + "," + margintop + ")")
                    .attr("fill", "none")
                    .attr("stroke", <any>function (d) {
                        return lineColor(j.toString());
                    })
                    .style("stroke-width", 1.5)
                    .style('cursor', "pointer")
                    .on('mouseover', function (d) {
                        d3.select(this).style('stroke-width', "4px");
                    })
                    .on('mouseout', function (d) {
                        d3.select(this).style('stroke-width', "1.5px");
                    })



                //find the total length of path for animation
                if (path && path.node()) {
                    var totalLength = <any>path.node();
                    totalLength = totalLength.getTotalLength();

                    path.attr("stroke-dasharray", totalLength + " " + totalLength)
                        .attr("stroke-dashoffset", totalLength)
                        .transition()
                        .duration(2000)
                        .ease("linear")
                        .attr("stroke-dashoffset", 0);
                }
                LineG.selectAll('.data-point')
                    .data(nestedData[j].values)
                    .enter()
                    .append('circle')
                    .attr('class', 'data-point')
                    .attr('cx', <any>function (d) {
                        return linexscale(<any>new Date(d["x"])) + linemargin;
                    })
                    .attr('cy', function (d) {
                        return lineyscale(d["y"]) + margintop;
                    })
                    .attr('r', <any>function (d, i) {

                        if (i == 0) {
                            return 5
                        } else {
                            return 2.5;
                        }
                    })
                    .attr('fill', <any>function (d, i) {
                        if (i == 0) {
                            return 'black'
                        } else {
                            return lineColor(j.toString());
                        }
                    })
                    .style('opacity', 1)
                    .style('stroke', <any>function (d, i) {
                        if (i == 0) {
                            return "white";
                        } else {
                            return "none";
                        }
                    })
                    .style('stroke-width', <any>function (d, i) {
                        if (i == 0) {
                            return 3;
                        } else {
                            return 0;
                        }
                    })
                    .style('cursor', 'pointer')
                    .on('mouseover', function (d) {
                        var paddingLeft = 10 * marginleft;
                        var paddingTop = 5 * margintop;
                        var dateFormat = d3.time.format("%m/%d/%y");

                        d3.select('.Tooltip_lineChart')
                            .style('display', 'block')
                            .style("position", "absolute")
                            .style("left", linexscale(that.ConvertToUtcDate(d['x'])) + paddingLeft + "px")
                            .style("top", lineyscale(d['y']) + paddingTop + "px")
                            .style('width', '155px')
                            .style("background-color", "white")
                            .style("color", "black")
                            .style('height', '100px')
                            .style("font-weight", "bold");

                        d3.select('.Date_value_line').text(dateFormat(that.ConvertToUtcDate(d['x'])));
                        d3.select('.CashFlow_value_line').text('$' + d3.format(",")(d["y"]));
                        d3.select('.Name_value_line').text(d['name']);

                    })
                    .on('mouseout', function (d) {
                        d3.select('.Tooltip_lineChart')
                            .style('display', 'none')
                    })

            }


        }
    }

    public ConvertToUtcDate(date) {
        return new Date(date);
    }


}