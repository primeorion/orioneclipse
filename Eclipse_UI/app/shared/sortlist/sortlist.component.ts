import { Component, Input } from '@angular/core';
import {DND_DIRECTIVES} from 'ng2-dnd/ng2-dnd';

@Component({
    selector: 'sortlist-component',
    directives: [DND_DIRECTIVES],
    templateUrl: './app/shared/sortlist/sortlist.component.html',
})

export class SortListComponent {
    @Input() model: Array<string>;
}
