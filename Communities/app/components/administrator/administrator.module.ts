import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule } from '@angular/forms';
import { administratorRouting } from './administrator.routes';
import { AdministratorService } from '../../services/administrator.service';
import { StrategistService } from '../../services/strategist.service';

@NgModule({
  imports: [FormsModule,CommonModule,administratorRouting],
  providers: [AdministratorService, StrategistService]
})
export class AdministratorModule {}

