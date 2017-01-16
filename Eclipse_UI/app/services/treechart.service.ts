import { Injectable, Inject } from '@angular/core';
import * as d3  from 'd3';
declare var $: JQueryStatic;

@Injectable()
export class TreeCharts {
    public CreateTreeChart(DomElement, treeData) {
        dragAndDropForHtml();
        var totalNodes = 0;
        var maxLabelLength = 0;
        // variables for drag/drop
        var selectedNode = null;
        var draggingNode = null;
        // panning variables
        var panSpeed = 200;
        var panBoundary = 20; // Within 20px from edges will pan when dragging.
        // Misc. variables
        var i = 0;
        var translateCoords, translateX, translateY, scaleX, scaleY, scale, panTimer, nodes, dragStarted, domNode;
        var duration = 750;
        var root;

        // size of the diagram
        var margin = { top: 50, left: 80, bottom: 80, right: 80 },
            viewerHeight = 800 - margin.top - margin.bottom,
            viewerWidth = 1200 - margin.left - margin.right;


        var tree = d3.layout.tree()
            .size([viewerHeight, viewerWidth]);
        var color = <any>d3.scale.category20b();
        // define a d3 diagonal projection for use by the node paths later on.
        var diagonal = <any>d3.svg.diagonal()
            .projection(function (d) {
                return [d.x + viewerWidth / 3, d.y + viewerHeight / 3];
            });

        // A recursive helper function for performing some setup by walking through all nodes

        function visit(parent, visitFn, childrenFn) {
            if (!parent) return;

            visitFn(parent);

            var children = childrenFn(parent);
            if (children) {
                var count = children.length;
                for (var i = 0; i < count; i++) {
                    visit(children[i], visitFn, childrenFn);
                }
            }
        }
        // Call visit function to establish maxLabelLength
        visit(treeData, function (d) {
            totalNodes++;
            maxLabelLength = Math.max(d.name.length, maxLabelLength);

        }, function (d) {
            return d.children && d.children.length > 0 ? d.children : null;
        });

        // sort the tree according to the node names

        function sortTree() {
            tree.sort(function (a, b) {
                return b['name'].toLowerCase() < a['name'].toLowerCase() ? 1 : -1;
            });
        }
        // Sort the tree initially incase the JSON isn't in a sorted order.
        sortTree()

        // Define the zoom function for the zoomable tree

        function zoom() {
            svgGroup.attr("transform", "translate(" + d3.event['translate'] + ")scale(" + d3.event['scale'] + ")");
        }


        // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
        var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

        function initiateDrag(d, domNode) {
            draggingNode = d;
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show').style("fill", "#006400");
            d3.select(domNode).attr('class', 'node activeDrag').style("cursor", "pointer");

            svgGroup.selectAll("g.node").sort(function (a, b) {
                // select the parent and sort the path's
                if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
                else return -1; // a is the hovered element, bring "a" to the front
            });
            // if nodes has children, remove the links and nodes
            if (nodes.length > 1) {
                // remove link paths
                var links = tree.links(nodes);
                var nodePaths = svgGroup.selectAll("path.link")
                    .data(links, function (d) {
                        return d.target['id'];
                    }).remove();
                // remove child nodes
                var nodesExit = svgGroup.selectAll("g.node")
                    .data(nodes, function (d) {
                        return d['id'];
                    }).filter(function (d, i) {
                        if (d['id'] == draggingNode.id) {
                            return false;
                        }
                        return true;
                    }).remove();
            }

            // remove parent link
            var parentLink = tree.links(tree.nodes(draggingNode.parent));
            svgGroup.selectAll('path.link').filter(function (d, i) {
                if (d.target.id == draggingNode.id) {
                    return true;
                }
                return false;
            }).remove();

            dragStarted = null;
        }

        // define the baseSvg, attaching a class for styling and the zoomListener
        var baseSvg = d3.select(DomElement).append("svg:svg")
            .attr("width", viewerWidth)
            .attr("height", viewerHeight)
            .attr("class", "overlay")
            .call(zoomListener);

        // Define the drag listeners for drag/drop behaviour of nodes.
        var dragListener = d3.behavior.drag()
            .on("dragstart", function (d) {
                if (d == root) {
                    return;
                }
                dragStarted = true;
                nodes = tree.nodes(d);
                d3.event['sourceEvent'].stopPropagation();
                // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
            })
            .on("drag", function (d) {
                if (d == root) {
                    return;
                }
                if (dragStarted) {
                    domNode = this;
                    initiateDrag(d, domNode);
                }
                clearTimeout(panTimer);
                d['x0'] += d3.event['dx'];
                d['y0'] += d3.event['dy'];
                var node = d3.select(this);
                var y = d['y0'] + viewerHeight / 3;
                var x = d['x0'] + viewerWidth / 3;
                node.attr("transform", "translate(" + x + "," + y + ")").style("cursor", "pointer");
                updateTempConnector();
            }).on("dragend", function (d) {
                if (d == root) {
                    return;
                }
                domNode = this;
                if (selectedNode) {
                    d3.selectAll('g.node').each(function () {
                        var textContent = $(this).find(".nodeText")[0].textContent;
                        if (selectedNode.name == textContent || draggingNode.name == textContent || draggingNode.parent.name == textContent) {
                            d3.select(this).remove();
                        }
                    });

                    // now remove the element from the parent, and insert it into the new elements children
                    var index = draggingNode.parent.children.indexOf(draggingNode);
                    if (index > -1) {
                        draggingNode.parent.children.splice(index, 1);
                    }
                    if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                        if (typeof selectedNode.children !== 'undefined') {
                            selectedNode.children.push(draggingNode);
                        } else {
                            selectedNode._children.push(draggingNode);
                        }
                    } else {
                        selectedNode.children = [];
                        selectedNode.children.push(draggingNode);
                    };
                    var valuesStroing = [];
                    var colorArray = [];
                    var val = 0;
                    $.each([draggingNode], function (key, value) {
                        $.each(value["values"], function (k, v) {
                            val += v.value;
                        });
                        valuesStroing.push({ "value": val });
                        colorArray = value.colorArray;
                    });
                    AddingParentValues(root, nodes, selectedNode, valuesStroing, colorArray, draggingNode);
                    // Make sure that the node being added to is expanded so user can see added node is correctly moved
                    expand(selectedNode);
                    sortTree();
                    endDrag();
                } else {
                    endDrag();
                }
            });

