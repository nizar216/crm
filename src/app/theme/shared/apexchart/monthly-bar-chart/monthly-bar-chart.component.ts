// angular import
import { Component, OnInit, ViewChild } from '@angular/core';

// project import
import { FactureService } from 'src/app/core/services/facture.service';

// third party
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-monthly-bar-chart',
  imports: [NgApexchartsModule],
  templateUrl: './monthly-bar-chart.component.html',
  styleUrl: './monthly-bar-chart.component.scss'
})
export class MonthlyBarChartComponent implements OnInit {
  // public props
  @ViewChild('chart') chart: ChartComponent;
  chartOptions!: Partial<ApexOptions>;

  constructor(private factureService: FactureService) {}

  // life cycle hook
  ngOnInit() {
    document.querySelector('.chart-income.week')?.classList.add('active');
    this.chartOptions = {
      chart: {
        height: 450,
        type: 'bar',
        toolbar: {
          show: false
        },
        background: 'transparent'
      },
      dataLabels: {
        enabled: false
      },
      colors: ['#1677ff'],
      series: [
        {
          name: 'Facture Total',
          data: []
        }
      ],
      stroke: {
        curve: 'smooth',
        width: 2
      },
      xaxis: {
        categories: [],
        labels: {
          style: {
            colors: ['#8c8c8c']
          }
        },
        axisBorder: {
          show: true,
          color: '#f0f0f0'
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: ['#8c8c8c']
          }
        }
      },
      grid: {
        strokeDashArray: 0,
        borderColor: '#f5f5f5'
      },
      theme: {
        mode: 'light'
      }
    };
    // Fetch facture totals per client
    this.factureService.getRentableClient().subscribe((data: any[]) => {
      const categories = data.map(item => item.nom);
      const totals = data.map(item => item.total);
      this.chartOptions = {
        ...this.chartOptions,
        xaxis: {
          ...this.chartOptions.xaxis,
          categories
        },
        series: [
          {
            name: 'Facture Total',
            data: totals
          }
        ]
      };
    });
  }

  // public method
  toggleActive(value: string) {
  // Always fetch and display client facture data, regardless of month/week toggle
  this.factureService.getRentableClient().subscribe((data: any[]) => {
    const categories = data.map(item => item.nom);
    const totals = data.map(item => item.total);
    const xaxis = { ...this.chartOptions.xaxis, categories };
    this.chartOptions = {
      ...this.chartOptions,
      xaxis,
      series: [
        {
          name: 'Facture Total',
          data: totals
        }
      ]
    };
    if (value === 'month') {
      document.querySelector('.chart-income.month')?.classList.add('active');
      document.querySelector('.chart-income.week')?.classList.remove('active');
    } else {
      document.querySelector('.chart-income.week')?.classList.add('active');
      document.querySelector('.chart-income.month')?.classList.remove('active');
    }
  });
}
}
