import * as d3  from 'd3';
declare var $: JQueryStatic;
import {compareStructure} from '../services/compareData'


export class ModelGroupChart {

    public compareStructure: any = compareStructure;
    //Reading the required attributes inorder to plot the chart
    constructor() {
        this.compareStructure = new compareStructure();
        this.changeLevelDropDown();
    }

    /* Method used to read the drop down value and plot the chart with the level of selection from the drop down*/
    public changeLevelDropDown() {
        var that = this;
        $('.mcompare_selectLevel').change(function () {
            var level = $(this).val();
            d3.select(".compareModel").remove();
            that.parseDataIntoRequiredFormat(that.compareStructure.totalData, level);
        })
    }

    /*Method used to read the data and arrange the data in the way that is suitable for plotting the 
    grouped bar chart */
    public parseDataIntoRequiredFormat(data, level) {
        var selectedLevelData = [];
        var parsedData = [];
        this.compareStructure.totalData = data;
        $.each(data, function (key, value) {
            if (value.level == level) {
                selectedLevelData.push(value);
            }
        });
        parsedData[0] = [];
        parsedData[1] = [];
        $.each(selectedLevelData, function (key, value) {
            parsedData[0].push({});
            parsedData[1].push({});
            if (value['Pending'] == undefined) {
                value['Pending'] = 0;
            }
            if (value['Current'] == undefined) {
                value['Current'] = 0;
            }
            $.each(value, function (k, v) {
                if (k == "Current") {
                    parsedData[1][key]["value"] = v;
                }
                if (k == "Pending") {
                    parsedData[0][key]["value"] = v;
                }
                if (k == "label") {
                    parsedData[0][key]["label"] = v;
                    parsedData[1][key]["label"] = v;
                }
            });
        });

        this.compareStructure.data = parsedData;
        this.createSvgAndDefineScales();
    }

    /*Method used to create svg element on the dom and define the necessary scales for plotting the chart */
    public createSvgAndDefineScales() {
        var that = this;
        var xaxislength = this.compareStructure.width - this.compareStructure.margin.left - this.compareStructure.margin.right;
        var yaxisHeight = this.compareStructure.height - this.compareStructure.margin.bottom - this.compareStructure.margin.top - this.compareStructure.padding;

        this.compareStructure.svg = d3.select('.compareModelDiv').append("svg:svg")
            .attr("class", "compareModel")
            .attr("width", this.compareStructure.width)
            .attr("height", this.compareStructure.height);
        this.compareStructure.xScale.domain([0, 100]).range([0, xaxislength]);
        var yDomain = this.compareStructure.data[0].map(function (value, count) {
            return value.label;
        });
        this.compareStructure.yScale.domain(yDomain).rangeRoundBands([yaxisHeight, 0], 0.8);
        this.compareStructure.y1Scale.domain(d3.range(that.compareStructure.data.length)).rangeRoundBands([0, that.compareStructure.yScale.rangeBand()]);
        this.renderChart();
    }

    /* In this method we are keeping the required functions that are necessary to plot the chart */
    public renderChart() {
        this.plottingAxis();
        this.plotRectangles();
        this.plotLegend();
    }

