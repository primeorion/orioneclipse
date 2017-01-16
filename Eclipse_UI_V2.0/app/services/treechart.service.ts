import { Injectable, Inject, Input } from '@angular/core';
import { TreeStructure } from './tree_data';
import * as d3 from 'd3';
declare var $: JQueryStatic;

@Injectable()
export class TreeCharts {

    //property used to store the data from the treeStructure class 

    public data_structure: TreeStructure;
    //Reading the necessary variables from TreeStructure class to make use of them in the whole class

    constructor() {
        this.data_structure = new TreeStructure();
        //this.updatingTreeView(this.data_structure);
    }

    /*Method is responsible for plotting the svg and assigning the data to the respective variables */

     public createSvg(DomElement, treeData, mode) {
    //     var that = this;
    //     that.data_structure.domElement = DomElement;
    //     that.data_structure.mode = mode;
    //     this.data_structure.tree = d3.layout.tree()
    //         .nodeSize([45, 0])
    //         .separation(function separation(a, b) {
    //             return a.parent == b.parent ? 3.2 : 2.2;
    //         });

    //     this.data_structure.diagonal = d3.svg.diagonal()
    //         .projection(function (d) { return [d.x, d.y]; });

    //     // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents

    //     this.data_structure.zoomListener = d3.behavior.zoom().scaleExtent([0, 1.004]).on("zoom", function () {
    //         return that.zoom(that.data_structure)
    //     });

    //     this.data_structure.svg = d3.select(that.data_structure.domElement).append("svg")
    //         .attr("class", "tree_chart")
    //         .attr("width", this.data_structure.width + this.data_structure.margin.right + this.data_structure.margin.left)
    //         .attr("height", this.data_structure.height + this.data_structure.margin.top + this.data_structure.margin.bottom);

    //     if (this.data_structure.mode == "EditMode") {
    //         this.data_structure.svg.call(this.data_structure.zoomListener);
    //     }
    //     var transformLeft = (this.data_structure.width / 2) + 100;
    //     this.data_structure.svgGroup = this.data_structure.svg.append("g")
    //         .attr("transform", "translate(" + transformLeft + "," + (this.data_structure.margin.top + 15) + ")");

    //     this.renderTreeChart(treeData, this.data_structure);
     }


    // /* Method used to render the tree chart with the functionality  */

    // public renderTreeChart(treeData, datastructure) {
    //     datastructure.root = treeData[0];
    //     datastructure.root.x0 = datastructure.height / 2;
    //     datastructure.root.y0 = 0;
    //     this.update(datastructure.root);
    // }

    // /*Method used to call when mouse scrolled as it is the default behavior of zoom */

    // public zoom(dataStructure) {
    //     if (d3.event['sourceEvent'] != null && d3.event['sourceEvent'] != "null") {
    //         if (d3.event['sourceEvent']['type'] == "wheel") {
    //             var difference = this.data_structure.width / 2 - d3.event["translate"][0];
    //             var x = d3.event["translate"][0] + difference;
    //         }
    //         else {
    //             var x = this.data_structure.width / 2 + d3.event["translate"][0];
    //         }
    //         var y = d3.event["translate"][1];
    //         dataStructure.svgGroup.attr("transform", "translate(" + x + "," + y + ")scale(" + d3.event['scale'] + ")");
    //     }
    // }

    // /*Method used for plotting the nodes and pie around the nodes and updates the tree chart according to the data */

    // public update(source) {
    //     var that = this.data_structure;
    //     var storageInstance = this;
    //     // Compute the new tree layout.
    //     var nodes = that.tree.nodes(that.root).reverse(),
    //         links = that.tree.links(nodes);

    //     // Normalize for fixed-depth.
    //     nodes.forEach(function (d) { d.y = d.depth * 110; });

    //     // Update the nodes…
    //     var node = that.svgGroup.selectAll("g.node")
    //         .data(nodes, function (d) { return d.id || (d.id = ++that.counterFlag); });

