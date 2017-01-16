
import { Component } from '@angular/core';
import * as d3 from 'd3';
declare var $: JQueryStatic;

@Component({
    selector: 'group-bar-chart',
    templateUrl: './app/shared/charts/groupchart/groupbarchart.component.html'
})
export class GroupBarChartCompnent {
    width: number;
    height: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    xaxisLength: number;
    yaxisLength: number;
    previousXdomain: any = [];
    svg: any;
    xScale: any;
    yScale: any;
    xaxis: any;
    yaxis: any;
    xdomain: any;
    xGroup: any;
    tooltip_trade: any;
    svgGroup: any;
    LegendsGroup: any;
    tempData: any;
    targetValue: any;

    /* method used to create svg and axis of chart*/
    public CreateSvgForgroupChart(groupData) {
        var that = this;
        that.width = 480;
        that.height = 300;
        that.marginTop = 20;
        that.marginBottom = 50;
        that.marginLeft = 30;
        that.marginRight = 20;
        that.xaxisLength = that.width - that.marginBottom - that.marginLeft - that.marginRight;
        that.yaxisLength = that.height - 2 * that.marginTop - 2 * that.marginBottom;
        //   that.LegendArray = ['#E6F7FE', '#E6F7FE', '#00AEEF']
        that.previousXdomain = [];
        that.xScale = <any>d3.scale.linear()
            .range([0, that.xaxisLength]);

        that.yScale = d3.scale.ordinal()
            .rangeRoundBands([that.yaxisLength, 0], 0.7);

        that.removeBarGraphChart();
        that.svg = d3.select('.group_colomn_chart')
            .append('svg')
            .attr('height', that.height)
            .attr('width', that.width)
            .style('background', 'white')
            .attr('class', 'groupsvg');

        that.xaxis = d3.svg.axis()
            .scale(that.xScale)
            .orient("bottom")
            .innerTickSize(-(that.yaxisLength))
            .outerTickSize(0)
            .tickPadding(10)
            .tickFormat(function (d) { return d + "%"; });

        that.yaxis = <any>d3.svg.axis()
            .scale(that.yScale)
            .orient('left')
            .tickSize(0)
            .tickSize(10, 0)
            .tickPadding(6)
            .innerTickSize((10))
            .outerTickSize(0)
            .tickPadding(10);
        groupData.forEach(function (val, key) {
            val['legendsShow'] = true;
        });
        that.renderChart(groupData);//render chart
        that.renderLegend(groupData);//plot legends
    }

    /* method used to remove svg and tooltip  * */
    public removeBarGraphChart() {
        if (d3.select('.groupsvg'))
            d3.select('.groupsvg').remove();
        d3.select('.tooltip_trade').remove();
    }

    /*methd used to  update/render the chart*/
    public renderChart(groupData) {
        var that = this;
        var data = groupData;

        that.targetValue = 0;
        that.xdomain = <any>that.CalculateXext(data);
        if (that.xdomain[0] > that.targetValue) {
            that.xdomain[0] = that.targetValue
        };
        if (that.xdomain[1] < that.targetValue) {
            that.xdomain[1] = that.targetValue;
        }
        if (that.xdomain[0] > that.xdomain[1]) {
            that.xdomain = [that.xdomain[1], that.xdomain[0]]
        }
        d3.selectAll('.svgGElement').remove(); /*empty svg while updateing the chart when user click on legends*/

        if (that.xdomain && that.xdomain.length > 0) {
            var portfolioName = that.svg.append('text')
                .attr('class', 'portfolioname')
                .attr('transform', 'translate(' + (that.xaxisLength / 2) + ',' + that.marginTop + ')')
                .style({
                    'color': '#333333',
                    'font-size': '18px',
                    'fill': '#333333',
                    'font-weight': 'bold'
                })
                .text(data[0]['portfolioName'])

            that.svgGroup = that.svg.append('g')
                .attr('class', 'svgGElement')
                .attr('transform', 'translate(' + that.marginLeft + ',' + that.marginBottom + ')');

            that.xScale.domain(that.xdomain)
            that.yScale.domain(data[0]['data'].map(function (d) { return d.label }))

            that.xGroup = that.svgGroup.append('g')
                .attr('class', 'x-axis-bar-group')
                .attr('transform', 'translate(' + that.marginLeft + ',' + (that.yaxisLength) + ')')
                .call(that.xaxis);

            that.animateXaxis();/*animate x axis*/

            /*call y axis at x is equal to targetvalue */
            that.svgGroup.append('g')
                .attr('class', 'y-axis-bar-group')
                .attr('transform', 'translate(' + that.xScale(that.targetValue) + ',' + 0 + ')')
                .call(that.yaxis);
            /*append another y axis at left side of svg*/
            that.svgGroup.append('g')
                .attr('class', 'y-axis-bar-group-2')
                .attr('transform', 'translate(' + that.marginLeft + ',' + 0 + ')')
                .call(that.yaxis);

            d3.selectAll('.y-axis-bar-group text')
                .style('display', 'none')

            d3.selectAll('.y-axis-bar-group-2 line')
                .style('stroke', 'black')
                .style('stroke-width', '0.3px')

            d3.selectAll('.y-axis-bar-group-2 text')
                .style('font-size', '11px')
                .style('font-weight', 500)

            d3.selectAll('.y-axis-bar-group-2 text').each(function (d, i) {
                if (d.length > 8) {
                    var remainingletter = d.slice(3);
                    var lastlength = remainingletter.length
                    var displayName = d.slice(0, -(lastlength)) + '...';
                    $(this).text(displayName)
                }
            });
            // var ticks = that.xScale.ticks();
            // // if ($.inArray(that.targetValue, ticks) == -1) {
            // //     ticks.push(that.targetValue);
            // //     that.xaxis.tickValues(ticks);
            // // }
            that.plotrectangles(data);
        }/*condition  for not to plot chart when all legends are clicked*/

    }

