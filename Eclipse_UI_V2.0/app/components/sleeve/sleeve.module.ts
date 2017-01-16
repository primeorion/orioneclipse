import { NgModule }      from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { SLEEVE_ROUTER_PROVIDERS } from './sleeve.routes'
import { PortfolioService } from '../../services/portfolio.service';
import { SleeveComponent } from './sleeve.component';
import { SleeveDetailComponent } from './detail/sleevedetail.component';
import { SleeveTransferComponent } from './transfer/sleeve.transfer.component';
import { SleeveStrategyComponent } from './strategy/sleeve.strategy.component';

@NgModule({
    imports: [SharedModule, FormsModule, CommonModule, SLEEVE_ROUTER_PROVIDERS],
    declarations: [SleeveComponent, SleeveDetailComponent, SleeveTransferComponent, SleeveStrategyComponent],
    providers: [PortfolioService]
})

export class SleeveModule { }