    //     // Enter any new nodes at the parent's previous position.
    //     var nodeEnter = node.enter().append("g")
    //         .attr("class", "node")
    //         .attr("id", function (d) {
    //             return d.id;
    //         })
    //         .attr("transform", function (d) { return "translate(" + source.x0 + "," + source.y0 + ")"; });

    //     if (that.mode == "EditMode") {
    //         nodeEnter.on("click", function (d) {
    //             return storageInstance.click(d, storageInstance, that);
    //         });
    //     }


    //     nodeEnter.append("circle")
    //         .attr("r", 30)
    //         .attr("class", "mainCircle")
    //         .attr("type", function (d) {
    //             if (d.modelType == undefined)
    //                 return storageInstance.AddingAttributeForDraggingNode(d);
    //             else
    //                 return d.modelType;
    //         })
    //         .style("fill", function (d, i, j) {
    //             if (d['depth'] == 0) {
    //                 d['color'] = '#cccccc';
    //                 d['colorCount'] = 0;
    //                 return "red";
    //             }

    //             else if (d['depth'] == 1) {
    //                 var colorObject1 = storageInstance.colorCode(d, that.colorArrayForDepth1, that.colorCount1, that.firstLevelColor);
    //                 that.colorCount1 = colorObject1['colorCount'];
    //                 return colorObject1['color'];

    //             }

    //             else if (d['depth'] == 2) {
    //                 var colorObject2 = storageInstance.colorCode(d, that.colorArrayForDepth2, that.colorCount2, that.secondLevelColor);
    //                 that.colorCount2 = colorObject2['colorCount'];
    //                 return colorObject2['color'];

    //             }

    //             else if (d['depth'] == 3) {
    //                 var colorObject3 = storageInstance.colorCode(d, that.colorArrayForDepth3, that.colorCount3, that.color);
    //                 that.colorCount3 = colorObject3['colorCount'];
    //                 return colorObject3['color'];
    //             }

    //             else {
    //                 if (d.color != undefined) {
    //                     return d.color;
    //                 }

    //                 else {
    //                     that.colorCountgeneric++;
    //                     d['color'] = that.lastNodeColor(that.colorCountgeneric - 1)
    //                     return that.lastNodeColor(that.colorCountgeneric - 1);
    //                 }
    //             }
    //         })


    //     //Adding color array to the data which is to be used in filling the colors for arcs in pie  
    //     if (that.clickFlag == false) {
    //         this.AddingCorrespondingColorNumber(that.root);
    //     }
    //     else {
    //         that.clickFlag = false;
    //     }
    //     //plotting pie chart
    //     this.plotPie(nodeEnter, that.root, nodes);

    //     nodeEnter.append("text")
    //         .attr("x", 0)
    //         .attr("dy", ".35em")
    //         .attr("class", "nodeText")
    //         .attr("data-parent", function (d) {
    //             if (d.parent != undefined)
    //                 return d.parent['name'];
    //             else
    //                 return "null";
    //         })
    //         .attr("type", function (d) {
    //             if (d.modelType == undefined)
    //                 return storageInstance.AddingAttributeForDraggingNode(d);
    //             else
    //                 return d.modelType;
    //         })
    //         .attr("data-id", function (d) {
    //             return d.name;
    //         })
    //         .attr("text-anchor", function (d) { return "middle" })
    //         .style("font-weight", "bold")
    //         .style("font-size", "11px")
    //         .style("fill", "#000")
    //         .attr("content", function (d) {
    //             return d.nodeName;
    //         })
    //         .call(this.wrap, 30);

    //     //Appending a circle at the top of the circle in order to show the tooltip and this cirlce will not appearing
    //     //as we are making the opacity too low