    /*method used to ploting the bars  to plot rectangles*/
    public plotrectangles(data) {
        for (let j = 0; j < data.length; j++) {
            let that = this;

            let FillColor = ['rgba(0, 170, 239, 0.1)', 'rgba(0, 170, 239, 0.1)', '#00AEEF'];
            let StrokeColor = ['#00AEEF', '#00AEEF', 'none']

            let currentdata = data[j]['data']
            let ClassName = data[j]['name'];
            let fillColor = FillColor[j];
            let strokeColor = StrokeColor[j];
            // let targetValue = data[j]['target']

            that.yScale.domain(data[j]['data'].map(function (d) { return d.label }));

            if (data[j]['legendsShow']) {   /* not ploting bars if legend is checked*/

                let barGroup = that.svgGroup
                    .append('g')
                    .attr('class', 'barGroup' + j);

                let bars = barGroup.selectAll('.' + ClassName)
                    .data(currentdata)
                    .enter()
                    .append('rect')
                    .attr('class', ClassName)
                    .attr('id', <any>function (d) {
                        return ClassName + '_' + d['label'].replace(/[^A-Z0-9]/ig, '');
                    })
                    .attr('y', <any>function (d) {
                        var offsety = 2;
                        if (d['series'] != 'Post_Trade') {
                            return that.yScale(d.label) - offsety;
                        } else {
                            return that.yScale(d.label)
                        }

                    })
                    .attr('height', function (d) {
                        var offsetheight = 6;
                        if (d['series'] != 'Post_Trade') {
                            return that.yScale.rangeBand() + offsetheight;
                        } else {
                            return that.yScale.rangeBand();
                        }

                    })
                    .style('rx', 0)
                    .style('ry', 0)
                    .style('fill', function (d) {

                        if (d['series'] == 'Post_Trade') {
                           
                            // if (d['postTrade'] < d['lowerRange'] || d['postTrade'] > d['upperRange']) {
                            if ((d['postTrade'] < d['target'] - d['lower']) || (d['postTrade'] > d['target'] + d['upper'])) {
                                return '#BF0B23';
                            } else {
                                return fillColor;
                            }
                        } else {
                            return fillColor;
                        }
                    })
                    .style('stroke', strokeColor)
                    .style('stroke-width', 1)
                    .on('mouseover', function (d, i) {
                        that.mousemove(d, this)
                    })
                    .on('mouseout', function (d, i) {
                        that.mouseout(d);
                    })

                    .attr('width', function (d) {
                        return 0;
                    })
                    .attr('x', <any>function (d) {
                        return that.xScale(that.targetValue) + that.marginLeft;
                    })
                    .transition()
                    .duration(500)
                    .attr('x', <any>function (d) {
                        return that.marginLeft + that.xScale(Math.min(that.targetValue, d.value))
                    })
                    .attr('width', <any>function (d) {
                        return Math.abs(that.xScale(d.value) - that.xScale(that.targetValue));
                    })


                /* append ghost bars for show tooltip on svg*/
                // let ghostBars = barGroup.selectAll('.ghostBars' + ClassName)
                //     .data(currentdata)
                //     .enter()
                //     .append('rect')
                //     .attr('class', 'ghostBars' + ClassName)
                //     .attr('x', <any>function (d) {
                //         if (d.value <= that.targetValue) {
                //             return that.marginLeft
                //         } else {
                //             return that.marginLeft + that.xScale(Math.min(that.targetValue, d.value))
                //         }
                //     })
                //     .attr('y', <any>function (d) {
                //         return that.yScale(d.label)
                //     })
                //     .attr('height', that.yScale.rangeBand() + 5)
                //     .attr('rx', 0)
                //     .attr('ry', 0)
                //     .style('fill', 'transparent')
                //     .style('stroke', 'none')
                //     .attr('width', <any>function (d) {
                //         var rectwidth;
                //         if (d['value'] > that.targetValue) {
                //             rectwidth = that.xScale(that.xdomain[1]) - that.xScale(that.targetValue);
                //         } else {
                //             rectwidth = that.xScale(d['value']) + Math.abs(that.xScale(d.value) - that.xScale(that.targetValue));
                //             if (rectwidth == 0) {
                //                 rectwidth = that.xScale(that.xdomain[1])
                //             }
                //         }
                //         return Math.abs(rectwidth);
                //     })
                // .on('mouseover', function (d, i) {
                //     that.mousemove(d, this)
                // })
                // .on('mouseout', function (d, i) {
                //     that.mouseout(d);
                // })
            }
        }
    }

