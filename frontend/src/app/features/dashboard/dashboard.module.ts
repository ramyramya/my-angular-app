import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './components/dashboard.component';
import { NavbarComponent } from './components/navbar/navbar.component';


@NgModule({
  declarations: [
    DashboardComponent,
    NavbarComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    
  ]
})
export class DashboardModule { }
