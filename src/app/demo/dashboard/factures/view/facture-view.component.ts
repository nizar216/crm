import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { FactureService } from 'src/app/core/services/facture.service';

@Component({
  selector: 'app-facture-view',
  templateUrl: './facture-view.component.html',
  styleUrls: ['./facture-view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzMessageModule,
    NzDatePickerModule,
    NzTableModule
  ]
})
export class FactureViewComponent implements OnInit {
  client: any = null;
  articles: any[] = [];
  services: any[] = [];
  reclamations: any[] = [];
  totals = {
    prixTotal: 0,
    totalArticle: 0,
    totalService: 0,
    prixHT: 0,
    TVAglobal: 0,
    remiseGlobal: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private factureService: FactureService
  ) { }

  ngOnInit(): void {
    const factureId = this.route.snapshot.paramMap.get('id');
    this.loadFacture(factureId);
  }

  loadFacture(id: any) {
    this.factureService.getAllFactures().subscribe({
      next: (factures) => {
        const facture = factures.find((f: any) => f.idFacture == id);
        if (facture) {
          this.client = facture.Client || facture.client;
          this.articles = facture.articles || [];
          this.services = facture.services || [];
          this.reclamations = facture.reclamations || [];
          this.totals = {
            prixTotal: facture.prixTotal || 0,
            totalArticle: facture.totalArticle || 0,
            totalService: facture.totalService || 0,
            prixHT: facture.prixHT || 0,
            TVAglobal: facture.TVAglobal || 0,
            remiseGlobal: facture.remiseGlobal || 0
          };
        }
      },
      error: () => {
        this.message.error('Erreur lors du chargement de la facture');
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/factures']);
  }
}
