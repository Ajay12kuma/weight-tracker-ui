import { API_URL } from '../api.config';
import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-weight-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weight-tracker.component.html',
  styleUrl: './weight-tracker.component.css'
})
export class WeightTrackerComponent implements OnInit, AfterViewInit {
  date: string = new Date().toISOString().split('T')[0];
  weightValue: number | null = null;
  message = '';

  @ViewChild('weightChart') weightChartRef!: ElementRef;
  weightChart: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadWeight();
  }

  ngAfterViewInit() {
    this.fetchDataAndRenderChart();
  }

  loadWeight() {
    this.http.get<any>(`${API_URL}/weight/${this.date}`).subscribe({
      next: (res) => {
        if(res && res.weight) this.weightValue = res.weight;
        else this.weightValue = null;
      },
      error: (err) => {
        this.weightValue = null;
      }
    });
  }

  saveWeight() {
    const payload = {
      date: this.date,
      weight: this.weightValue
    };
    this.http.post<any>(API_URL + '/weight', payload).subscribe({
      next: (res) => {
        this.message = 'Weight saved successfully!';
        setTimeout(() => this.message = '', 3000);
        this.fetchDataAndRenderChart(); // Refresh chart immediately
      },
      error: (err) => {
        this.message = 'Error saving weight!';
        setTimeout(() => this.message = '', 3000);
      }
    });
  }

  fetchDataAndRenderChart() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 29);
    
    const startStr = thirtyDaysAgo.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];

    this.http.get<any[]>(`${API_URL}/weight/range?startDate=${startStr}&endDate=${endStr}`).subscribe({
      next: (logs) => {
        const dateMap = new Map<string, number>();
        logs.forEach(l => {
          if(l.weight) dateMap.set(l.date, l.weight);
        });

        const labels30: string[] = [];
        const data30: (number|null)[] = [];

        for(let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            const weight = dateMap.get(dStr) || null;
            
            labels30.push(dStr.substring(5)); // MM-DD
            data30.push(weight);
        }

        this.renderChart(labels30, data30);
      },
      error: (err) => console.error("Could not fetch weight range", err)
    });
  }

  renderChart(labels: string[], data: (number|null)[]) {
    if(this.weightChart) this.weightChart.destroy();
    
    // Fill null gaps by connecting lines via spanGaps
    this.weightChart = new Chart(this.weightChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Weight (kg/lbs)',
          data: data,
          fill: true,
          borderColor: '#d62828',
          backgroundColor: 'rgba(214, 40, 40, 0.2)',
          tension: 0.3,
          spanGaps: true
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}
