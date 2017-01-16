import { Component, Input } from '@angular/core';
import {DND_DIRECTIVES} from 'ng2-dnd/ng2-dnd';
import { SortPipe } from '../../pipes/FilterPipe';

@Component({
    selector: 'sortobjects-component',
    directives: [DND_DIRECTIVES],
    templateUrl: './app/shared/sortobjects/sortobjects.component.html',
    pipes: [SortPipe]
})

export class SortObjectsComponent {
    @Input() model: any;
    @Input() displaypermission: string;
}