    /* Method used to define both horizontal and vertical axis  */
    public plottingAxis() {
        var that = this;
        var xAxis = d3.svg.axis()
            .scale(that.compareStructure.xScale)
            .orient("bottom")
            .tickFormat(function (d) { return d + " %"; })
            .innerTickSize(-(this.compareStructure.height - this.compareStructure.margin.bottom - this.compareStructure.margin.top - this.compareStructure.padding));

        var yAxis = d3.svg.axis()
            .scale(this.compareStructure.yScale)
            .orient("left")

        that.compareStructure.svg.append("g")
            .attr("class", "x-axis-group")
            .attr("transform", "translate(" + that.compareStructure.margin.left + "," + (that.compareStructure.height - that.compareStructure.margin.top - that.compareStructure.margin.bottom) + ")")
            .style("fill", "none")
            .style("stroke", "grey")
            .style("stroke-width", "1px")
            .style("shape-rendering", "crispEdges")
            .call(xAxis);

        that.compareStructure.svg.append("g")
            .attr("class", "y-axis-group")
            .style("fill", "none")
            .style("stroke", "grey")
            .style("stroke-width", "1px")
            .style("shape-rendering", "crispEdges")
            .attr("transform", "translate(" + that.compareStructure.margin.left + "," + that.compareStructure.padding + ")")
            .call(yAxis)
            .selectAll(".tick text")
            .call(that.wrap, that.compareStructure.y1Scale.rangeBand());

        d3.selectAll('.y-axis-group text').each(function (d, i) {
            // if (d.length > 9) {
            //     var remainingletter = d.slice(9);
            //     var lastlength = remainingletter.length
            //     var displayName = d.slice(0, -(lastlength)) + '...';
            //     // $(this).text(displayName);

            // }
        })
            .style('font-size', '12px')
            .on('mouseover', function (d, i) {
                // console.log(d, i, '444');
                // console.log(d3.mouse(this)[], d3.event['pageX'])
                d3.select(".axis_tooltip")
                    .style({
                        'position': 'fixed',
                        'text-align': 'center',
                        'padding': '2px',
                        'font': '13px sans- serif',
                        'font-weight': 'bold',
                        "pointer-events": 'none',
                        "background-color": 'white',
                        "color": 'black'
                    })
                    .text(d)
                    .style('top', d3.event['clientY'] - 45 + 'px')
                    .style('left', d3.event['pageX'] + 'px')
                    .style("opacity", "0")
                    .transition()
                    .duration(500)
                    .style("opacity", "1")
            })
            .on('mouseout', function () {
                d3.select(".axis_tooltip")
                    .transition()
                    .duration(500)
                    .style("opacity", "0");
            })

        d3.selectAll('.x-axis-group text').each(function (d, i) {
            if (d == 0) {
                $(this).text('Target');
                $(this).css('stroke', '#0097D2');
            }
            $(this).attr('y', 10); /*postioned axis labels*/
        })
            .attr('font-size', 11)
        d3.selectAll('.x-axis-group path')
            .style('display', 'none');


    }

    /* Method used to plot bars based on the data */
    public plotRectangles() {
        var that = this;
        var series = that.compareStructure.svg.selectAll("g.series")
            .data(that.compareStructure.data)
            .enter()
            .append("g")
            .attr("class", "series");

        var rect = series.selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter()
            .append("rect")
            .attr("height", that.compareStructure.y1Scale.rangeBand())
            .attr("x", function (d) {
                return that.compareStructure.margin.left;
            })
            // .attr("data-label", function (d, i, j) {
            //     if (j == 0) {
            //         return "pending" + d.label;
            //     }
            //     return "current" + d.label;
            // })
            .attr('class', function (d, i, j) {
                if (j == 0) {
                    return "Pending " + d.label;
                }
                return "Current " + d.label;
            })
            .attr("y", function (d, i, j) {
                return that.compareStructure.yScale(d.label) + that.compareStructure.padding + j * that.compareStructure.y1Scale.rangeBand();
            })
            .attr("fill", function (d, i, j) {
                if (j == 0) {
                    return "#FF8A00"
                }
                else {
                    return "#0097D2"
                }
            })
            .on("mouseover", function (d, i, j) {
                that.mouseOver(d, i, j, this)
            })
            .on("mouseout", function () {
                d3.select(".tooltip_mcompare").style("display", "none");
                d3.selectAll(".series rect").style("opacity", "1")
            })
            .attr("width", 0)
            .transition()
            .duration(500)
            .ease('linear')
            .attr("width", function (d) {
                return that.compareStructure.xScale(d.value);
            })
    }