    /*method used to show tooltip on mousemove*/
    public mousemove(d, currentThis) {
        let that = this;
        let padding = 120;
        let paddinleft = 780;
        let left;
        let top;

        that.tooltip_trade = d3.select('.group_colomn_chart')
            .insert("div", ":first-child")
            .attr('class', 'tooltip_trade')
            .style("opacity", 0);

        left = that.xScale(d['value']) / 2 + that.marginRight + that.marginLeft;
        if (d['series'] == 'Post_Trade') {
            if ((d['postTrade'] < d['target'] - d['lower']) || (d['postTrade'] > d['target'] + d['upper'])) {
                d3.select('#' + d['series'] + '_' + d['label'].replace(/[^A-Z0-9]/ig, '')).style('fill', 'rgba(216,36,60,1)')
            } else {
                d3.select('#' + d['series'] + '_' + d['label'].replace(/[^A-Z0-9]/ig, '')).style('fill', '#19C7FF')
            }
            d3.select('#' + d['series'] + '_' + d['label'].replace(/[^A-Z0-9]/ig, '')).style('stroke', '#00AEEF')
        }

        top = d3.event['pageY'] - padding;

        that.tooltip_trade
            .style('font-size', '12px')
            .style("top", top + "px")
            .style("left", left + "px")
            .style('z-index', 9999)
            .style('pointer-events', 'none')
            .style('position', 'absolute')
            .html('<strong>' + d['label'] + '</strong>' + '<br>' + 'Target: ' + d['target'] + ' %' + '<br>' + 'Range: ' + d['lowerRange'] + ' - ' + d['upperRange'] + ' %' + '<br>' + 'Post Trade: ' + d['postTrade'] + ' %')
            .style("opacity", 0)
            .transition(500)
            .style("opacity", 1)
    };

    /*method used  to hide tooltip on mouseout*/
    public mouseout(d) {
        var that = this;
        if (d['series'] == 'Post_Trade') {
            if ((d['postTrade'] < d['target'] - d['lower']) || (d['postTrade'] > d['target'] + d['upper'])) {
                d3.select('#' + d['series'] + '_' + d['label'].replace(/[^A-Z0-9]/ig, '')).style('fill', '#BF0B23')
            } else {
                d3.select('#' + d['series'] + '_' + d['label'].replace(/[^A-Z0-9]/ig, '')).style('fill', '#00AEEF')
            }
            d3.select('#' + d['series'] + '_' + d['label'].replace(/[^A-Z0-9]/ig, '')).style('stroke', 'none')
        }
        that.tooltip_trade.style("opacity", 0);
        that.tooltip_trade.remove();
    }

