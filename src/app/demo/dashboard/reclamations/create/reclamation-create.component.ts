import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReclamationService } from 'src/app/core/services/reclamation.service';
import { ClientService } from 'src/app/core/services/client.service';
import { TechnicienService } from 'src/app/core/services/technicien.service';
import { RevendeurService } from 'src/app/core/services/revendeur.service';
import { ArticleService } from 'src/app/core/services/article.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';


@Component({
    selector: 'app-reclamation-create',
    templateUrl: './reclamation-create.component.html',
    styleUrls: ['./reclamation-create.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzSelectModule,
        NzDatePickerModule,
        NzTimePickerModule,
        NzMessageModule
    ]
})
export class ReclamationCreateComponent implements OnInit {
    reclamationForm: FormGroup;
    clients: any[] = [];
    techniciens: any[] = [];
    revendeurs: any[] = [];
    articles: any[] = [];
    isLoading = false;
    clientsData: any[] = []; // Store full client data
    errorMessage: string = '';

    constructor(
        private fb: FormBuilder,
        private reclamationService: ReclamationService,
        private clientService: ClientService,
        private technicienService: TechnicienService,
        private revendeurService: RevendeurService,
        private articleService: ArticleService,
        private router: Router,
        private message: NzMessageService
    ) {
        this.reclamationForm = this.fb.group({
            dateSaisie: [this.formatDateToday(), Validators.required],
            IdClient: [null, Validators.required],
            personneAcontacter: [''],
            telephone1: [''],
            IdRevendeur: [null],
            idArticle: [null],
            serial_number: [''],
            typeIntervention: [null],
            typeregulation: [null],
            IdTechnicien: [null],
            dateDeRandezVous: [null],
            heureDebut: [null],
            note_Sav: [''],
            note_technicien: [''],
            status: ['non planifiée']
        });

        // Subscribe to client selection changes
        this.reclamationForm.get('IdClient')?.valueChanges.subscribe(clientId => {
            this.onClientChange(clientId);
        });

        // Subscribe to planning changes
        this.reclamationForm.get('dateDeRandezVous')?.valueChanges.subscribe(() => {
            this.updateStatus();
        });
        this.reclamationForm.get('heureDebut')?.valueChanges.subscribe(() => {
            this.updateStatus();
        });
    }

    ngOnInit() {
        this.loadClients();
        this.loadTechniciens();
        this.loadRevendeurs();
        this.loadArticles();
    }

    formatDateToday(): Date {
        return new Date();
    }

    loadClients() {
        this.clientService.getAllClients().subscribe({
            next: (data) => {
                this.clientsData = data; // Store full client data
                this.clients = data.map(client => ({
                    label: client.nom,
                    value: client.idClient
                }));
            },
            error: () => this.message.error('Erreur lors du chargement des clients')
        });
    }

    loadTechniciens() {
        this.technicienService.getAllTechniciens().subscribe({
            next: (data) => {
                this.techniciens = data.map(tech => ({
                    label: tech.nom,
                    value: tech.idTechnicien
                }));
            },
            error: () => this.message.error('Erreur lors du chargement des techniciens')
        });
    }

    loadRevendeurs() {
        this.revendeurService.getAllRevendeurs().subscribe({
            next: (data) => {
                this.revendeurs = data.map(revendeur => ({
                    label: revendeur.nom,
                    value: revendeur.idRevendeur
                }));
            },
            error: () => this.message.error('Erreur lors du chargement des revendeurs')
        });
    }

    loadArticles() {
        this.articleService.getAllArticles().subscribe({
            next: (data) => {
                this.articles = data.map(article => ({
                    label: article.libelle,
                    value: article.idArticle
                }));
            },
            error: () => this.message.error('Erreur lors du chargement des articles')
        });
    }

    onClientChange(clientId: number) {
        if (clientId) {
            const selectedClient = this.clientsData.find(client => client.idClient === clientId);
            if (selectedClient) {
                this.reclamationForm.patchValue({
                    personneAcontacter: selectedClient.personneAcontacter || '',
                    telephone1: selectedClient.telephone1 || ''
                });
            }
        } else {
            // Clear the fields if no client is selected
            this.reclamationForm.patchValue({
                personneAcontacter: '',
                telephone1: ''
            });
        }
    }

    updateStatus() {
        const dateRDV = this.reclamationForm.get('dateDeRandezVous')?.value;
        const heureDebut = this.reclamationForm.get('heureDebut')?.value;
        const isPlanned = dateRDV && heureDebut;

        this.reclamationForm.patchValue({
            status: isPlanned ? 'planifiée' : 'non planifiée'
        }, { emitEvent: false });
    }

    onSubmit() {
        console.log(this.reclamationForm.value.heureDebut)
        if (this.reclamationForm.valid) {
            this.isLoading = true;
            this.updateStatus();

            const formValue = { ...this.reclamationForm.value };

            if (formValue.heureDebut) {
                if (formValue.heureDebut instanceof Date) {
                    const h = formValue.heureDebut.getHours().toString().padStart(2, '0');
                    const m = formValue.heureDebut.getMinutes().toString().padStart(2, '0');
                    const s = formValue.heureDebut.getSeconds().toString().padStart(2, '0');
                    formValue.heureDebut = `${h}:${m}:${s}`;
                } else if (typeof formValue.heureDebut === 'string') {
                    formValue.heureDebut = formValue.heureDebut.split('T')[1]?.substring(0, 8) || null;
                }
            }

            this.reclamationService.addReclamation(formValue).subscribe({
                next: () => {
                    this.message.success('Réclamation créée avec succès');
                    this.router.navigate(['/dashboard/reclamations']);
                },
                error: () => {
                    this.message.error('Erreur lors de la création de la réclamation');
                    this.isLoading = false;
                }
            });
        } else {
            Object.values(this.reclamationForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsTouched();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
        }
    }

    onCancel() {
        this.router.navigate(['/dashboard/reclamations']);
    }
}