    //     nodeEnter.append("circle")
    //         .style("opacity", "0.1")
    //         .attr("r", 30)
    //         .on("mouseover", function (d) {
    //             let childData = [];
    //             let nodeName = d.nodeName;
    //             [d].forEach(element => {
    //                 if (element.children != undefined) {
    //                     element.children.forEach(elem => {
    //                         let lowerTolerance = (elem.lowerModelTolerancePercent == null || elem.lowerModelTolerancePercent == undefined) ? '' : elem.lowerModelTolerancePercent;
    //                         var upperTolerance = (elem.upperModelTolerancePercent == null || elem.upperModelTolerancePercent == undefined) ? '' : elem.upperModelTolerancePercent;
    //                         let toleranceType = (elem.toleranceTypeValue == null || elem.toleranceTypeValue == undefined) ? '' : elem.toleranceTypeValue;
    //                         let rank = (elem.rank == null || elem.rank == undefined) ? '' : elem.rank;
    //                         childData.push({
    //                             "label": elem.nodeName,
    //                             "targetPercent": elem.targetPercent,
    //                             "lowerTolerance": lowerTolerance,
    //                             "upperTolerance": upperTolerance,
    //                             "toleranceTypeValue": toleranceType,
    //                             "rank": rank
    //                         });
    //                     });
    //                 }
    //             });

    //             var color = $(this).siblings(".mainCircle").css("fill");
    //             if (childData.length != 0) {
    //                 var hover = d3.select(".circleHover")
    //                     .style('display', 'inline-block')
    //                     .style("left", (d3.event['offsetX'] + 5) + 'px')
    //                     .style("top", (d3.event['offsetY'] + 24) + "px")
    //                     .style("border", "2px solid " + color)
    //                     .style('font-size', '14px')
    //                     .html(function () {
    //                         let htmlContent = '';
    //                         htmlContent += '<table class = "tip_child"><thead><tr><th colspan = "6">' + nodeName + '</th></tr></thead>';
    //                         htmlContent += '<tbody>'
    //                         htmlContent += '<tr class="table_child_tip"><td></td><td>Target Percent</td><td>Tolerance Type</td><td>Lower Tolerance</td><td>Upper Tolerance</td><td>Rank</td></tr>'
    //                         childData.forEach(element => {
    //                             htmlContent += '<tr class="table_child_tip">';
    //                             htmlContent += '<td>' + element.label + '</td>';
    //                             htmlContent += '<td>' + element.targetPercent + '</td>';
    //                             htmlContent += '<td>' + element.toleranceTypeValue + '</td>';
    //                             htmlContent += '<td>' + element.lowerTolerance + '</td>';
    //                             htmlContent += '<td>' + element.upperTolerance + '</td>';
    //                             htmlContent += '<td>' + element.rank + '</td>';
    //                             htmlContent += '</tr>';
    //                         })
    //                         htmlContent += '</tbody></table>';
    //                         return htmlContent;
    //                     });
    //             }

    //         })
    //         .on("mouseout", function () {
    //             d3.select(".circleHover").style("display", "none");
    //         });

    //     // phantom node to give us mouseover in a radius around it

    //     nodeEnter.append("circle")
    //         .attr('class', 'ghostCircle')
    //         .attr("type", function (d) {
    //             if (d.modelType == undefined)
    //                 return storageInstance.AddingAttributeForDraggingNode(d);
    //             else
    //                 return d.modelType;
    //         })
    //         .attr("r", 60)
    //         .attr("opacity", 0.2) // change this to zero to hide the target area
    //         .style("fill", "green")
    //         .style("display", "none")
    //         .attr('pointer-events', 'mouseover');


    //     // Transition nodes to their new position.

    //     var nodeUpdate = node
    //         .transition()
    //         .duration(that.duration)
    //         .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

    //     nodeUpdate.select("text")
    //         .style("fill-opacity", 1);

    //     // Transition exiting nodes to the parent's new position.

    //     var nodeExit = node.exit()
    //         .transition()
    //         .duration(that.duration)
    //         .attr("transform", function (d) { return "translate(" + source.x + "," + source.y + ")"; })
    //         .remove();

    //     nodeExit.select("circle")
    //         .attr("r", 30);

    //     nodeExit.select("text")
    //         .style("fill-opacity", 1e-6);