    /* method used to calculate xdomain value*/
    public CalculateXext(data) {
        var max, min;
        var maxArray = [];
        var minArray = [];
        data.forEach(val => {
            if (val.legendsShow == true) {
                max = d3.max(val['data'], function (d) {
                    return d['value']
                })
                maxArray.push(max)
                min = d3.min(val['data'], function (d) {
                    return d['value']
                })
                minArray.push(min)
            }
        });
        var xextMin = d3.min(minArray);
        var xextMax = d3.max(maxArray);

        if (xextMin < -(xextMax)) {
            var ext = [xextMin, Math.abs(xextMin)];
        }
        else {
            var ext = [-(xextMax), xextMax];
        }
        if (xextMin == undefined && xextMax == undefined) {
            return [];
        } else {
            return ext;
        }

    }//ext

    /*method used to animation of of x axis*/
    public animateXaxis() {
        var that = this;
        that.xGroup.transition().duration(500).tween("axis", <any>function (d, i) {
            if (that.previousXdomain[0] == that.xdomain[0] && that.previousXdomain[1] == that.xdomain[1]) {
                that.previousXdomain = [that.xdomain[0] - 10, that.xdomain[1] + 10]
            };
            var i: any = d3.interpolateArray(that.previousXdomain, that.xdomain);
            return function (t) {
                that.xScale.domain(i(t));
                that.xGroup.call(that.xaxis);
                d3.selectAll('.x-axis-bar-group line')
                    .style("stroke-width", 1)
                    .style("stroke", "#c8c8c8");

                d3.selectAll('.x-axis-bar-group text').each(function (d, i) {
                    if (d == that.targetValue) {
                        $(this).text('target')
                    }
                })
                d3.selectAll('.x-axis-bar-group text')
                    .style('font-size', '11px')
                    .style('font-weight', 500)
            }
        })
    }//animateXaxis

    /* method used to function for plot legends*/
    public renderLegend(groupData) {
        var that = this;
        let Legendcolor = ['#E6F7FE', '#E6F7FE', '#00AEEF'];
        //append legends to chaart
        that.LegendsGroup = that.svg.selectAll('legendsGroup')
            .data(groupData)
            .enter()
            .append('g')
            .attr('class', 'legendsGroup legendsText')
        var length = groupData.length;
        that.LegendsGroup.append('rect')
            .attr('class', 'legends')
            .attr('height', 15)
            .attr('width', 15)
            .attr('fill', <any>function (d, i, j) {
                return Legendcolor[i];
            })
            .attr('x', <any>function (d, i) {
                return (that.xaxisLength / length) + (i * 100);
            })
            .attr('y', that.yaxisLength + (2 * that.marginBottom));

        that.LegendsGroup.append('text')
            .attr('class', <any>function (d, i) {
                return d['name'];
            })
            .attr('x', <any>function (d, i) {
                return that.xaxisLength / length + i * 100 + that.marginRight;
            })
            .attr('y', that.yaxisLength + 2 * that.marginBottom + that.marginTop / 2)
            .style('font-weight', 'bold')
            .text(<any>function (d, i) {
                var displaytext;
                if (d['name'] == 'Post_Trade') {
                    displaytext = d['name'].replace('_', ' ');
                } else {
                    displaytext = d['name'];
                }

                return displaytext;
            });

        that.tempData = JSON.parse(JSON.stringify(groupData)); //save data in a temparory Array 
        //click on legend
        that.LegendsGroup.on('click', function (d, i) {
            that.clickOnLegends(this);
        });

    } //renderlegend

    /* method used  to toggles columns when user click on legends*/
    public clickOnLegends(currentEle) {
        var that = this;
        if ($(currentEle).hasClass("legendsText")) {
            $(currentEle).removeClass('legendsText');
            $(currentEle).addClass('legendClickText');
            $(currentEle).find('rect').addClass('legendClickrect');
            var classNameText = $(currentEle).find('text').attr('class');
            that.previousXdomain = <any>that.CalculateXext(that.tempData);
            that.tempData.forEach(el => {
                if (el && (el.name == classNameText)) {
                    el.legendsShow = false;
                }
            });
            that.renderChart(that.tempData);
        } else {
            $(currentEle).addClass('legendsText');
            $(currentEle).removeClass('legendClickText');
            $(currentEle).find('rect').removeClass('legendClickrect');
            var classNameText = $(currentEle).find('text').attr('class');
            that.previousXdomain = <any>that.CalculateXext(that.tempData);
            that.tempData.forEach(el => {
                if (el && (el.name == classNameText)) {
                    el.legendsShow = true;
                }
            });
            that.renderChart(that.tempData);
        }

    }

}
