import { API_URL } from '../api.config';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivityTrackerComponent } from '../activity-tracker/activity-tracker.component';
import { ChartsComponent } from '../charts/charts.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ActivityTrackerComponent, ChartsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  hasSettings = false;
  settings: any = null;
  strategyMetrics: any = null;

  startDate: string = '';
  endDate: string = '';
  currentWeight: number | null = null;
  targetWeight: number | null = null;
  height: number | null = 170.0;
  gender: string = 'FEMALE';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.checkSettings();
  }

  checkSettings() {
    this.http.get<any>(API_URL + '/settings').subscribe({
      next: (res) => {
        if(res && res.startDate) {
          this.settings = res;
          this.hasSettings = true;
          this.loadDailyStrategy();
        } else {
          this.hasSettings = false;
        }
      },
      error: () => this.hasSettings = false
    });
  }

  loadDailyStrategy() {
     const today = new Date().toISOString().split('T')[0];
     this.http.get<any>(`${API_URL}/analytics/strategy/${today}`).subscribe({
        next: (res) => this.strategyMetrics = res
     });
  }

  saveSettings() {
    if(!this.startDate || !this.endDate || !this.currentWeight || !this.targetWeight) return;
    
    const payload = {
        startDate: this.startDate, 
        endDate: this.endDate,
        currentWeight: this.currentWeight,
        targetWeight: this.targetWeight,
        height: this.height,
        gender: this.gender
    };

    this.http.post(API_URL + '/settings', payload).subscribe({
      next: (res) => {
        this.checkSettings();
      }
    });
  }

  resetApp() {
    if(confirm('Are you absolutely sure you want to delete ALL tracking data and reset the app?')) {
      this.http.delete(API_URL + '/settings', {responseType: 'text'}).subscribe({
        next: () => {
          this.hasSettings = false;
          this.settings = null;
          this.strategyMetrics = null;
          this.startDate = '';
          this.endDate = '';
          this.currentWeight = null;
          this.targetWeight = null;
        }
      });
    }
  }
}
