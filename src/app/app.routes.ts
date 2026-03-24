import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChartsComponent } from './charts/charts.component';
import { ActivityTrackerComponent } from './activity-tracker/activity-tracker.component';
import { WeightTrackerComponent } from './weight-tracker/weight-tracker.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'daily', component: ActivityTrackerComponent },
  { path: 'weight', component: WeightTrackerComponent },
  { path: 'charts', component: ChartsComponent },
  { path: '**', redirectTo: 'dashboard' }
];
