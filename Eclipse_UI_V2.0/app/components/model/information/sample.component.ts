import { Component, EventEmitter, Renderer, ElementRef, Output, Input} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { Http, Response, Headers } from '@angular/http';
import {TreeCharts} from '../../../services/treechart.service';
import {TreeStructure} from '../../../services/tree_data';
import * as d3  from 'd3';
declare var $: JQueryStatic;

@Component({
    selector: 'eclipse-model-tree',
    templateUrl: './app/components/model/information/sample.component.html',
    providers: [TreeCharts]
})

export class TreeComponent extends BaseComponent {

    @Output() viewModelDetail = new EventEmitter();
    private displayReassign: boolean;
    public droppedElement: any = {};
    public data_structure: TreeStructure;
    tree: any;
    drop: any = {};

    @Input() displayPopuptest: boolean;

    constructor(el: ElementRef, renderer: Renderer, private _treeChart: TreeCharts) {
        super();
        this.data_structure = new TreeStructure();
    }

    ngOnInit() {
        var that = this;
        var data = [
            {
                "name": "Parent Node",
                "parent": "null",
                "Type": "Parent Node",
                "id": "mainParent",
                "Tolerance": [{
                    "upper-Tol": 1.5,
                    "lower-Tol": 2
                }],
                "values": [
                    {
                        "id": "PN1",
                        "value": 50
                    },
                ]
            }
        ]

        that.data_structure.root = data[0];
        that.data_structure.domElement = ".node_tree";
        that.tree = new TreeCharts();
        that.tree.createSvg(".node_tree", data);
        that.dragAndDropForHtml(that.data_structure);
        that.AttachDynamicContextMenu();
        that.catchingMouseRightClickEvent(that.data_structure);
        that.CatchingContextMenuEvent(that.data_structure);

    }
    /*
    * Function used to catch the drag events On html elements and calls the respective functions
    * in order to attach the respective html element as a node of the tree
    */

    public dragAndDropForHtml(dataStructure) {
        var that = this;

        $('.drag_list').bind('dragstart', <any>function (evt) {
            evt.originalEvent.dataTransfer.setData('text', this.id);
            d3.selectAll(".ghostCircle").style("display", "block");
            dataStructure.dragElement = evt.toElement.firstChild.textContent;
            that.tree.ChangingColorsForCirclesBasedOnDraggedElement(dataStructure.dragElement);

        });

        $('.node_tree').bind('dragover', function (evt) {
            evt.preventDefault();
        })
            .bind('dragenter', function (evt) {
                evt.preventDefault();
            })
            .bind('drop', <any>function (evt) {
                $('.displaynode_tree .ui-dialog').css("display", "block");
                $('.displaynode_tree .ui-dialog').css("opacity", "1");
                if (dataStructure.dragElement != '') {
                    d3.selectAll(".ghostCircle").style("fill", "green");
                    d3.selectAll(".ghostCircle").style("display", "none");
                    if (evt.toElement.nodeName == "circle") {
                        dataStructure.dropElement = evt.toElement.parentNode.textContent;
                    }
                    else if (evt.toElement.nodeName == "text") {
                        dataStructure.dropElement = evt.toElement.textContent;
                    }
                    else if (evt.toElement.nodeName == "path") {
                        $(evt.toElement.parentElement.parentNode.childNodes).each(function () {
                            if ($(this).prop('tagName') == "text") {
                                dataStructure.dropElement = $(this).text();
                                that.data_structure.droppedElementType = $(this).attr("type");
                            }
                        })
                    }
                    else {
                        dataStructure.dropElement = "null";
                    }
                    if (dataStructure.dropElement != "null") {
                        if (evt.toElement.nodeName != "path") {
                            that.data_structure.droppedElementType = evt.target.attributes["type"].value;
                        }
                        that.droppedElement.name = dataStructure.dropElement;
                        that.displayReassign = true;
                    }
                    else {
                        alert("Warning!!!please drag the element on center of tree nodes to append the element as child to the node!!!")
                    }
                }
            });
    }