    //     // Update the links…

    //     var link = that.svgGroup.selectAll("path.link")
    //         .data(links, function (d) { return d.target.id; });

    //     // Enter any new links at the parent's previous position.

    //     link.enter().insert("path", "g")
    //         .attr("class", "link")
    //         .attr("d", function (d) {
    //             var o = { x: source.x0, y: source.y0 };
    //             return that.diagonal({ source: o, target: o });
    //         })
    //         .style("stroke-width", "4px");

    //     // Transition links to their new position.

    //     link
    //         .transition()
    //         .duration(that.duration)
    //         .attr("d", that.diagonal)
    //         .style("stroke-width", "4px");

    //     // Transition exiting nodes to the parent's new position.

    //     link.exit()
    //         .transition()
    //         .duration(that.duration)
    //         .attr("d", function (d) {
    //             var o = { x: source.x, y: source.y };
    //             return that.diagonal({ source: o, target: o });
    //         })
    //         .remove();

    //     // Stash the old positions for transition.

    //     nodes.forEach(function (d) {
    //         d.x0 = d.x;
    //         d.y0 = d.y;
    //     });
    // }



    // /*Method used to call when click event fired on the nodes */

    // public click(d, storageInstance, that) {
    //     that.clickFlag = true;
    //     if (d.children) {
    //         d._children = d.children;
    //         d.children = null;
    //     } else {
    //         d.children = d._children;
    //         d._children = null;
    //     }
    //     storageInstance.update(d);
    // }


    // /*
    // * Method used to plot the pie chart
    // */

    // public plotPie(nodeEnter, root, nodes) {
    //     var that = this;
    //     var data = [];
    //     var radius = 55;
    //     var arc = d3.svg.arc()
    //         .outerRadius(radius - 10)
    //         .innerRadius(radius - 25);

    //     var pie = <any>d3.layout.pie()
    //         .sort(null)
    //         .value(function (d) {
    //             return d['value'];
    //         });

    //     var g = nodeEnter.selectAll(".arc")
    //         .data(function (d) {
    //             data.push(d);
    //             return pie(d['values'])
    //         })
    //         .enter().append("g")
    //         .attr("class", "arc");


    //     g.append("path")
    //         .attr("d", <any>arc)
    //         .style("fill", function (d, i, j) {
    //             return data[j]['colorArray'][i]
    //         });
    // }


    // /*
    // * Method used to dynamically set up the color for the circle element inside the node based on the 
    // * level of depth and the attributes
    // */

    // public colorCode(d, colorArray, colorCount, colorScale) {
    //     var object = {};
    //     if (d['color'] != undefined) {
    //         object['colorCount'] = colorCount;
    //         object['color'] = d['color'];
    //         return object;
    //     }
    //     if (d['colorCount'] != undefined) {
    //         if (d['htmlDraggedNode'] == true) {
    //             d['color'] = colorScale(d['colorCount']);
    //             object['colorCount'] = colorCount;
    //             object['color'] = colorScale(d['colorCount']);
    //             return object;
    //         }
    //         else {
    //             d['color'] = colorArray[d['colorCount']];
    //             object['colorCount'] = colorCount;
    //             object['color'] = colorArray[d['colorCount']];
    //             return object;
    //         }

    //     }
    //     else if (d['htmlDraggedNode'] == true) {
    //         var comparedCount;
    //         if (d['depth'] == 1) {
    //             comparedCount = 10;
    //         }
    //         else if (d['depth'] == 2) {
    //             comparedCount = 7;
    //         }
    //         else {
    //             comparedCount = 10;
    //         }
    //         if (colorCount == comparedCount) {
    //             colorCount = 0;
    //         }
    //         colorCount++;
    //         d['colorCount'] = colorCount - 1;
    //         d['color'] = colorScale(colorCount - 1);
    //         object['colorCount'] = colorCount;
    //         object['color'] = colorScale(colorCount - 1);
    //         return object;
    //     }
    //     else if (d['colorCount'] == undefined) {
    //         colorCount++;
    //         if (colorArray[colorCount - 1] != undefined) {
    //             d['color'] = colorArray[colorCount - 1];
    //         }
    //         else {
    //             d['color'] = colorScale(colorCount - 1);
    //         }
    //         d['colorCount'] = colorCount - 1;
    //         object['colorCount'] = colorCount;
    //         if (colorArray[colorCount - 1] != undefined)
    //             object['color'] = colorArray[colorCount - 1];
    //         else
    //             object['color'] = colorScale(colorCount - 1);
    //         return object;

