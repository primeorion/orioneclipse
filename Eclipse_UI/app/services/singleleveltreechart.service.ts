import { Injectable, Inject } from '@angular/core';
import * as d3  from 'd3';
declare var $: JQueryStatic;

@Injectable()
export class SingleLevelTreeChart {
    public CreateSingleLevelTreeChart(DomElement, treeData) {
        dragAndDropForHtml();
        var margin = { top: 80, right: 120, bottom: 20, left: 120 },
            width = 1000 - margin.right - margin.left,
            height = 800 - margin.top - margin.bottom;

        var selectedNode = null;
        var draggingNode = <any>[];

        var i = 0,
            duration = 750,
            root;

        var tree = d3.layout.tree()
            .size([height, width]);

        var color = <any>d3.scale.category20b();

        var diagonal = <any>d3.svg.diagonal()
            .projection(function (d) { return [d.x, d.y]; });
        var dragListener = d3.behavior.drag()
            .on("drag", function (d) {
                console.log(d, "d")
                var node = d3.select(this);
                var y = d3.event['y'];
                var x = d3.event['x'];
                node.attr("transform", "translate(" + x + "," + y + ")").style("cursor", "pointer");
            });

        var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 1.4]).on("zoom", zoom);
        var svg = d3.select(DomElement).append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .call(zoomListener)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(dragListener)

        // Define the zoom function for the zoomable tree

        function zoom() {
            svg.attr("transform", "translate(" + d3.event['translate'] + ")scale(" + d3.event['scale'] + ")");
        }


        root = treeData;
        root.x0 = height / 2;
        root.y0 = 0;

        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        root.children.forEach(collapse);
        update(root);


        d3.select(self.frameElement).style("height", "800px");
        var count = 0;
        function dragAndDropForHtml() {
            var dragElement = '';
            var dropElement = '';

            $('.list_drag').bind('dragstart', <any>function (evt) {
                evt.originalEvent.dataTransfer.setData('text', this.id);
                dragElement = evt.currentTarget.innerText;
            })
            var nodes;
            $('.singleLevel_tree').bind('dragover', function (evt) {

                evt.preventDefault();
            })
                .bind('dragenter', function (evt) {
                    nodes = tree.nodes(evt);
                    evt.preventDefault();
                })
                .bind('drop', <any>function (evt) {
                    if (evt.toElement.nodeName == "circle") {
                        dropElement = evt.toElement.parentNode.textContent;
                    }
                    else if (evt.toElement.nodeName == "text") {
                        dropElement = evt.toElement.textContent;
                    }
                    else {
                        dropElement = "null";
                    }
                    if (dropElement != "null") {
                        var childrenObject = {
                            "name": dragElement,
                            "parent": dropElement,
                            "values": [
                                {
                                    "value": 50
                                }
                            ]
                        }

                        selectedNode = evt.toElement.__data__;
                        console.log(evt.toElement.__data__, "swe")
                        if (evt.toElement.__data__.depth == 0) {
                            AttachingNodesToTree(dragElement, dropElement, root, childrenObject);

                            count++;
                            console.log(selectedNode.name, "rootafter")
                            d3.selectAll('g.Treenode').each(function () {
                                console.log($(this), "this")
                                var textContent = $(this)[0].textContent;
                                if (selectedNode.name == textContent) {
                                    d3.select(this).remove();
                                }
                                console.log(textContent, "textContent")
                            }
                            )

                            update(root);

                        }

                    }

                })
        }

        function AttachingNodesToTree(dragElement, dropElement, root, childrenObject) {
            if (root.length == undefined) {
                root = [root];
            }
            $.each(root, function (key, value) {
                if (value.name == dropElement) {
                    var childObjectValues = childrenObject.values;
                    var totalValue = 0;
                    $.each(childObjectValues, function (k, v) {
                        totalValue += v.value;
                    });
                    if (value.children == undefined) {
                        value.children = [];
                    }
                    else {
                        value.values.push({ "value": totalValue });
                    }

                    value.children.push(childrenObject);
                }
                if (value.children != undefined) {
                    AttachingNodesToTree(dragElement, dropElement, value.children, childrenObject);
                }
            });
        }
        var colorArrayUpdate = <any>d3.scale.category20();
        function update(source) {

            // Compute the new height, function counts total children of root node and sets tree height accordingly.
            // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
            // This makes the layout more consistent.
            var levelWidth = [1];
            var childCount = function (level, n) {

                if (n.children && n.children.length > 0) {
                    if (levelWidth.length <= level + 1) levelWidth.push(0);

                    levelWidth[level + 1] += n.children.length;
                    n.children.forEach(function (d) {
                        childCount(level + 1, d);
                    });
                }
            };
            childCount(0, root);
            var newHeight = d3.max(levelWidth) * 105; // 25 pixels per line  
            tree = tree.size([newHeight, width]);
            var parentStoring = {}, colorCount2 = 0, colorCount3 = 0, colorCount4 = 0, colorLength = [];
            AddingLevelAttribute(root, parentStoring);
            // colorCount2++;
            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
                links = tree.links(nodes);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) { d.y = d.depth * 200; });
            console.log(nodes, "nodes")
            // Update the nodes…
            var node = svg.selectAll("g.Treenode")
                .data(nodes, function (d) {
                    // console.log(d["id"], "d", i)
                    if (d["id"] == undefined) {
                        return d['id'] || (d['id'] = ++i);
                    } else {
                        return d['id'] || (d['id'] = count);
                    }
                })

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "Treenode")
                .attr("transform", function (d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
                .on("click", click);
            /*Plotting pie chart*/
            var colorLevel1 = 0;

            nodeEnter.append("circle")
                .attr("r", 1e-6)
                // .style("fill", function (d) { return d['_children'] ? "lightsteelblue" : "#fff"; });
                .style("fill", function (d, i, j) {
                    // console.log(d, "d")
                    if (d['depth'] == 0) {
                        d['color'] = '#cccccc';
                        d['colorCount'] = 0;
                        return "#cccccc";
                    }
                    else if (d['depth'] == 1) {

                        if (count == undefined) {
                            var colorArray = ["#6495ED", "#007E00", "#C0FFC0", "red", "steelblue", "green", "yellow"];
                            colorCount2++;
                            d['color'] = colorArray[colorCount2 - 1];
                            // console.log(d, "colorCount2", i, j, count)

                            if (d['colorCount'] == undefined) {
                                d['colorCount'] = colorCount2 - 1;

                                return colorArray[colorCount2 - 1];
                            }
                            else {
                                d['color'] = colorArray[d['colorCount']];
                                return colorArray[d['colorCount']];
                            }
                        } else {
                            d['color'] = colorArrayUpdate(count - 1);
                            console.log(d['color'], count, colorArrayUpdate(count - 1))

                            if (d['colorCount'] == undefined) {
                                d['colorCount'] = count - 1;
                                // console.log(count - 1, "gvgv",colorArrayUpdate(count - 1),colorArrayUpdate.range(),colorArrayUpdate(count))
                                return colorArrayUpdate(count - 1);
                            }
                            else {
                                d['color'] = colorArrayUpdate(d['colorCount']);
                                return colorArrayUpdate(d['colorCount']);
                            }
                        }
                    }
                    else {
                        d['color'] = color(i)
                        return color(i)
                    }
                });
            AddingCorrespondingColorNumber(root);
            plotPie(nodeEnter, root, nodes);

            nodeEnter.append("text")
                .attr("x", function (d) { return d.children || d['_children'] ? -6 : 2; })
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .text(function (d) { return d['name']; })
                .style("fill-opacity", 1e-6)
                .style("font-size", "10px");
            nodeEnter.append("circle")
                .attr('class', 'ghostCircleHTML')
                .attr("r", 45)
                .attr("opacity", 0) // change this to zero to hide the target area
                .style("fill", "white")
                .attr('pointer-events', 'mouseover')
                .on("dragenter", function (d) {
                    overCircle(d);
                    if (d.depth == 0) {
                        $(this).attr("opacity", 0.2);
                        $(this).css("fill", "green");
                    } else {
                        $(this).attr("opacity", 0.2);
                        $(this).css("fill", "red");
                    }
                })
                .on("dragleave", function (d) {
                    // console.log("here", $(this))
                    outCircle(d);
                    $(this).attr("opacity", 0);
                })
                .on("drop", function (d) {
                    console.log("drop");
                    outCircle(d);
                    $(this).attr("opacity", 0);
                });


            /*Plotting pie chart*/
            plotPie(nodeEnter, root, nodes);
            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

            nodeUpdate.select("circle")
                .attr("r", 30.5);
            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d) { return "translate(" + source.x + "," + source.y + ")"; })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links…
            var link = svg.selectAll("path.link")
                .data(links, function (d) { return d.target['id']; });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function (d) {
                    var o = { x: source.x0, y: source.y0 };
                    return diagonal({ source: o, target: o });
                }).style("fill", "none")
                .style("stroke", "#ccc")
                .style("stroke-width", "3.5px");

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function (d) {
                    var o = { x: source.x, y: source.y };
                    return diagonal({ source: o, target: o });
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d['x0'] = d.x;
                d['y0'] = d.y;
            });
        }

        /*
* Function used to plot the pie chart
*/

        function plotPie(nodeEnter, root, nodes) {
            var data = [];
            var radius = 40;
            var arc = d3.svg.arc()
                .outerRadius(radius - 10)
                .innerRadius(radius - 15);
            var pie = <any>d3.layout.pie()
                .sort(null)
                .value(function (d) {
                    return d['value'];
                });
            var g = nodeEnter.selectAll(".arc")
                .data(function (d) {
                    data.push(d);
                    return pie(d['values'])
                })
                .enter().append("g")
                .attr("class", "arc");
            g.append("path")
                .attr("d", <any>arc)
                .style("fill", function (d, i, j) {
                    // console.log(data[j]['colorArray'][i], "colco")
                    return data[j]['colorArray'][i]
                });
        }

        /*
        * Function to be called when the dragging is completed.It will help to place the arc values according to the dragging
        * element
        */

        function AddingParentValues(root, nodes, selectedNode, valuesStroing, colorArray, draggingNode) {
            var count = 0;
            var totalValue = 0;
            var index = 0;
            if (root.length == undefined) {
                root = [root];
            }
            $.each(root, function (key, value) {
                if (value.name == draggingNode.parent.name) {
                    $.each(valuesStroing, function (a, b) {
                        totalValue += b.value;
                    });
                    $.each(value.values, function (c, d) {
                        if (d.value == totalValue) {
                            index = c;
                        }
                    });
                    value['values'].splice(index, 1)
                }
                else if (value.name == selectedNode.name) {
                    $.each(valuesStroing, function (i, j) {
                        value.values.push(j);
                    });
                    $.each(colorArray, function (k, v) {
                        value.colorArray.push(v);
                    })
                }
                if (value.children != undefined) {
                    AddingParentValues(value.children, nodes, selectedNode, valuesStroing, colorArray, draggingNode);
                }
            });
        }

        /*
        * Function used to find the level attribute based on the parent and the child levels and add a new attribute 
        * to the dataset "level"
        */

        function AddingLevelAttribute(root, parentStoring) {
            if (root.length == undefined)
                root = [root];
            $.each(root, function (key, value) {
                var keys = Object.keys(parentStoring);
                if (keys.length == 0) {
                    value.level = 1;
                    parentStoring[value.name] = value.level
                }
                else if (keys.indexOf(value.parent) != -1) {
                    value.level = parentStoring[value.parent] + 1;
                    parentStoring[value.name] = value.level
                }
                if (value.children != undefined)
                    AddingLevelAttribute(value.children, parentStoring);

            })
        }

        /*
        * Function used to place the corresponding color number in the correct level which will be helpful in drawing the 
        * pie arcs and adds a new attribute to the dataset "colorArray"
        */

        function AddingCorrespondingColorNumber(root) {
            if (root.length == undefined) {
                root = [root];
            }
            $.each(root, function (key, value) {
                var values = [];
                if (value.children != undefined) {
                    $.each(value['children'], function (k, v) {
                        values.push(v['color']);
                    })
                    value.colorArray = values;
                    AddingCorrespondingColorNumber(value.children);
                }
                else {
                    value.colorArray = [value['color']];
                }
            })
        }

        // Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            }
            else {
                d.children = d._children;
                d._children = null;
            }
            update(d);


        }

        var overCircle = function (d) {
            selectedNode = d;
            if (d.depth == 0) {
                updateTempConnector();
            }

        };
        var outCircle = function (d) {
            selectedNode = null;
            if (d.depth == 0) {
                updateTempConnector();
            }

        };
        // Function to update the temporary connector indicating dragging affiliation
        var updateTempConnector = function () {
            var data = [];
            if (draggingNode !== null && selectedNode !== null) {
                // have to flip the source coordinates since we did this for the existing connectors on the original tree

                data = [{
                    source: {
                        x: selectedNode.y0,
                        y: selectedNode.x0
                    },
                    target: {
                        x: selectedNode['y0'] + 20,
                        y: selectedNode['x0'] + 20
                        // x: draggingNode['y0'] + 20,
                        // y: draggingNode['x0'] + 20
                    }
                }];
            }
            // define a d3 diagonal projection for use by the node paths later on.
            var diagonal1 = d3.svg.diagonal()
                .projection(function (d) {
                    return [d.y, d.x];
                });

            var link = svg.selectAll(".templink").data(data);

            link.enter().append("path")
                .attr("class", "templink")
                .attr("d", diagonal1)
                .style("fill", "none")
                .style("stroke", "red")
                .style("stroke-width", "3px")
                .attr('pointer-events', 'none');

            link.attr("d", diagonal1);

            link.exit().remove();
        };

    }


}