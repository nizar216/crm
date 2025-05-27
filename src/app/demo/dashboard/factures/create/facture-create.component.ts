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
import { DevisService, Devis } from 'src/app/core/services/devis.service';
import { ReclamationService } from 'src/app/core/services/reclamation.service';

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
  devisList: Devis[] = [];
  selectedDevis: Devis[] = [];
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
  clientMismatch = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    private factureService: FactureService,
    private devisService: DevisService,
    private reclamationService: ReclamationService
  ) {
    this.factureForm = this.fb.group({
      date: [null, Validators.required],
      devis: [[], Validators.required]
    });
  }

  ngOnInit() {
    this.devisService.getAllDevis().subscribe({
      next: devis => this.devisList = devis,
      error: () => this.message.error('Erreur lors du chargement des devis')
    });

    this.factureForm.get('devis')?.valueChanges.subscribe((ids: number[]) => {
      this.onDevisSelection(ids);
    });
  }

  async onDevisSelection(ids: number[]) {
    this.selectedDevis = this.devisList.filter(d => ids.includes(d.idDevis!));

    if (this.selectedDevis.length === 0) {
      this.client = null;
      this.articles = [];
      this.services = [];
      this.reclamations = [];
      this.clientMismatch = false;
      this.resetTotals();
      return;
    }

    const devisId = this.selectedDevis[0].idDevis;

    if (devisId) {
      try {
        const response = await this.reclamationService.getReclamationsByDevis(devisId).toPromise();
        if (response?.success) {
          this.reclamations = response.data || [];
        }
      } catch {
        this.message.error('Erreur lors de la récupération des réclamations');
      }
    }

    const clientId = this.selectedDevis[0].IdClient || this.selectedDevis[0].client?.idClient || this.selectedDevis[0].Client?.idClient;
    this.clientMismatch = !this.selectedDevis.every(d => (d.IdClient || d.client?.idClient || d.Client?.idClient) === clientId);
    this.client = this.selectedDevis[0].Client || this.selectedDevis[0].client;
    this.articles = this.selectedDevis.flatMap(d => d.DevisArticles || d.articles || []);
    this.services = this.selectedDevis.flatMap(d => d.DevisServices || d.services || []);

    this.calculateTotals();
  }

  calculateTotals() {
    this.totals.prixTotal = this.selectedDevis.reduce((sum, d) => sum + (d.prixTotal || 0), 0);
    this.totals.totalArticle = this.articles.reduce((sum, a) => sum + ((a.prixHT || 0) * (a.quantite || 1)), 0);
    this.totals.totalService = this.services.reduce((sum, s) => sum + ((s.prix || 0) * (s.quantite || 1)), 0);
    this.totals.prixHT = this.selectedDevis.reduce((sum, d) => sum + (d.prixTotal || 0) - (d.totalTva || 0), 0);
    this.totals.TVAglobal = this.selectedDevis.reduce((sum, d) => sum + (d.totalTva || 0), 0);
    this.totals.remiseGlobal = this.selectedDevis.reduce((sum, d) => sum + (d.remiseTotale || 0), 0);
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
      devisIds: this.selectedDevis.map(d => d.idDevis),
      client: this.client,
      articles: this.articles,
      services: this.services,
      ...this.totals
    };
    console.log(this.reclamations)
    if (this.reclamations && this.reclamations.length > 0) {
      facturePayload.reclamationIds = this.reclamations.map(r => r.idReclamation);
    }

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

  get devisOptions() {
    return this.devisList.map(d => ({
      label: 'Devis #' + d.idDevis + ' - ' + (d.Client?.nom || d.client?.nom || ''),
      value: d.idDevis
    }));
  }

  get tableScroll() {
    return { x: '800px' };
  }
}
