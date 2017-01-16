import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';


import {SavedViewComponent} from './savedviews/savedview.component';

import { ButtonModule } from 'primeng/components/button/button';
import {DialogModule} from 'primeng/components/dialog/dialog';

@NgModule({
    imports: [CommonModule, FormsModule,DialogModule,ButtonModule],
    declarations: [SavedViewComponent],
    exports: [ SavedViewComponent]
})
export class AppSharedModule { }