    /*
    * Method used to display the custom context menu when user clicked on the tree nodes
    */

    public AttachDynamicContextMenu() {
        var that = this;
        //Appending an element to the dom to show the context menu
        var contextDiv = d3.select(that.data_structure.domElement)
            .append("div")
            .attr("id", "contextmenu");

        that.appendingDynamicContextMenu(contextDiv);


        /*Preventing the default right click event on context menu */

        $('body').on('contextmenu', '#contextmenu', function (e) {
            e.preventDefault();
        });

        //Event to be fired in order to close the custom context menu

        $(document).click(function (e) {
            $("#contextmenu").fadeOut(200);
        });
    }

    /*Method used to catch the mouse right click event and is responsible for disabling the 
    pre defined context menu and it will show our custom context menu */

    public catchingMouseRightClickEvent(datastructure) {
        //Event to be fired when user clicked on right mouse button

        $('body').on('contextmenu', 'g.node', function (e) {
            datastructure.selectedDomNode = this;
            e.preventDefault();
            // if ($(this).find('text').text() != 'Parent Node') {
            if ($("#contextmenu").css("display") == "block") {
                $("#contextmenu").css({
                    display: 'none',
                    top: e.offsetY,
                    left: e.offsetX
                });

            } else {
                $("#contextmenu").css({
                    display: 'inline-block',
                    top: e.offsetY,
                    left: e.offsetX
                });
            }
            // }
        });
    }

    /*Method used to catch the event on context menu and performs the respective action based on the user selection */

    public CatchingContextMenuEvent(datastructure) {
        var that = this;
        //Catching the context menu item on which user is clicked

        $('body').on('click', 'item[state="grey"]', function (e) {
            that.CancelingTheEdit(datastructure.root, that);
            var selectedAction = $(this).attr("action");
            var selectedTreeNode = $(datastructure.selectedDomNode).find("text").text();
            d3.selectAll(".link").style("stroke-width", "0px");
            d3.selectAll(".ghostCircle").style("display", "block");
            d3.selectAll("#contextmenu item").remove();

            //Need to disable the remaining childs other than the selected node and its children

            if (selectedAction == "EditSubstitute") {
                datastructure.storingselectedSubstitudeValue.push(selectedTreeNode);
                that.tree.disablingTreeNodesForSubstitution(datastructure.root, datastructure, selectedTreeNode);
                d3.selectAll('g.node').each(function () {
                    var textContent = $(this).find(".nodeText")[0].textContent;
                    if (datastructure.storingselectedSubstitudeValue.indexOf(textContent) == -1) {
                        e.preventDefault();
                        d3.select(this).style("pointer-events", "none");
                        $(this).find(".ghostCircle").css("fill", "red");
                    }
                });
            }

            var dynamicContextMenu = d3.select("#contextmenu");

            dynamicContextMenu.append("item")
                .attr("state", "grey")
                .attr("action", "EditChildValues")
                .text("Edit Child Values(%)");

            dynamicContextMenu.append("item")
                .attr("state", "grey")
                .attr("action", "Delete")
                .text("Delete");

            dynamicContextMenu.append("item")
                .attr("state", "grey")
                .attr("action", "copy")
                .text("Copy");


            if (selectedAction == "Delete") {
                var level = 0;
                var parentNode = $(datastructure.selectedDomNode).find("text").attr("data-parent");
                d3.selectAll('g.node').each(function () {
                    var textContent = $(this).find(".nodeText")[0].textContent;
                    if (textContent == selectedTreeNode || textContent == parentNode) {
                        d3.select(this).remove();
                    }
                });
                that.tree.deleteNode(selectedTreeNode, datastructure.root);
                that.defaultActionOnContextMenu(datastructure, that);
            }
            else if (selectedAction == "copy") {
                that.defaultActionOnContextMenu(datastructure, that);
            }
            else if (selectedAction == "EditChildValues") {
                that.defaultActionOnContextMenu(datastructure, that);
            }
        })
    }