    //     }
    // }

    // /*
    // * Method used to place the corresponding color number in the correct level which will be helpful in drawing the 
    // * pie arcs and adds a new attribute to the dataset "colorArray"
    // */

    // public AddingCorrespondingColorNumber(root) {
    //     var that = this;
    //     if (root.length == undefined) {
    //         root = [root];
    //     }
    //     root.forEach((value, key) => {
    //         var values = [];
    //         if (value.children != undefined) {
    //             value.children.forEach((v, k) => {
    //                 values.push(v['color']);
    //             })
    //             value.colorArray = values;
    //             that.AddingCorrespondingColorNumber(value.children);
    //         }
    //         else {
    //             value.colorArray = [value['color']];
    //         }
    //     })
    // }

    // /*Method used to find the type of node based on the depth of the data*/

    // public AddingAttributeForDraggingNode(d) {
    //     if (d.depth == 0) {
    //         return "Parent Node";
    //     }
    //     else if (d.depth == 1) {
    //         return "Category";
    //     }
    //     else if (d.depth == 2) {
    //         return "Class";
    //     }
    //     else if (d.depth == 3) {
    //         return "Sub Class";
    //     }
    //     else if (d.depth == 4) {
    //         return "Ticker Set"
    //     }
    // }



    // /*Method used to validate the Attached Node under some validation cases */

    // public CheckingNodeToBeAddesForValidation(treeElementType, draggedNodeType) {
    //     var AttachNode = true;
    //     switch (treeElementType) {
    //         case "Parent Node": {
    //             if (draggedNodeType == "Sub Class") {
    //                 AttachNode = false;
    //             }
    //             break;
    //         }
    //         case "Category": {
    //             if (draggedNodeType == "Sub Class" || draggedNodeType == "Category" || draggedNodeType == "Multiple Category") {
    //                 AttachNode = false;
    //             }
    //             break;
    //         }
    //         case "Class": {
    //             if (draggedNodeType == "Category" || draggedNodeType == "Class" || draggedNodeType == "Multiple Category") {
    //                 AttachNode = false;
    //             }
    //             break;
    //         }
    //         case "Sub Class": {
    //             if (draggedNodeType == "Category" || draggedNodeType == "Sub Class" || draggedNodeType == "Class" || draggedNodeType == "Multiple Category") {
    //                 AttachNode = false;
    //             }
    //             break;
    //         }
    //         case "Ticker Set": {
    //             AttachNode = false;
    //             break;
    //         }
    //         default: {
    //             AttachNode = false;
    //             break;
    //         }
    //     }
    //     return AttachNode;
    // }

    // /* Method used to delete the particular node and its respective children based on the clicked node by the 
    // user*/

    // public deleteNode(id, root) {
    //     var that = this;
    //     root.children.forEach((value, key) => {
    //         if (value.id == id) {
    //             root.children.splice(key, 1);
    //             root.values.splice(key, 1);
    //             return false;
    //         }
    //         if (value.children != undefined) {
    //             that.deleteNode(id, value);
    //         }
    //     })
    // }




    // /* Method used to check whether the tree is in collapsed mode when user drops some node into the work area */

