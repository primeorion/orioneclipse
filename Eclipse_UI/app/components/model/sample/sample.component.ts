import { Component, EventEmitter, Renderer, ElementRef, Output} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { Http, Response, Headers } from '@angular/http';
import {TreeCharts} from '../../../services/treechart.service';
import * as d3  from 'd3';

@Component({
    selector: 'eclipse-tree',
    templateUrl: './app/components/model/sample/sample.component.html',
    providers: [TreeCharts]
})

export class TreeComponent extends BaseComponent { 

     @Output() viewModelDetail = new EventEmitter();

    constructor(el: ElementRef, renderer: Renderer, private _treeChart: TreeCharts) { 
         super();
    }

    ngOnInit() {
        var treeData =
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
                            },
                            {
                                "value": 30
                            }
                        ],
                        "children": [
                            {
                                "name": "Son of A",
                                "parent": "Level 2: A",
                                "values": [
                                    {
                                        "value": 20
                                    }
                                ],
                                "children": [
                                    {
                                        "name": "G S 1",
                                        "parent": "Son of A",
                                        "values": [
                                            {
                                                "value": 20
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "D of A",
                                "parent": "Level 2: A",
                                "values": [
                                    {
                                        "value": 10
                                    }
                                ],
                                "children": [
                                    {
                                        "name": "G D 1",
                                        "parent": "D of A",
                                        "values": [
                                            {
                                                "value": 10
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "name": "Level 2: B",
                        "parent": "Top Level",
                        "values": [
                            {
                                "value": 40
                            },
                            {
                                "value": 10
                            },
                            {
                                "value": 50
                            }
                        ],
                        "children": [
                            {
                                "name": "Son of B",
                                "parent": "Level 2: B",
                                "values": [
                                    {
                                        "value": 20
                                    },
                                    {
                                        "value": 20
                                    }
                                ],
                                "children": [
                                    {
                                        "name": "G Son 1",
                                        "parent": "Son of B",
                                        "values": [
                                            {
                                                "value": 20
                                            }
                                        ]
                                    },
                                    {
                                        "name": "G Son 2",
                                        "parent": "Son of B",
                                        "values": [
                                            {
                                                "value": 20
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "D of B",
                                "parent": "Level 2: B",
                                "values": [
                                    {
                                        "value": 5
                                    },
                                    {
                                        "value": 5
                                    }
                                ],
                                "children": [
                                    {
                                        "name": "G Dar 1",
                                        "parent": "D of B",
                                        "values": [
                                            {
                                                "value": 5
                                            },

                                        ]
                                    },
                                    {
                                        "name": "G Dar 2",
                                        "parent": "D of B",
                                        "values": [
                                            {
                                                "value": 5
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "D2 of B",
                                "parent": "Level 2: B",
                                "values": [
                                    {
                                        "value": 10
                                    }
                                ],
                                "children": [
                                    {
                                        "name": "G D2 1",
                                        "parent": "D2 of B",
                                        "values": [
                                            {
                                                "value": 10
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "name": "Level 2: C",
                        "parent": "Top Level",
                        "values": [
                            {
                                "value": 40
                            },
                            {
                                "value": 10
                            }
                        ],
                        "children": [
                            {
                                "name": "Ss of B",
                                "parent": "Level 2: C",
                                "values": [
                                    {
                                        "value": 20
                                    },
                                     {
                                        "value": 20
                                    }
                                ],
                                "children": [
                                    {
                                        "name": "G ss 1",
                                        "parent": "Ss of B",
                                        "values": [
                                            {
                                                "value": 20
                                            }
                                        ]
                                    },
                                    {
                                        "name": "G ss 2",
                                        "parent": "Ss of B",
                                        "values": [
                                            {
                                                "value": 20
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "D3 of B",
                                "parent": "Level 2: C",
                                "values": [
                                    {
                                        "value": 10
                                    }
                                ],
                                "children": [
                                    {
                                        "name": "G Dar 1",
                                        "parent": "D3 of B",
                                        "values": [
                                            {
                                                "value": 10
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        this._treeChart.CreateTreeChart(".node_tree", treeData);
    }
}
