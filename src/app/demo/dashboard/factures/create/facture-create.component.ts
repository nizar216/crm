import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { FactureService } from 'src/app/core/services/facture.service';
import { ClientService, Client } from 'src/app/core/services/client.service';
import { ReclamationService, Reclamation } from 'src/app/core/services/reclamation.service';


@Component({
  selector: 'app-facture-create',
  templateUrl: './facture-create.component.html',
  styleUrls: ['./facture-create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzMessageModule,
    NzDatePickerModule,
    NzSelectModule,
    NzTableModule
  ]
})
export class FactureCreateComponent implements OnInit {
  factureForm: FormGroup;
  isSubmitting = false;
  allReclamations: Reclamation[] = [];
  selectedReclamations: Reclamation[] = [];
  client: Client | null = null;
  articles: any[] = [];
  services: any[] = [];
  totals = {
    prixTotal: 0,
    totalArticle: 0,
    totalService: 0,
    prixHT: 0,
    TVAglobal: 0,
    remiseGlobal: 0
  };
  clientMismatch = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    private factureService: FactureService,
    private reclamationService: ReclamationService
  ) {
    this.factureForm = this.fb.group({
      date: [null, Validators.required],
      reclamations: [[], Validators.required]
    });
  }

  ngOnInit() {
    this.reclamationService.getReclamationsWhereStatus().subscribe({
      next: (data) => {
        // Map backend 'Articles' and 'Services' to lowercase keys for frontend compatibility
        this.allReclamations = data.map((rec: any) => ({
          ...rec,
          articles: rec.Articles || [],
          services: rec.Services || []
        }));
      },
      error: () => {
        this.message.error('Erreur lors du chargement des réclamations fermées');
      }
    });

    this.factureForm.get('reclamations')?.valueChanges.subscribe((selectedIds: number[]) => {
      this.onReclamationsSelection(selectedIds);
    });
  }

  onReclamationsSelection(selectedIds: number[]) {
    this.selectedReclamations = this.allReclamations.filter(r => selectedIds.includes(r.idReclamation));
    if (this.selectedReclamations.length === 0) {
      this.client = null;
      this.articles = [];
      this.services = [];
      this.resetTotals();
      this.clientMismatch = false;
      return;
    }
    // Check all selected reclamations are for the same client
    const clientId = this.selectedReclamations[0].IdClient;
    this.clientMismatch = !this.selectedReclamations.every(r => r.IdClient === clientId);
    if (this.clientMismatch) {
      this.client = null;
      this.articles = [];
      this.services = [];
      this.resetTotals();
      return;
    }
    this.client = this.selectedReclamations[0].Client || null;
    // Aggregate articles and services
    this.articles = this.selectedReclamations.flatMap(r => r.articles || []);
    this.services = this.selectedReclamations.flatMap(r => r.services || []);
    this.calculateTotals();
  }

  calculateTotals() {
    this.totals.totalArticle = this.articles.reduce((sum, a) => sum + ((a.prixHT || 0) * (a.quantite || 1)), 0);
    this.totals.totalService = this.services.reduce((sum, s) => sum + ((s.prix || 0) * (s.quantite || 1)), 0);
    this.totals.prixTotal = this.totals.totalArticle + this.totals.totalService;
    this.totals.prixHT = this.totals.totalArticle;
    this.totals.TVAglobal = this.articles.reduce((sum, a) => sum + ((a.tva || 0) * (a.prixHT || 0) * (a.quantite || 1) / 100), 0);
    this.totals.remiseGlobal = this.articles.reduce((sum, a) => sum + (a.remise || 0), 0) + this.services.reduce((sum, s) => sum + (s.remise || 0), 0);
  }

  resetTotals() {
    this.totals = {
      prixTotal: 0,
      totalArticle: 0,
      totalService: 0,
      prixHT: 0,
      TVAglobal: 0,
      remiseGlobal: 0
    };
  }

  onSubmit() {
    if (this.factureForm.invalid || this.clientMismatch) {
      this.factureForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const facturePayload: any = {
      date: this.factureForm.value.date,
      client: this.client,
      articles: this.articles,
      services: this.services,
      ...this.totals,
      reclamationIds: this.selectedReclamations.map(r => r.idReclamation)
    };

    this.factureService.AddFacture(facturePayload).subscribe({
      next: () => {
        this.message.success('Facture créée avec succès');
        this.router.navigate(['/dashboard/factures/list']);
      },
      error: () => {
        this.message.error('Erreur lors de la création de la facture');
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/factures/list']);
  }

  get tableScroll() {
    return { x: '800px' };
  }
}