    // public checkingTheNodesAreCollapsedOrExpanded(data) {
    //     var that = this;
    //     if (data.length == undefined) {
    //         data = [data];
    //     }
    //     data.forEach((value, key) => {
    //         if (Object.keys(value).indexOf("_children") != -1) {
    //             if (value._children != null) {
    //                 value.children = value._children;
    //                 delete value._children;
    //             }
    //         }
    //         if (value.children != undefined) {
    //             that.checkingTheNodesAreCollapsedOrExpanded(value.children);
    //         }
    //     })
    // }


    // /* Method used to change the colors for the ghost circles that are appearing on the back of each node
    //    based on the validation rules.it shows two colors green and red.Green is for accepting  the 
    //    respective dragged element to be appended as a child to the particular node and the red implies 
    //    the opposite */

    // public ChangingColorsForCirclesBasedOnDraggedElement(type) {
    //     var CircleTypesToBeShown = [];
    //     switch (type) {
    //         case "Category": {
    //             CircleTypesToBeShown = ["Parent Node"];
    //             break;
    //         }
    //         case "Class": {
    //             CircleTypesToBeShown = ["Parent Node", "Category"];
    //             break;
    //         }
    //         case "Sub Class": {
    //             CircleTypesToBeShown = ["Class"];
    //             break;
    //         }
    //         case "SECURITY_SET": {
    //             CircleTypesToBeShown = ["Parent Node", "Category", "Class", "Sub Class"];
    //             break;
    //         }
    //         case "Multiple Category": {
    //             CircleTypesToBeShown = ["Parent Node"];
    //             break;
    //         }
    //         default: {
    //             break;
    //         }

    //     }
    //     d3.selectAll('g.node').each(function () {
    //         if (CircleTypesToBeShown.indexOf($(this).find("text").attr("type")) == -1) {
    //             $(this).find(".ghostCircle").css("fill", "red");
    //         }
    //         else {
    //             $(this).find(".ghostCircle").css("fill", "green");
    //         }
    //     });
    // }

    // //function to wrap text of nodes in tree chart
    // public wrap(text, width) {
    //     text.each(function (evt) {
    //         var text = d3.select(this),
    //             separator = [' ', '\\\+', '-', '\\\(', '\\\)', '\\*', '/', ':', '\\\?', ' -', '  ', '- ', '--', ' - '],
    //             showtext = evt.nodeName;
    //         var textLength = showtext.length;
    //         if (textLength > 15) {
    //             var remainingletter = showtext.slice(15);
    //             showtext = showtext.replace(remainingletter, '...');
    //         }
    //         var words = showtext.split(new RegExp(separator.join('|'), 'g')).reverse();
    //         var i = words.length;
    //         var y: number;
    //         var lineHeight; // ems
    //         var displayname;
    //         switch (i) {
    //             case 1:
    //                 {
    //                     y = 0;
    //                     lineHeight = 0.35;
    //                     break;
    //                 }
    //             case 2:
    //                 {
    //                     y = -21;
    //                     lineHeight = 1.2;
    //                     break;
    //                 }
    //             case 3:
    //                 {
    //                     y = -21;
    //                     lineHeight = 1.0;
    //                     break;
    //                 }
    //             case 4:
    //                 {
    //                     y = -35;
    //                     lineHeight = 1.3;
    //                     break;
    //                 }
    //             default:
    //                 {
    //                     y = -35;
    //                     lineHeight = 1.2;
    //                 }
    //         }
    //         var word;
    //         var line = [];
    //         var lineNumber = 0;
    //         var dy = parseFloat(text.attr("dy"));
    //         var tspan = <any>text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

    //         if (words.length > 1) {
    //             while (word = words.pop()) {
    //                 line.push(word);
    //                 tspan.text(line.join(" "));
    //                 if (tspan.node().getComputedTextLength() > width) {
    //                     line.pop();
    //                     tspan.text(line.join(" "));
    //                     line = [word];
    //                     tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
    //                 } else {
    //                     line.pop();
    //                     tspan.text(line.join(" "));
    //                     line = [word];
    //                     tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
    //                 }
    //             }
    //         } else {
    //             tspan = <any>text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em").text(words)
    //         }

    //     });
    // }
}


