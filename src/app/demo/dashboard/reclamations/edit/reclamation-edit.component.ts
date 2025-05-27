import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReclamationService } from 'src/app/core/services/reclamation.service';
import { ClientService } from 'src/app/core/services/client.service';
import { TechnicienService } from 'src/app/core/services/technicien.service';
import { RevendeurService } from 'src/app/core/services/revendeur.service';
import { ArticleService } from 'src/app/core/services/article.service';
import { ServiceService } from 'src/app/core/services/service.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reclamation-edit',
  templateUrl: './reclamation-edit.component.html',
  styleUrls: ['./reclamation-edit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzInputNumberModule,
    NzSwitchModule,
    NzMessageModule
  ]
})
export class ReclamationEditComponent implements OnInit {
  reclamationForm: FormGroup;
  techniciens: any[] = [];
  articles: any[] = [];
  services: any[] = [];
  currentStatus: string = '';
  reclamationId: string | null = null;
  isLoading: boolean = false;
  visite_termine: boolean = false;
  etat_visite: string = '';
  selectedServices: any[] = [];
  selectedArticles: any[] = [];
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private reclamationService: ReclamationService,
    private technicienService: TechnicienService,
    private articleService: ArticleService,
    private serviceService: ServiceService,
    private message: NzMessageService
  ) {
    this.reclamationForm = this.fb.group({
      IdTechnicien: ['', Validators.required],
      dateSaisie: ['', Validators.required],
      dateDeRandezVous: ['', Validators.required],
      heureDebut: [null, Validators.required],
      IdClient: [''],
      nomClient: [''],
      personneAcontacter: [''],
      telephone1: [''],
      IdRevendeur: [''],
      nomRevendeur: [''],
      idArticle: [''],
      nomArt: [''],
      serial_number: [''],
      typeIntervention: [''],
      typeregulation: [''],
      note_technicien: [''],
      note_Sav: [''],
      etat_visite: [''],
      services: this.fb.array([]),
      articles: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadTechniciens();
    this.loadArticles();
    this.loadServices();
    this.route.paramMap.subscribe(params => {
      this.reclamationId = params.get('id');
      if (this.reclamationId) {
        this.loadReclamation();
      }
    });
  }

  loadTechniciens() {
    this.technicienService.getAllTechniciens().subscribe({
      next: (data) => {
        this.techniciens = data.map(tech => ({
          value: tech.idTechnicien,
          label: tech.nom
        }));
      },
      error: (err) => {
        console.error('Erreur chargement techniciens:', err);
        this.showError('Erreur lors du chargement des techniciens');
      }
    });
  }

  loadArticles() {
    this.articleService.getAllArticles().subscribe({
      next: (data) => {
        this.articles = data.map(article => ({
          value: article.idArticle,
          label: article.libelle,
          marque: article.marque,
          prixHT: article.prixHT
        }));
      },
      error: (err) => {
        console.error('Erreur chargement articles:', err);
        this.showError('Erreur lors du chargement des articles');
      }
    });
  }

  loadServices() {
    this.serviceService.getAllServices().subscribe({
      next: (data) => {
        this.services = data.map(service => ({
          value: service.idService,
          label: service.nom,
          prix: service.prix,
          partTech: service.partTech,
          partEnts: service.partEnts
        }));
      },
      error: (err) => {
        console.error('Erreur chargement services:', err);
        this.showError('Erreur lors du chargement des services');
      }
    });
  }

  loadReclamation() {
    if (!this.reclamationId) return;

    this.reclamationService.getReclamationById(this.reclamationId).subscribe({
      next: (data) => {
        const timeString = data.heureDebut;
        const parts = timeString.split(':').map(Number);
        const hours = parts[0];
        const minutes = parts[1];
        const seconds = parts[2] || 0;

        let time = new Date(1970, 0, 1, hours, minutes, seconds);
        this.currentStatus = data.status;
        this.reclamationForm.patchValue({
          IdTechnicien: data.IdTechnicien || '',
          dateSaisie: data.dateSaisie ? data.dateSaisie.substring(0, 10) : null,
          dateDeRandezVous: data.dateDeRandezVous ? data.dateDeRandezVous.substring(0, 10) : null,
          heureDebut: time,
          IdClient: data.IdClient || '',
          nomClient: data.Client?.nom || '',
          personneAcontacter: data.Client?.personneAcontacter || '',
          telephone1: data.Client?.telephone1 || '',
          IdRevendeur: data.IdRevendeur || '',
          nomRevendeur: data.Revendeur?.nom || '',
          idArticle: data.idArticle || '',
          serial_number: data.serial_number || '',
          typeIntervention: data.typeIntervention || '',
          typeregulation: data.typeregulation || '',
          note_technicien: data.note_technicien || '',
          note_Sav: data.note_Sav || '',
          etat_visite: data.etat_visite || '',
        });
      },
      error: (err) => {
        console.error('Erreur chargement réclamation:', err);
        this.showError('Erreur lors du chargement de la réclamation');
      }
    });
  }

  get showTechnicianSection(): boolean {
    return ['non planifiée', 'planifiée'].includes(this.currentStatus);
  }

  get showInterventionSection(): boolean {
    return ['planifiée', 'en attente'].includes(this.currentStatus);
  }

  get showNotesSection(): boolean {
    return ['en attente', 'clôturée'].includes(this.currentStatus);
  }

  get showVisiteSection(): boolean {
    return ['planifiée', 'en attente'].includes(this.currentStatus);
  }

  get showCostSection(): boolean {
    return this.currentStatus === 'clôturée';
  }

  getSubmitButtonText(): string {
    switch (this.currentStatus) {
      case 'non planifiée':
        return 'Planifier';
      case 'planifiée':
        return 'Mettre en attente';
      case 'en attente':
        return 'Clôturer';
      case 'clôturée':
        return 'Fermer';
      default:
        return 'Mettre à jour';
    }
  }

  determineNextStatus(): string {
    if (this.currentStatus === 'planifiée') {
      if (this.etat_visite) {
        return this.visite_termine ? 'clôturée' : 'en attente';
      }
      return 'en attente';
    }
    
    switch (this.currentStatus) {
      case 'non planifiée':
        return 'planifiée';
      case 'en attente':
        return 'clôturée';
      case 'clôturée':
        return 'fermée';
      default:
        return this.currentStatus;
    }
  }

  addService() {
    const serviceForm = this.fb.group({
      serviceId: ['', Validators.required],
      serviceName: [''],
      servicePrice: [0],
      technicianPart: [0],
      companyPart: [0],
      serviceDiscount: [0]
    });
    this.servicesFormArray.push(serviceForm);
  }

  removeService(index: number) {
    this.servicesFormArray.removeAt(index);
  }

  addArticle() {
    const articleForm = this.fb.group({
      articleId: ['', Validators.required],
      articleBrand: [''],
      articlePrice: [0],
      articleQuantity: [1],
      articleDiscount: [0]
    });
    this.articlesFormArray.push(articleForm);
  }

  removeArticle(index: number) {
    this.articlesFormArray.removeAt(index);
  }

  get servicesFormArray() {
    return this.reclamationForm.get('services') as FormArray;
  }

  get articlesFormArray() {
    return this.reclamationForm.get('articles') as FormArray;
  }

  onServiceSelect(serviceId: string, index: number) {
    const selectedService = this.services.find(s => s.value === serviceId);
    if (selectedService) {
      const serviceForm = this.servicesFormArray.at(index);
      serviceForm.patchValue({
        serviceName: selectedService.label,
        servicePrice: Number(selectedService.prix) || 0,
        technicianPart: Number(selectedService.partTech) || 0,
        companyPart: Number(selectedService.partEnts) || 0,
        serviceDiscount: 0
      });
    }
  }

  onArticleSelect(articleId: string, index: number) {
    const selectedArticle = this.articles.find(a => a.value === articleId);
    if (selectedArticle) {
      const articleForm = this.articlesFormArray.at(index);
      articleForm.patchValue({
        articleBrand: selectedArticle.marque || '',
        articlePrice: Number(selectedArticle.prixHT) || 0,
        articleQuantity: 1,
        articleDiscount: 0
      });
    }
  }

  onSubmit() {
    if (this.reclamationForm.invalid) {
      this.showError('Veuillez remplir tous les champs requis');
      return;
    }

    const formValue = this.reclamationForm.value;
    const nextStatus = this.determineNextStatus();

    let formattedTime = '';
    if (formValue.heureDebut) {
      const date = new Date(formValue.heureDebut);
      formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`;
    }

    const updatedData = {
      ...formValue,
      heureDebut: formattedTime,
      status: nextStatus,
      services: this.servicesFormArray.value,
      articles: this.articlesFormArray.value
    };

    this.reclamationService.updateReclamation(updatedData, this.reclamationId).subscribe({
      next: (res) => {
        this.showSuccess('Réclamation mise à jour avec succès');
        this.router.navigate(['/dashboard/reclamations']);
      },
      error: (err) => {
        console.error('Erreur mise à jour:', err);
        this.showError('Erreur lors de la mise à jour de la réclamation');
      }
    });
  }

  annuler() {
    this.router.navigate(['/reclamations']);
  }

  private showSuccess(message: string) {
    this.message.success(message);
  }

  private showError(message: string) {
    this.message.error(message);
  }
} 