        function endDrag() {
            selectedNode = null;
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
            d3.select(domNode).attr('class', 'node').style("cursor", "pointer");
            // now restore the mouseover event or we won't be able to drag a 2nd time
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');

            updateTempConnector();
            if (draggingNode !== null) {
                update(root);
                draggingNode = null;
            }
        }

        // Helper functions for collapsing and expanding nodes.

        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        function expand(d) {
            if (d._children) {
                d.children = d._children;
                d.children.forEach(expand);
                d._children = null;
            }
        }

        var overCircle = function (d) {
            selectedNode = d;
            updateTempConnector();
        };
        var outCircle = function (d) {
            selectedNode = null;
            updateTempConnector();
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
                        x: draggingNode.y0,
                        y: draggingNode.x0
                    }
                }];
            }

            // define a d3 diagonal projection for use by the node paths later on.
            var diagonal1 = d3.svg.diagonal()
                .projection(function (d) {
                    return [d.y + viewerWidth / 3, d.x + viewerHeight / 3];
                });

            var link = svgGroup.selectAll(".templink").data(data);

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

        // Toggle children function

        function toggleChildren(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else if (d._children) {
                d.children = d._children;
                d._children = null;
            }
            return d;
        }

        // Toggle children on click.

        function click(d) {
            if (d3.event['defaultPrevented']) return; // click suppressed
            d = toggleChildren(d);
            update(d);
        }

        function clickLink(d) {
            d = d.target;
            //if (d3.event.defaultPrevented) return; // click suppressed
            d = toggleChildren(d);
            update(d);
        }

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
            tree = tree.size([newHeight, viewerWidth]);
            var parentStoring = {}, colorCount2 = 0, colorCount3 = 0, colorCount4 = 0, colorLength = [];
            AddingLevelAttribute(root, parentStoring);

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
                links = tree.links(nodes);
            // Set widths between levels based on maxLabelLength.
            nodes.forEach(function (d) {
                d.y = (d.depth * (maxLabelLength * 9)); //maxLabelLength * 10px
                // alternatively to keep a fixed scale one can set a fixed depth per level
                // Normalize for fixed-depth by commenting out below line
                // d.y = (d.depth * 500); //500px per level.
            });
            // Update the nodes…
            var node = svgGroup.selectAll("g.node")
                .data(nodes, function (d) {
                    return d['id'] || (d['id'] = ++i);
                });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .call(dragListener)
                .attr("class", "node")
                .style("cursor", "pointer")
                .attr("transform", function (d) {
                    var x = source.x0 + viewerWidth / 3;
                    var y = source.y0 + viewerHeight / 3;
                    return "translate(" + x + "," + y + ")";
                })
                .on('click', click);

            /*Plotting pie chart*/
            var colorLevel1 = 0;

            nodeEnter.append("circle")
                .attr('class', 'nodeCircle')
                .attr("r", 25)
                .style("fill", function (d, i, j) {
                    if (d['depth'] == 0) {
                        d['color'] = '#cccccc';
                        d['colorCount'] = 0;
                        return "#cccccc";
                    }
                    else if (d['depth'] == 1) {
                        var colorArray = ["#6495ED", "#007E00", "#C0FFC0"];
                        colorCount2++;
                        d['color'] = colorArray[colorCount2 - 1];
                        if (d['colorCount'] == undefined) {
                            d['colorCount'] = colorCount2 - 1;
                            return colorArray[colorCount2 - 1];
                        }
                        else {
                            d['color'] = colorArray[d['colorCount']];
                            return colorArray[d['colorCount']];
                        }
                    }
                    else if (d['depth'] == 2) {
                        var colorArray = ["#A282C4", "#FF0000", "#FFC132", "#58B501", "#C95F99", "#DA1B06", "#21841D"];
                        colorCount3++;
                        d['color'] = colorArray[colorCount3 - 1];
                        if (d['colorCount'] == undefined) {
                            d['colorCount'] = colorCount3 - 1;
                            return colorArray[colorCount3 - 1];
                        }
                        else {
                            d['color'] = colorArray[d['colorCount']];
                            return colorArray[d['colorCount']];
                        }

                    }
                    else if (d['depth'] == 3) {
                        var colorArray = ["#2F0B3A", "#121892", "#FFC080", "#58B501", "#3B0B0B", "#196A35", "#C95F03", "#AB0101", "#CCCCCC", "#BAFCCC"]
                        colorCount4++;
                        if (d['colorCount'] == undefined) {
                            d['color'] = colorArray[colorCount4 - 1];
                            d['colorCount'] = colorCount4 - 1
                            return colorArray[colorCount4 - 1];
                        }
                        else {
                            d['color'] = colorArray[d['colorCount']];
                            return colorArray[d['colorCount']];
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
                .attr("x", function (d) {
                    return d.children || d['_children'] ? -10 : 10;
                })
                .attr("dy", ".35em")
                .attr('class', 'nodeText')
                .attr("text-anchor", function (d) {
                    return d.children || d['_children'] ? "end" : "middle";
                })
                .style("font-size", "10px")
                .text(function (d) {
                    return d['name'];
                })
                .style("fill-opacity", 0);


            // phantom node to give us mouseover in a radius around it
            nodeEnter.append("circle")
                .attr('class', 'ghostCircle')
                .attr("r", 45)
                .attr("opacity", 0.2) // change this to zero to hide the target area
                .style("fill", "white")
                .style("display", "none")
                .attr('pointer-events', 'mouseover')
                .on("mouseover", function (node) {
                    overCircle(node);
                })
                .on("mouseout", function (node) {
                    outCircle(node);
                });

            // Update the text to reflect whether node has children or not.
            node.select('text')
                .attr("x", function (d) {
                    return 0;
                    //return d.children || d['_children'] ? -10 : 10;
                })
                .attr("text-anchor", function (d) {
                    return "middle";
                    //return d.children || d['_children'] ? "end" : "start";
                })
                .style("font-family", "sans-serif")
                .style("font-size", "10px")
                .style("fill", "#000")
                .style("font-weight", "bold")
                .text(function (d) {
                    return d['name'];
                });


            /*Plotting pie chart*/
            plotPie(nodeEnter, root, nodes);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function (d) {
                    var y = d.y + viewerHeight / 3;
                    var x = d.x + viewerWidth / 3;
                    return "translate(" + x + "," + y + ")";
                });

            // Fade the text in
            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d) {
                    var x = source.x + viewerWidth / 3;
                    var y = source.y + viewerHeight / 3;
                    return "translate(" + x + "," + y + ")";
                })
                .remove();


            nodeExit.select("text")
                .style("fill-opacity", 0);

            // Update the links…
            var link = svgGroup.selectAll("path.link")
                .data(links, function (d) {
                    return d.target['id'];
                });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .style("cursor", "pointer")
                .style("fill", "none")
                .style("stroke", "#fff")
                .style("stroke-width", "4px")
                .attr("d", function (d) {
                    var o = {
                        x: source.x0,
                        y: source.y0
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .on('click', clickLink);

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function (d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d['x0'] = d.x;
                d['y0'] = d.y;
            });
        }


        function dragAndDropForHtml() {
            var dragElement = '';
            var dropElement = '';
            $('.list_drag').bind('dragstart', <any>function (evt) {
                evt.originalEvent.dataTransfer.setData('text', this.id);
                dragElement = evt.currentTarget.innerText;
            });

            $('.node_tree').bind('dragover', function (evt) {
                evt.preventDefault();
            })
                .bind('dragenter', function (evt) {
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
                                    "value": 10
                                }
                            ]
                        }
                        AttachingNodesToTree(dragElement, dropElement, root, childrenObject);
                        d3.selectAll('g.node').each(function () {
                            var textContent = $(this).find(".nodeText")[0].textContent;
                            if (textContent == dropElement) {
                                d3.select(this).remove();
                            }
                        });
                        update(root);
                    }

                });

        }
        // Append a group which holds all nodes and which the zoom Listener can act upon.
        var svgGroup = baseSvg.append("g").attr("transform", "translate(" + (-viewerWidth / 3.2) + ",-70)");

        // Define the root
        root = treeData;
        root.x0 = viewerHeight / 2;
        root.y0 = 0;

        // Layout the tree initially and center on the root node.
        update(root);
    }
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
    var childrenLength = root.length;
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
            })
            $.each(colorArray, function (k, v) {
                value.colorArray.push(v);
            })
        }
        else {
            if (value.children != undefined) {
                AddingParentValues(value.children, nodes, selectedNode, valuesStroing, colorArray, draggingNode);
            }
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

function dragAndDropForHtml() {
    var dragElement = '';
    var dropElement = '';
    $('.list_drag').bind('dragstart', <any>function (evt) {
        evt.originalEvent.dataTransfer.setData('text', this.id);
        dragElement = evt.currentTarget.innerText;
    });

    $('.node_tree').bind('dragover', function (evt) {
        evt.preventDefault();
    })
        .bind('dragenter', function (evt) {
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
        });

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
