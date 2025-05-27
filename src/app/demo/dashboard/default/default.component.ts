// angular import
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// project import
import { MonthlyBarChartComponent } from 'src/app/theme/shared/apexchart/monthly-bar-chart/monthly-bar-chart.component';
import { IncomeOverviewChartComponent } from 'src/app/theme/shared/apexchart/income-overview-chart/income-overview-chart.component';
import { AnalyticsChartComponent } from 'src/app/theme/shared/apexchart/analytics-chart/analytics-chart.component';
import { SalesReportChartComponent } from 'src/app/theme/shared/apexchart/sales-report-chart/sales-report-chart.component';

// icons
import { IconService, IconDirective } from '@ant-design/icons-angular';
import { FallOutline, GiftOutline, MessageOutline, RiseOutline, SettingOutline } from '@ant-design/icons-angular/icons';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

// services
import { FactureService } from 'src/app/core/services/facture.service';
import { ArticleService } from 'src/app/core/services/article.service';
import { ClientService } from 'src/app/core/services/client.service';
import { TechnicienService } from 'src/app/core/services/technicien.service';
import { ServiceService } from 'src/app/core/services/service.service';
import { RevendeurService } from 'src/app/core/services/revendeur.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-default',
  imports: [
    CommonModule,
    CardComponent,
    IconDirective,
    MonthlyBarChartComponent,
  ],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  private iconService = inject(IconService);

  recentOrder: any[] = [];
  clientStats: any;
  factureStats: any;
  articlesCount: number = 0;
  rentableClients: any[] = [];
  isLoading: boolean = true;

  articles: any[] = [];
  clients: any[] = [];
  techniciens: any[] = [];
  services: any[] = [];
  revendeurs: any[] = [];

  AnalyticEcommerce = [
    {
      title: 'Total Invoices',
      amount: '0',
      background: 'bg-light-primary ',
      border: 'border-primary',
      icon: 'rise',
      percentage: '0%',
      color: 'text-primary',
      number: '0'
    },
    {
      title: 'Total Clients',
      amount: '0',
      background: 'bg-light-primary ',
      border: 'border-primary',
      icon: 'rise',
      percentage: '0%',
      color: 'text-primary',
      number: '0'
    },
    {
      title: 'Total Articles',
      amount: '0',
      background: 'bg-light-warning ',
      border: 'border-warning',
      icon: 'rise',
      percentage: '0%',
      color: 'text-primary',
      number: '0'
    },
    {
      title: 'Total Sales',
      amount: '$0',
      background: 'bg-light-warning ',
      border: 'border-warning',
      icon: 'rise',
      percentage: '0%',
      color: 'text-primary',
      number: '$0'
    }
  ];

  transaction = [
    {
      background: 'text-success bg-light-success',
      icon: 'gift',
      title: 'Invoice Pending',
      time: 'Today',
      amount: '+ $0',
      percentage: '0%'
    },
    {
      background: 'text-primary bg-light-primary',
      icon: 'message',
      title: 'Invoice Paid',
      time: 'Today',
      amount: '+ $0',
      percentage: '0%'
    },
    {
      background: 'text-danger bg-light-danger',
      icon: 'setting',
      title: 'Invoice Overdue',
      time: 'Today',
      amount: '- $0',
      percentage: '0%'
    }
  ];

  // constructor
  constructor(
    private factureService: FactureService,
    private articleService: ArticleService,
    private clientService: ClientService,
    private technicienService: TechnicienService,
    private serviceService: ServiceService,
    private revendeurService: RevendeurService
  ) {
    this.iconService.addIcon(...[RiseOutline, FallOutline, SettingOutline, GiftOutline, MessageOutline]);
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    forkJoin({
      factures: this.factureService.getAllFactures(),
      articlesCount: this.factureService.getArticlesCount(),
      clientStats: this.factureService.getClientStats(),
      factureStats: this.factureService.getFactureStats(),
      rentableClients: this.factureService.getRentableClient(),
      articles: this.articleService.getAllArticles(),
      clients: this.clientService.getAllClients(),
      techniciens: this.technicienService.getAllTechniciens(),
      services: this.serviceService.getAllServices(),
      revendeurs: this.revendeurService.getAllRevendeurs()
    }).subscribe({
      next: (results) => {
        // Process factures for recent orders
        this.recentOrder = results.factures.slice(0, 10).map((facture: any) => ({
          id: facture._id || facture.id,
          name: facture.name || `Facture #${facture.factureNumber || ''}`,
          status: facture.paymentStatus || 'Pending',
          status_type: this.getStatusClass(facture.paymentStatus || 'Pending'),
          quantity: facture.totalQuantity || facture.items?.length || 0,
          amount: `$${facture.total || 0}`
        }));

        // Set article count and articles
        this.articlesCount = results.articlesCount?.count || results.articles?.length || 0;
        this.articles = results.articles || [];

        // Set client stats and clients
        this.clientStats = results.clientStats;
        this.clients = results.clients || [];

        // Set facture stats
        this.factureStats = results.factureStats;

        // Set rentable clients
        this.rentableClients = results.rentableClients;

        // Set techniciens, services, revendeurs
        this.techniciens = results.techniciens || [];
        this.services = results.services || [];
        this.revendeurs = results.revendeurs || [];

        // Update analytics data
        this.updateAnalyticsData();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }
  
  getStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'paid':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'overdue':
        return 'badge-danger';
      default:
        return 'badge-light';
    }
  }
  
  updateAnalyticsData(): void {
    // Update total invoices
    if (this.factureStats?.totalFactures !== undefined) {
      this.AnalyticEcommerce[0].amount = this.factureStats.totalFactures.toString();
      this.AnalyticEcommerce[0].percentage = `${this.factureStats.growthRate || 0}%`;
      this.AnalyticEcommerce[0].number = this.factureStats.newFactures || '0';
      this.AnalyticEcommerce[0].icon = this.factureStats.growthRate > 0 ? 'rise' : 'fall';
    }

    // Update total clients
    if (this.clientStats?.totalClients !== undefined) {
      this.AnalyticEcommerce[1].amount = this.clientStats.totalClients.toString();
      this.AnalyticEcommerce[1].percentage = `${this.clientStats.growthRate || 0}%`;
      this.AnalyticEcommerce[1].number = this.clientStats.newClients || '0';
      this.AnalyticEcommerce[1].icon = this.clientStats.growthRate > 0 ? 'rise' : 'fall';
    }

    // Update total articles
    this.AnalyticEcommerce[2].amount = this.articlesCount.toString();
    this.AnalyticEcommerce[2].number = this.articles.length.toString();

    // Update total sales
    if (this.factureStats?.totalRevenue !== undefined) {
      this.AnalyticEcommerce[3].amount = `$${this.factureStats.totalRevenue.toLocaleString()}`;
      this.AnalyticEcommerce[3].percentage = `${this.factureStats.revenueGrowth || 0}%`;
      this.AnalyticEcommerce[3].number = `$${this.factureStats.newRevenue || 0}`;
      this.AnalyticEcommerce[3].icon = this.factureStats.revenueGrowth > 0 ? 'rise' : 'fall';
    }

    // Optionally, you can display other data in the dashboard using new cards or sections.
    // For example, you could add cards for total techniciens, services, or revendeurs if desired.
  }
}
