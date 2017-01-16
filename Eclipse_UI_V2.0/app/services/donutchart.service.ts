import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as d3 from 'd3';

@Injectable()
export class DonutChartService {

    public renderDonutChart(parent, chartData, colorInfo, modelName) {

        var width = 230;
        var height = 230;
        var radious = Math.min(width, height) / 2;
        var donutWidth = 40;
        var legendsize = 18;
        var legendspace = 2;
        var color = d3.scale.ordinal().range(colorInfo);
        var inner = radious - donutWidth;
        var splitparent;
        if (parent.indexOf('#') > -1) {
            splitparent = '#';
        } else {
            splitparent = '.';
        }
        var parentClassName = parent.split(splitparent)[1];
        // console.log(d3.select("#svgElement_" + parentClassName),'chart');
        if (d3.select("#svgElement_" + parentClassName)) {
            d3.select("#svgElement_" + parentClassName).remove();
        }
        var svg = d3.select(parent).append('svg')
            .attr('width', width)
            .attr('height', height)
            // .style("max-width", "100%")
            // .style("height", "auto")
            // .style("width", "100%")
            .attr("class", "response-image")
            .attr("id", "svgElement_" + parentClassName)
            .append('g')
            .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

        var arc = d3.svg.arc()
            .innerRadius(inner)
            .outerRadius(radious);
        var pie = d3.layout.pie()
            .value(function (d) {
                return (modelName == "account" || modelName == "holding") ? d['percentage'] : d['value'];
            })
            .sort(null);

        var path = svg.selectAll("path")
            .data(pie(chartData))
            .enter()
            .append("path")
            .attr("d", <any>arc)
            .attr("fill", <any>function (d, i) {
                if (modelName == "portfolio" || modelName == "account") {
                    return d.data['color'];
                } else {
                    return color(d.data['securityName']);

                }
                //return color((modelName == "account") ? d.data['securityName'] : ((modelName == "portfolio") ? d.data['label'] : d.data['securityName']));
            })

        path.transition()
            .duration(2000)
            .attrTween('d', function (d) {
                var interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, <any>d);
                return function (t) {
                    return arc(<any>interpolate(t));
                };
            });

        var div = d3.select("body").append("div")
            .attr("class", "tool-tip");

        path.on("mousemove", function (d) {
            div.style("left", d3.event["pageX"] + 10 + "px");
            div.style("top", d3.event["pageY"] - 25 + "px");
            div.style("display", "inline-block");
            if (modelName == "account" || modelName == "holding")
                div.html("Market Value" + " : $" + d3.format(",")(d.data["marketValue"]) + "</br>" +
                    "Percentage" + " : " + d.data["percentage"] + " %")
                    .style("font-weight", "bold");
            else
                div.html((d.data["label"]) + " : $" + d3.format(",")(d.data["value"]))
                    .style("font-weight", "bold");

        });

        path.on("mouseout", function (d) {
            div.style("display", "none");
        });

        d3.select('#' + 'svgElement_' + parentClassName).append("text")
            // .attr("x", width / 2 )
            .style("opacity", 0)
            .attr("y", height / 2 + 10)
            .style("fill", "#fff")
            .style("font-weight", "bold")
            .attr("id", "pieInfo_" + parentClassName)
            .style("font-size", (modelName == "account") ? "18px" : "30px")
            .text(function () {
                var totalValue = 0;
                chartData.forEach(function (i, j) {
                    if (modelName == "account" || modelName == "holding")
                        totalValue += i['marketValue'];
                    else
                        totalValue += i['value'];
                })
                return "$" + d3.format(",")(+totalValue.toFixed(2));
            })
        var textNode = <any>document.getElementById("pieInfo_" + parentClassName);
        var textNodeInfo = textNode.getBBox();
        var textwidth = textNodeInfo.width / 2;
        d3.select("#" + 'pieInfo_' + parentClassName).attr("x", width / 2 - textwidth)
            .style("opacity", 1);
    }
}