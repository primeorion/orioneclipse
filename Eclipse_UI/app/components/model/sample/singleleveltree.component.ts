import { Component, EventEmitter, Renderer, ElementRef, Output} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { Http, Response, Headers } from '@angular/http';
import {SingleLevelTreeChart} from '../../../services/singleleveltreechart.service';
import * as d3  from 'd3';

@Component({
    selector: 'singleLevel-tree',
    templateUrl: './app/components/model/sample/singleleveltree.component.html',
    providers: [SingleLevelTreeChart]
})
export class SingleLevelTreeComponent extends BaseComponent {

    @Output() viewModelDetail = new EventEmitter();

    constructor(el: ElementRef, renderer: Renderer, private _treeChart: SingleLevelTreeChart) {
        super();
    }
    ngOnInit() {
        var treeDataForHTML =
            {
                "name": "Top Level",
                "parent": "null",
                "values": [
                    {
                        "value": 50
                    },
                    {
                        "value": 50
                    },
                    {
                        "value": 50
                    }
                ],
                "children": [
                    {
                        "name": "Level 2: A",
                        "parent": "Top Level",
                        "values": [
                            {
                                "value": 20
                            }
                        ]
                    },
                    {
                        "name": "Level 2: B",
                        "parent": "Top Level",
                        "values": [
                            {
                                "value": 40
                            }
                        ],

                    },
                    {
                        "name": "Level 2: C",
                        "parent": "Top Level",
                        "values": [
                            {
                                "value": 40
                            }
                        ],

                    }
                ]
            }
            this._treeChart.CreateSingleLevelTreeChart(".singleLevel_tree", treeDataForHTML);
    }
}