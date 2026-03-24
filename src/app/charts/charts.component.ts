import { API_URL } from '../api.config';
import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.css'
})
export class ChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('weeklyChart') weeklyChartRef!: ElementRef;
  @ViewChild('monthlyChart') monthlyChartRef!: ElementRef;
  @ViewChild('ratioChart') ratioChartRef!: ElementRef;

  weeklyChart: any;
  monthlyChart: any;
  ratioChart: any;

  aiInsightText: string = '';
  isAnalyzing: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
  }

  analyzeProgress() {
    this.isAnalyzing = true;
    this.http.get<any>(API_URL + '/analytics/ai-insights').subscribe({
      next: (res) => {
        this.aiInsightText = res.insights;
        this.isAnalyzing = false;
      },
      error: () => {
        this.aiInsightText = "Error communicating with AI Analytics server.";
        this.isAnalyzing = false;
      }
    });
  }

  ngAfterViewInit() {
    this.fetchDataAndRenderCharts();
  }

  fetchDataAndRenderCharts() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 29);
    
    // YYYY-MM-DD
    const startStr = thirtyDaysAgo.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];

    // Fetch Analytics Array
    this.http.get<any[]>(`${API_URL}/activity/range?startDate=${startStr}&endDate=${endStr}`).subscribe({
      next: (activities) => {
        const dateMap = new Map<string, number>();
        activities.forEach(a => dateMap.set(a.date, a.score));

        const labels7: string[] = [];
        const data7: number[] = [];
        const labels30: string[] = [];
        const data30: number[] = [];

        for(let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            const score = dateMap.get(dStr) || 0;
            
            labels30.push(dStr.substring(5)); // MM-DD
            data30.push(score);

            if(i < 7) {
                labels7.push(dStr.substring(5));
                data7.push(score);
            }
        }

        this.renderWeeklyChart(labels7, data7);
        this.renderMonthlyChart(labels30, data30);
      },
      error: (err) => console.error("Could not fetch chart range", err)
    });

    // Fetch Ratio for Pie Chart
    this.http.get<any>(API_URL + '/activity/ratio').subscribe({
        next: (res) => {
            if(res) this.renderRatioChart(res.good, res.bad);
        }
    });
  }

  renderWeeklyChart(labels: string[], data: number[]) {
    if(this.weeklyChart) this.weeklyChart.destroy();
    this.weeklyChart = new Chart(this.weeklyChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Daily Score',
          data: data,
          backgroundColor: data.map(val => val >= 0 ? 'rgba(42, 157, 143, 0.6)' : 'rgba(214, 40, 40, 0.6)'),
          borderColor: data.map(val => val >= 0 ? '#2a9d8f' : '#d62828'),
          borderWidth: 1
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  renderMonthlyChart(labels: string[], data: number[]) {
    if(this.monthlyChart) this.monthlyChart.destroy();
    this.monthlyChart = new Chart(this.monthlyChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Score Trend',
          data: data,
          fill: true,
          borderColor: '#023047',
          backgroundColor: 'rgba(33, 158, 188, 0.2)',
          tension: 0.3
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  renderRatioChart(goodCount: number, badCount: number) {
    if(this.ratioChart) this.ratioChart.destroy();
    
    this.ratioChart = new Chart(this.ratioChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Good Habits Executed', 'Bad Habits Triggered'],
        datasets: [{
          data: [goodCount, badCount],
          backgroundColor: ['#2a9d8f', '#d62828'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}