    /*Method fired when user mouse over on a particular bar and is responsible for showing the tooltip with
    correct data and adjusted positions */
    public mouseOver(d, i, j, that) {
        var padding = 30;
        d3.select(".label_tooltip").text(d.label.toString().toUpperCase());
        if (j == 0) {
            d3.select(".current_value").text(this.compareStructure.data[1][i].value + " %");
            d3.select(".pending_value").text(d.value + " %");
        }
        else {
            d3.select(".current_value").text(d.value + " %");
            d3.select(".pending_value").text(this.compareStructure.data[0][i].value + " %");
        }
        var left = this.compareStructure.margin.left + this.compareStructure.xScale(d.value) + padding;
        var top = this.compareStructure.yScale(d.label) + j * this.compareStructure.y1Scale.rangeBand()
        d3.select(".tooltip_mcompare").style("display", "block");
        d3.select(".tooltip_mcompare").style("left", left + "px");
        d3.select(".tooltip_mcompare").style("top", top + "px");
        d3.selectAll(".series rect").each(function () {
            $(this).not(that).css("opacity", "0.4");
        });
        if ($('.legend').hasClass('GroupLegendonClick')) {
            $('.legend').removeClass('GroupLegendonClick');
            $('.legend rect').removeClass('rectClik');
        }

    }

    /* Method used to plot the legends in order to show information to the user that which series belong to which part*/
    public plotLegend() {
        var that = this;
        var legend = this.compareStructure.svg.selectAll("g.legend")
            .data(that.compareStructure.data)
            .enter()
            .append("g")
            .attr("class", "legend")
            .on('click', function (d, i) {
                that.clickOnLegend(this)
            })

        legend.append("rect")
            .attr("width", "15")
            .attr("height", "15")
            .attr("x", function (d, i) {
                if (i == 0) {
                    return that.compareStructure.width - 450;
                }
                else {
                    return that.compareStructure.width - 350;
                }
            })
            .style("fill", function (d, i) {
                if (i == 0) {
                    return "#FF8A00"
                }
                else {
                    return "#0097D2"
                }
            })

        legend.append("text")
            .attr("x", function (d, i) {
                if (i == 0) {
                    return that.compareStructure.width - 430;
                }
                else {
                    return that.compareStructure.width - 330;
                }
            })
            .attr("y", 12)
            .style("fill", "white")
            .style("font-size", "14px")
            .text(function (d, i) {
                if (i == 0) {
                    return "Pending";
                }
                else {
                    return "Current";
                }
            })
    }

    //function to toggle legends and rets when user clcik on legends    
    public clickOnLegend(currentEle) {
        if ($(currentEle).hasClass('GroupLegendonClick')) {
            $(currentEle).removeClass('GroupLegendonClick');
            $(currentEle).find('rect').removeClass('rectClik');
            var className = $(currentEle).find('text').text();
            $('.' + className).css('opacity', '1');
        } else {
            $(currentEle).addClass('GroupLegendonClick');
            $(currentEle).find('rect').addClass('rectClik');
            var className = $(currentEle).find('text').text();
            $('.' + className).css('opacity', '0.1');
        }
    }



    public wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/[\s-]+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 0.9, // ems
                y = parseInt(text.attr("y")),
                // dy = parseFloat(text.attr("dy")) - parseFloat(text.attr("dy")) - parseFloat(text.attr("dy")) - parseFloat(text.attr("dy")) - parseFloat(text.attr("dy")),
                dy = -1.2,
                tspan = <any>text.text(null).append("tspan").attr("x", -2).attr("y", y - 2).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                // console.log(line.join(" "), tspan.node().getComputedTextLength(), 'tspan.node().getComputedTextLength()')
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    // console.log(word, 'word', line)
                    tspan = text.append("tspan").attr("x", -2).attr("y", y - 2).attr("dy", ((++lineNumber) / 0.8) * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

}
