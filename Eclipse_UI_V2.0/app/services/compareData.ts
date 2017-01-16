import * as d3  from 'd3';
export class compareStructure {
    width: number = 750;
    height: number = 400;
    margin: any = { left: 200, right: 50, top: 50, bottom: 0 };
    padding: number = 50;
    xScale: any = d3.scale.linear();
    yScale: any = d3.scale.ordinal();
    y1Scale: any = d3.scale.ordinal();
    svg: any;
    data: any;

}