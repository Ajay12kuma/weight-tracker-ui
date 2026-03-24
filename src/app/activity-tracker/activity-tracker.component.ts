import { API_URL } from '../api.config';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-activity-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-tracker.component.html',
  styleUrl: './activity-tracker.component.css'
})
export class ActivityTrackerComponent implements OnInit {
  date: string = new Date().toISOString().split('T')[0];
  todayStr: string = new Date().toISOString().split('T')[0];
  
  minDate: string = '';
  maxDate: string = ''; 
  isModifyMode = false;
  isOutOfRange = false;
  
  activity = {
    date: this.date,
    wakeup: false, running: false, pushups: false, protein: false,
    water: false, steps: false, sleep: false,
    sugar: false, tea: false, masturbation: false,
    score: 0
  };

  message = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchSettingsAndInitialize();
  }

  fetchSettingsAndInitialize() {
    this.http.get<any>(API_URL + '/settings').subscribe({
      next: (res) => {
        if(res && res.startDate) {
          this.minDate = res.startDate;
          this.maxDate = res.endDate;
          this.loadActivity();
        }
      },
      error: () => this.loadActivity()
    });
  }

  enableModifyMode() {
    this.isModifyMode = !this.isModifyMode;
    if (!this.isModifyMode) {
        this.date = this.todayStr;
        this.loadActivity();
    }
  }

  loadActivity() {
    // Check if the current date parser pushes it out of the legally defined boundaries or is simply in the future
    if (this.minDate && this.maxDate) {
        this.isOutOfRange = (this.date < this.minDate || this.date > this.maxDate || this.date > this.todayStr);
    } else {
        this.isOutOfRange = (this.date > this.todayStr);
    }

    this.http.get<any>(`${API_URL}/activity/${this.date}`).subscribe({
      next: (res) => {
        if(res) {
          this.activity = res;
        } else {
          this.resetForm();
        }
      },
      error: (err) => {
        this.resetForm();
      }
    });
  }

  resetForm() {
    this.activity = {
      date: this.date,
      wakeup: false, running: false, pushups: false, protein: false,
      water: false, steps: false, sleep: false,
      sugar: false, tea: false, masturbation: false,
      score: 0
    };
  }

  saveActivity() {
    if (this.isOutOfRange) return;
    this.activity.date = this.date;
    this.http.post<any>(API_URL + '/activity', this.activity).subscribe({
      next: (res) => {
        this.activity = res;
        this.message = 'Saved successfully! Current Score: ' + res.score;
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        this.message = 'Error saving activity!';
        setTimeout(() => this.message = '', 3000);
      }
    });
  }
}
