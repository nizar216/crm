import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { DevisService } from 'src/app/core/services/devis.service';
import { ClientService, Client } from 'src/app/core/services/client.service';
import { ArticleService, Article } from 'src/app/core/services/article.service';
import { ServiceService, Service } from 'src/app/core/services/service.service';

@Component({
  selector: 'app-devis-create',
  templateUrl: './devis-create.component.html',
  styleUrls: ['./devis-create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzIconModule,
    NzMessageModule,
    NzSelectModule,
    NzTableModule,
    NzDividerModule,
    NzSpinModule,
  ]
})
export class DevisCreateComponent implements OnInit {
  devisForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  clients: Client[] = [];
  articles: Article[] = [];
  services: Service[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    private devisService: DevisService,
    private clientService: ClientService,
    private articleService: ArticleService,
    private serviceService: ServiceService
  ) {
    this.devisForm = this.fb.group({
      client: [null, Validators.required],
      articles: this.fb.array([]),
      services: this.fb.array([]),
      prixTotal: [{ value: 0, disabled: true }],
      remiseTotale: [{ value: 0, disabled: true }],
      prixFinalTTC: [{ value: 0, disabled: true }],
      totalTva: [{ value: 0, disabled: true }]
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadArticles();
    this.loadServices();
    this.addArticle();
    this.addService();
    this.articlesArray.valueChanges.subscribe((articles) => {
      articles.forEach((art: any, i: number) => {
        const selected = this.articles.find(a => a.idArticle === art.idArticle);
        if (selected && (art.prixHT !== selected.prixHT || art.tva !== selected.tva)) {
          this.articlesArray.at(i).patchValue({
            prixHT: selected.prixHT,
            tva: selected.tva,
            prixTTC: selected.prixTTC || (selected.prixHT + (selected.prixHT * selected.tva / 100)),
          }, { emitEvent: false });
        }
      });
    });
    this.servicesArray.valueChanges.subscribe((services) => {
      services.forEach((srv: any, i: number) => {
        const selected = this.services.find(s => s.idService === srv.idService);
        if (selected && (srv.prix !== selected.prix || srv.tva !== selected.tva || srv.partTech !== selected.partTech || srv.partEnts !== selected.partEnts)) {
          this.servicesArray.at(i).patchValue({
            prix: selected.prix,
            tva: selected.tva,
            prixTTC: selected.prixTot,
            partTech: selected.partTech,
            partEnts: selected.partEnts,
          }, { emitEvent: false });
        }
      });
    });
  }

  loadClients() {
    this.clientService.getAllClients().subscribe({
      next: (data) => { this.clients = data; },
      error: () => { this.clients = []; }
    });
  }

  loadArticles() {
    this.articleService.getAllArticles().subscribe({
      next: (data) => { this.articles = data; },
      error: () => { this.articles = []; }
    });
  }

  loadServices() {
    this.serviceService.getAllServices().subscribe({
      next: (data) => { this.services = data; },
      error: () => { this.services = []; }
    });
  }

  get articlesArray(): FormArray {
    return this.devisForm.get('articles') as FormArray;
  }

  get servicesArray(): FormArray {
    return this.devisForm.get('services') as FormArray;
  }

  addArticle() {
    const group = this.fb.group({
      idArticle: [null, Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixHT: [0, Validators.required],
      tva: [0, Validators.required],
      prixTTC: [{ value: 0, disabled: true }],
      remise: [0]
    });
    this.articlesArray.push(group);
    const idx = this.articlesArray.length - 1;
    group.get('idArticle')?.valueChanges.subscribe(() => {
      this.onArticleChange(idx);
    });
    ['remise', 'quantite', 'prixHT', 'tva'].forEach(field => {
      group.get(field)?.valueChanges.subscribe(() => {
        this.updateSummary();
      });
    });
    this.updateSummary();
  }

  addService() {
    const group = this.fb.group({
      idService: [null, Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prix: [0, Validators.required],
      tva: [0, Validators.required],
      prixTTC: [{ value: 0, disabled: true }],
      partTech: [0],
      partEnts: [0],
      remise: [0]
    });
    this.servicesArray.push(group);
    const idx = this.servicesArray.length - 1;
    group.get('idService')?.valueChanges.subscribe(() => {
      this.onServiceChange(idx);
    });
    ['remise', 'quantite', 'prix', 'tva', 'partTech', 'partEnts'].forEach(field => {
      group.get(field)?.valueChanges.subscribe(() => {
        this.updateSummary();
      });
    });
    this.updateSummary();
  }

  removeArticle(index: number) {
    this.articlesArray.removeAt(index);
    this.updateSummary();
  }

  removeService(index: number) {
    this.servicesArray.removeAt(index);
    this.updateSummary();
  }

  onArticleChange(index: number) {
    const articleFormGroup = this.articlesArray.at(index);
    const articleId = articleFormGroup.get('idArticle')?.value;
    const selected = this.articles.find(a => a.idArticle === articleId);
    if (selected) {
      const prixHT = selected.prixHT ?? 0;
      const tva = Number(selected.tva);
      const prixTTC = selected.prixTTC ?? (prixHT + (prixHT * tva / 100));
      articleFormGroup.patchValue({
        prixHT,
        tva,
        prixTTC,
        quantite: 1,
        remise: 0
      });
    }
    this.updateSummary();
  }

  onServiceChange(index: number) {
    const serviceId = this.servicesArray.at(index).get('idService')?.value;
    const selected = this.services.find(s => s.idService === serviceId);
    if (selected) {
      this.servicesArray.at(index).patchValue({
        prix: selected.prix,
        tva: selected.tva,
        prixTTC: selected.prixTot,
        partTech: selected.partTech,
        partEnts: selected.partEnts,
        quantite: 1,
        remise: 0
      });
    }
    this.updateSummary();
  }

  updateSummary() {
    let prixTotal = 0;
    let remiseTotale = 0;
    let totalTva = 0;
    let prixFinalTTC = 0;

    this.articlesArray.controls.forEach(ctrl => {
      const quantite = +ctrl.get('quantite')?.value || 0;
      const prixHT = +ctrl.get('prixHT')?.value || 0;
      const tva = +ctrl.get('tva')?.value || 0;
      const remise = +ctrl.get('remise')?.value || 0;
      const prixHTTotal = prixHT * quantite;
      const remiseVal = prixHTTotal * (remise / 100);
      const prixHTRemise = prixHTTotal - remiseVal;
      const tvaVal = prixHTRemise * (tva / 100);
      prixTotal += prixHTTotal;
      remiseTotale += remiseVal;
      totalTva += tvaVal;
      prixFinalTTC += prixHTRemise + tvaVal;
    });

    this.servicesArray.controls.forEach(ctrl => {
      const quantite = +ctrl.get('quantite')?.value || 0;
      const prix = +ctrl.get('prix')?.value || 0;
      const tva = +ctrl.get('tva')?.value || 0;
      const remise = +ctrl.get('remise')?.value || 0;
      const prixTotalService = prix * quantite;
      const remiseVal = prixTotalService * (remise / 100);
      const prixServiceRemise = prixTotalService - remiseVal;
      const tvaVal = prixServiceRemise * (tva / 100);
      prixTotal += prixTotalService;
      remiseTotale += remiseVal;
      totalTva += tvaVal;
      prixFinalTTC += prixServiceRemise + tvaVal;
    });

    this.devisForm.patchValue({
      prixTotal: +prixTotal.toFixed(2),
      remiseTotale: +remiseTotale.toFixed(2),
      totalTva: +totalTva.toFixed(2),
      prixFinalTTC: +prixFinalTTC.toFixed(2)
    }, { emitEvent: false });
  }

  onSubmit() {
    if (this.devisForm.invalid) {
      Object.keys(this.devisForm.controls).forEach(key => {
        const control = this.devisForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    this.devisService.addDevis(this.devisForm.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/devis']);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Erreur lors de la création du devis';
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/devis']);
  }
} 