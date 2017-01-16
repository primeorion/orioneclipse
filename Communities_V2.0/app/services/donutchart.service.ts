import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as d3 from 'd3';

@Injectable()
export class DonutChartService {

    public renderDonutChart(parent, chartData, colorInfo, type) {
        d3.selectAll("svg").remove();
        var width = 250;
        var height = 250;
        var radious = Math.min(width, height) / 2;
        var donutWidth = 40;
        var legendsize = 18;
        var legendspace = 2;
        var color = d3.scale.ordinal().range(colorInfo);
        console.log(colorInfo);
        var inner = radious - donutWidth;
        var marginright = 50;
        var margintop = 50;

        var svg = d3.select(parent).append('svg')
            .attr('width', width + marginright)
            .attr('height', height + margintop)
            // .style("max-width", "100%")
            // .style("height", "auto")
            // .style("width", "100%")
            .attr("class", "response-image")
            .attr("id", "svgElement")
            .append('g')
            .attr("transform", "translate(" + (((width + marginright) / 2)) + "," + ((height + margintop) / 2) + ")");
        var arc = d3.svg.arc()
            .innerRadius(inner)
            .outerRadius(radious);

        var ghostarc = d3.svg.arc()
            .innerRadius(inner + 20)
            .outerRadius(radious + 10);

        var pie = d3.layout.pie()
            .value(function (d) {
                return ((type == "aum") ? d['marketValue'] : ((type == "modelMarketing") ? d["value"] : d['noOfAccounts']));
            })
            .sort(null);
        var g = svg.selectAll(".arc")
            .data(pie(chartData))
            .enter().append("g")
            .attr("class", "arc")


        var path = g.append("path")
            // .data(pie(chartData))
            // .enter()
            // .append("path")
            .attr("d", <any>arc)
            .attr('class', 'pathDonut')
            .attr("fill", <any>function (d, i) {
                return color(d.data['name']);
            })
        var ghostpath = g.append("path")
            // .data(pie(chartData))
            // .enter()
            // .append("path")
            .attr("d", <any>ghostarc)
            .attr("class", function (d) {
                var name;
                if (d.data['name'].toString().indexOf(' ') != -1) {
                    name = d.data['name'].split(' ').join('_')
                } else {
                    name = d.data['name'];
                }

                return 'ghostPath' + name;
            })
            .attr("fill", <any>function (d, i) {
                return color(d.data['name']);
            })
            .style("opacity", 0.4)
            .style("display", "none");

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

        g.on("mousemove", function (d) {
            div.style("left", d3.event["pageX"] + 10 + "px");
            div.style("top", d3.event["pageY"] - 25 + "px");
            div.style("display", "inline-block");
            if (type == "aum")
                div.html((d.data["name"]) + '<br>' + ((d.data["percent"]).toFixed(2)) + '%' + '<br>' + "$" + d3.format(",")(d.data["marketValue"]))
                    .style("font-weight", "bold");
            else if (type == "accounts")
                div.html((d.data["name"]) + '<br>' + ((d.data["percent"]).toFixed(2)) + '%' + '<br>' + d.data["noOfAccounts"])
                    .style("font-weight", "bold");
            else if (type == "modelMarketing")
                div.html((d.data["name"]) + '<br>' + ((d.data["value"])).toFixed(2))
                    .style("font-weight", "bold");
            var name;
            if (d.data['name'].toString().indexOf(' ') != -1) {
                name = d.data['name'].split(' ').join('_')
            } else {
                name = d.data['name'];
            }
            d3.select('.ghostPath' + name).style('display', 'inline');
        });

        g.on("mouseout", function (d) {
            div.style("display", "none");
            var name;
            if (d.data['name'].toString().indexOf(' ') != -1) {
                name = d.data['name'].split(' ').join('_')
            } else {
                name = d.data['name'];
            }
            d3.select('.ghostPath' + name).style('display', 'none');
        });

        // d3.select('#svgElement').append("text")
        //     // .attr("x", width / 2 )
        //     .style("opacity", 0)
        //     .attr("y", height / 2 + 10)
        //     .style("fill", "#fff")
        //     .style("font-weight", "bold")
        //     .attr("id", "pieInfo")
        //     .style("font-size", "18px")
        //     .text(function () {
        //         var totalValue = 0;
        //         chartData.forEach(function (i, j) {
        //             // if (modelName == "account")
        //             //     totalValue += i['marketValue'];
        //             // else
        //             totalValue += i['marketValue'];
        //         })
        //         return "$" + d3.format(",")(totalValue);
        //     })
        // var textNode = <any>document.getElementById("pieInfo");
        // var textNodeInfo = textNode.getBBox();
        // var textwidth = textNodeInfo.width / 2;
        // d3.select("#pieInfo").attr("x", width / 2 - textwidth)
        //     .style("opacity", 1);
    }
}