    /* Method used to cancel the view when user cliks on edit/edit by substitution in context menu  */

    public CancelingTheEdit(root, that) {
        $("body").on("click", ".edit_btn", function () {
            d3.selectAll(".ghostCircle").style("display", "none");
            d3.selectAll("#contextmenu item").remove();
            var dynamicContextMenu = d3.select("#contextmenu");
            that.appendingDynamicContextMenu(dynamicContextMenu);
            that.tree.update(root);
        })
    }

    /* Method used to append the context menu dynamically based on the user selections  */

    public appendingDynamicContextMenu(contextMenu) {
        contextMenu.append("item")
            .attr("state", "grey")
            .attr("action", "EditModel")
            .text("Edit Model");

        contextMenu.append("item")
            .attr("state", "grey")
            .attr("action", "EditSubstitute")
            .text("Edit Model Substitute");
    }

    /* Method used to perform the default action when user clicked on context menu*/

    public defaultActionOnContextMenu(datastructure, that) {
        that.tree.update(datastructure.root);
        d3.selectAll("#contextmenu item").remove();
        d3.selectAll("g.node").style("pointer-events", "auto");
        d3.selectAll(".ghostCircle").style("fill", "green");
        d3.selectAll(".ghostCircle").style("display", "none");
        var dynamicContextMenu = d3.select("#contextmenu");
        that.appendingDynamicContextMenu(dynamicContextMenu);
    }


    /* Method used to fire when user clicked on save button in pop up and responsible
    for handling the validations that the dragged node should be added to the tree or not
    and assign the value to the node based on the target value given by the user in the pop up*/

    public updateNodes() {
        var that = this;
        var AttachNode = that.tree.CheckingNodeToBeAddesForValidation(that.data_structure.droppedElementType, that.data_structure.dragElement);
        if (AttachNode) {
            var elementFound = false, count = 0;
            if (that.data_structure.dropElement != "null") {
                that.data_structure.htmlNodeFlag[that.data_structure.dragElement] += 1;
                var childrenObject: any;
                var idElement = (that.data_structure.dragElement.indexOf(" ") == -1) ? that.data_structure.dragElement : that.data_structure.dragElement.replace(" ", "")

                if (that.data_structure.dragElement == "Multiple Category") {
                    childrenObject = that.tree.multipleCategoryData(that.data_structure.dragElement, that.data_structure.dropElement, that.data_structure);
                }
                else {
                    childrenObject = {
                        "name": that.data_structure.dragElement + that.data_structure.htmlNodeFlag[that.data_structure.dragElement],
                        "id": idElement + that.data_structure.htmlNodeFlag[that.data_structure.dragElement],
                        "parent": that.data_structure.dropElement,
                        "Type": that.data_structure.dragElement,
                        "values": [
                            {
                                "id": that.data_structure.dragElement + "1",
                                "value": 10
                            }
                        ],
                        "htmlDraggedNode": true
                    }
                }
                that.tree.checkingTheNodesAreCollapsedOrExpanded(that.data_structure.root);
                that.tree.AttachingNodesToTree(that.data_structure.dragElement, that.data_structure.dropElement, that.data_structure.root, childrenObject);
                d3.selectAll('g.node').each(function () {
                    var textContent = $(this).find(".nodeText")[0].textContent;
                    if (textContent == that.data_structure.dropElement) {
                        d3.select(this).remove();
                    }
                });
                that.tree.update(that.data_structure.root);
            }
        }
        else {
            alert(that.data_structure.dragElement + " should not be added to a " + that.data_structure.droppedElementType);
        }
        that.displayReassign = false;

    }

    /*Method used to close the pop up when user clicked on cancel button  */

    public closePopUp() {
        this.displayReassign = false;
    }
}
