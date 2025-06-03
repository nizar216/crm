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
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';

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
        NzMessageModule,
        NzTableModule,
        NzModalModule
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
        private modal: NzModalService,
        private technicienService: TechnicienService,
        private articleService: ArticleService,
        private serviceService: ServiceService,
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
            typeIntervention: ['', [Validators.required, Validators.pattern(/^(installation|Réparation)$/i)]],
            typeregulation: ['', [Validators.required, Validators.pattern(/^(Paiement sur revendeur|Paiement sur client)$/i)]],
            note_technicien: [''],
            note_Sav: [''],
            etat_visite: [''],
            services: this.fb.array([]),
            articles: this.fb.array([]),
            prixTotal: [{ value: 0, disabled: true }],
            remiseTotale: [{ value: 0, disabled: true }],
            totalTva: [{ value: 0, disabled: true }],
            prixFinalTTC: [{ value: 0, disabled: true }]
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
        this.articlesFormArray.valueChanges.subscribe(() => {
            if (this.showCostSection) this.updateSummary();
        });
        this.servicesFormArray.valueChanges.subscribe(() => {
            if (this.showCostSection) this.updateSummary();
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
                    prixHT: article.prixHT,
                    tva: article.tva,
                    prixTTC: article.prixTTC,
                    prixEntreprise: article.prixEntreprise
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
                    partEnts: service.partEnts,
                    tva: service.tva,
                    prixTot: service.prixTot
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

        this.reclamationService.getReclamationById(+this.reclamationId).subscribe({
            next: (data) => {
                const timeString = data.heureDebut;
                let time: Date | null = null;
                if (timeString) {
                    const parts = timeString.split(':').map(Number);
                    const hours = parts[0];
                    const minutes = parts[1];
                    const seconds = parts[2] || 0;
                    time = new Date(1970, 0, 1, hours, minutes, seconds);
                }
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
                    etat_visite: data.etat_visite ?? null,
                });

                this.visite_termine = data.etat_visite === 'terminée';

                const articlesArray = this.articlesFormArray;
                articlesArray.clear();
                if (Array.isArray(data.articles) && data.articles.length > 0) {
                    data.articles.forEach((art: any) => {
                        const group = this.fb.group({
                            articleId: [art.articleId || art.idArticle || '', Validators.required],
                            articleBrand: [art.articleBrand || art.marque || ''],
                            quantite: [art.quantite || 1, [Validators.required, Validators.min(1)]],
                            articlePrice: [art.articlePrice || art.prixHT || 0, Validators.required],
                            tva: [art.tva || 0, Validators.required],
                            prixTTC: [{ value: art.prixTTC || 0, disabled: true }],
                            articleDiscount: [art.articleDiscount || art.remise || 0]
                        });
                        articlesArray.push(group);
                    });
                } else if (this.showCostSection) {
                    this.addArticle();
                }

                const servicesArray = this.servicesFormArray;
                servicesArray.clear();
                if (Array.isArray(data.services) && data.services.length > 0) {
                    data.services.forEach((srv: any) => {
                        const group = this.fb.group({
                            serviceId: [srv.serviceId || srv.idService || '', Validators.required],
                            serviceName: [srv.serviceName || srv.nom || ''],
                            quantite: [srv.quantite || 1, [Validators.required, Validators.min(1)]],
                            servicePrice: [srv.servicePrice || srv.prix || 0, Validators.required],
                            tva: [srv.tva || 0, Validators.required],
                            prixTTC: [{ value: srv.prixTTC || 0, disabled: true }],
                            technicianPart: [srv.technicianPart || srv.partTech || 0],
                            companyPart: [srv.companyPart || srv.partEnts || 0],
                            serviceDiscount: [srv.serviceDiscount || srv.remise || 0]
                        });
                        servicesArray.push(group);
                    });
                } else if (this.showCostSection) {
                    this.addService();
                }

                if (this.showCostSection) this.updateSummary();
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
        return ['non planifiée', 'planifiée', 'en attente'].includes(this.currentStatus);
    }

    get showNotesSection(): boolean {
        return ['planifiée', 'en attente', 'clôturée'].includes(this.currentStatus);
    }

    get showVisiteSection(): boolean {
        return ['planifiée', 'en attente'].includes(this.currentStatus);
    }

    get showCostSection(): boolean {
        return this.currentStatus === 'clôturée';
    }

    private hasBeenInProgress(): boolean {
        const formValue = this.reclamationForm.value;
        return !!(formValue.note_technicien || formValue.etat_visite);
    }

    getSubmitButtonText(): string {
        const formValue = this.reclamationForm.value;
    
        if (this.visite_termine) {
            return 'Clôturer';
        }
    
        if (formValue.etat_visite && formValue.visite_termine === false) {
            return 'Mettre en attente';
        }
    
        switch (this.currentStatus) {
            case 'non planifiée':
                if (formValue.IdTechnicien && formValue.dateSaisie && formValue.dateDeRandezVous && formValue.heureDebut) {
                    return 'Planifier';
                }
                return 'Mettre à jour';
            case 'planifiée':
                if (formValue.etat_visite && formValue.etat_visite !== '' && formValue.etat_visite !== 'terminée') {
                    return 'Mettre en attente';
                }
                if (formValue.etat_visite === 'terminée') {
                    return 'Clôturer';
                }
                return 'Mettre à jour';
            case 'en attente':
                if (formValue.dateDeRandezVous && formValue.heureDebut) {
                    return 'Replanifier';
                }
                return 'Mettre à jour';
            case 'clôturée':
                return 'Fermer';
            default:
                return 'Mettre à jour';
        }
    }

    determineNextStatus(): string {
        const formValue = this.reclamationForm.value;
        if (this.visite_termine) {
            return 'clôturée';
        }
        if (formValue.etat_visite && formValue.visite_termine === false) {
            return 'en attente';
        }
        switch (this.currentStatus) {
            case 'non planifiée':
                if (formValue.IdTechnicien && formValue.dateSaisie && formValue.dateDeRandezVous && formValue.heureDebut) {
                    return 'planifiée';
                }
                return 'non planifiée';
            case 'planifiée':
                if (formValue.etat_visite && formValue.etat_visite !== '' && formValue.etat_visite !== 'terminée') {
                    return 'en attente';
                }
                if (formValue.etat_visite === 'terminée') {
                    return 'clôturée';
                }
                return 'planifiée';
            case 'en attente':
                if (formValue.dateDeRandezVous && formValue.heureDebut) {
                    return 'planifiée';
                }
                return 'en attente';
            case 'clôturée':
                return 'fermée';
            default:
                return this.currentStatus;
        }
    }

    private validateStatusTransition(): { isValid: boolean; errorMessage?: string } {
        const formValue = this.reclamationForm.value;
        const nextStatus = this.determineNextStatus();

        switch (this.currentStatus) {
            case 'non planifiée':
                if (nextStatus === 'planifiée') {
                    if (!formValue.IdTechnicien || !formValue.dateSaisie ||
                        !formValue.dateDeRandezVous || !formValue.heureDebut) {
                        return {
                            isValid: false,
                            errorMessage: 'Pour planifier, veuillez remplir: Technicien, Date de saisie, Date de rendez-vous et Heure de début.'
                        };
                    }
                }
                break;
            case 'planifiée':
                if (formValue.etat_visite && formValue.etat_visite !== '' && formValue.etat_visite !== 'terminée') {
                    if (!formValue.etat_visite) {
                        return {
                            isValid: false,
                            errorMessage: 'Veuillez renseigner l\'état de la visite pour passer en attente.'
                        };
                    }
                }
                if (formValue.etat_visite === 'terminée') {
                    if (!formValue.note_technicien) {
                        return {
                            isValid: false,
                            errorMessage: 'Pour clôturer, veuillez ajouter une note du technicien.'
                        };
                    }
                }
                break;
            case 'en attente':
                if (nextStatus === 'planifiée') {
                    if (!formValue.dateDeRandezVous || !formValue.heureDebut) {
                        return {
                            isValid: false,
                            errorMessage: 'Veuillez renseigner la nouvelle date de rendez-vous et l\'heure de début pour replanifier.'
                        };
                    }
                }
                break;
            case 'clôturée':
                break;
        }
        return { isValid: true };
    }

    addService() {
        const serviceForm = this.fb.group({
            serviceId: ['', Validators.required],
            serviceName: [''],
            quantite: [1, [Validators.required, Validators.min(1)]],
            servicePrice: [0, Validators.required],
            tva: [0, Validators.required],
            prixTTC: [{ value: 0, disabled: true }],
            technicianPart: [0],
            companyPart: [0],
            serviceDiscount: [0]
        });
        this.servicesFormArray.push(serviceForm);
        const idx = this.servicesFormArray.length - 1;
        serviceForm.get('serviceId')?.valueChanges.subscribe(() => {
            this.onServiceSelect(serviceForm.get('serviceId')?.value, idx);
        });
        ['serviceDiscount', 'quantite', 'servicePrice', 'tva', 'technicianPart', 'companyPart'].forEach(field => {
            serviceForm.get(field)?.valueChanges.subscribe(() => {
                const quantite = +serviceForm.get('quantite')?.value || 0;
                const prix = +serviceForm.get('servicePrice')?.value || 0;
                const tva = +serviceForm.get('tva')?.value || 0;
                const remise = +serviceForm.get('serviceDiscount')?.value || 0;
                const prixTotalService = prix * quantite;
                const remiseVal = prixTotalService * (remise / 100);
                const prixServiceRemise = prixTotalService - remiseVal;
                const prixTTC = +(prixServiceRemise + (prixServiceRemise * tva / 100)).toFixed(2);
                serviceForm.get('prixTTC')?.setValue(prixTTC, { emitEvent: false });
                if (this.showCostSection) this.updateSummary();
            });
        });
        if (this.showCostSection) this.updateSummary();
    }

    removeService(index: number) {
        this.servicesFormArray.removeAt(index);
        if (this.showCostSection) this.updateSummary();
    }

    addArticle() {
        const articleForm = this.fb.group({
            articleId: ['', Validators.required],
            articleBrand: [''],
            quantite: [1, [Validators.required, Validators.min(1)]],
            articlePrice: [0, Validators.required],
            tva: [0, Validators.required],
            prixTTC: [{ value: 0, disabled: true }],
            articleDiscount: [0]
        });
        this.articlesFormArray.push(articleForm);
        const idx = this.articlesFormArray.length - 1;
        articleForm.get('articleId')?.valueChanges.subscribe(() => {
            this.onArticleSelect(articleForm.get('articleId')?.value, idx);
        });
        ['articleDiscount', 'quantite', 'articlePrice', 'tva'].forEach(field => {
            articleForm.get(field)?.valueChanges.subscribe(() => {
                const quantite = +articleForm.get('quantite')?.value || 0;
                const prixHT = +articleForm.get('articlePrice')?.value || 0;
                const tva = +articleForm.get('tva')?.value || 0;
                const remise = +articleForm.get('articleDiscount')?.value || 0;
                const prixHTTotal = prixHT * quantite;
                const remiseVal = prixHTTotal * (remise / 100);
                const prixHTRemise = prixHTTotal - remiseVal;
                const prixTTC = +(prixHTRemise + (prixHTRemise * tva / 100)).toFixed(2);
                articleForm.get('prixTTC')?.setValue(prixTTC, { emitEvent: false });
                if (this.showCostSection) this.updateSummary();
            });
        });
        if (this.showCostSection) this.updateSummary();
    }

    removeArticle(index: number) {
        this.articlesFormArray.removeAt(index);
        if (this.showCostSection) this.updateSummary();
    }

    get servicesFormArray() {
        return this.reclamationForm.get('services') as FormArray;
    }

    get articlesFormArray() {
        return this.reclamationForm.get('articles') as FormArray;
    }

    getArticleGroups() {
        return this.articlesFormArray.controls.filter(ctrl => ctrl instanceof FormGroup) as FormGroup[];
    }

    getServiceGroups() {
        return this.servicesFormArray.controls.filter(ctrl => ctrl instanceof FormGroup) as FormGroup[];
    }

    updateSummary() {
        let prixTotal = 0;
        let remiseTotale = 0;
        let totalTva = 0;
        let prixFinalTTC = 0;

        this.articlesFormArray.controls.forEach(ctrl => {
            console.log(ctrl.value);
            const quantite = +ctrl.get('quantite')?.value || 0;
            const prixHT = +ctrl.get('articlePrice')?.value || 0;
            const tva = +ctrl.get('tva')?.value || 0;
            const remise = +ctrl.get('articleDiscount')?.value || 0;
            const prixHTTotal = prixHT * quantite;
            const remiseVal = prixHTTotal * (remise / 100);
            const prixHTRemise = prixHTTotal - remiseVal;
            const tvaVal = prixHTRemise * (tva / 100);
            prixTotal += prixHTTotal;
            remiseTotale += remiseVal;
            totalTva += tvaVal;
            prixFinalTTC += prixHTRemise + tvaVal;
        });

        this.servicesFormArray.controls.forEach(ctrl => {
            const quantite = +ctrl.get('quantite')?.value || 0;
            const prix = +ctrl.get('servicePrice')?.value || 0;
            const tva = +ctrl.get('tva')?.value || 0;
            const remise = +ctrl.get('serviceDiscount')?.value || 0;
            const prixTotalService = prix * quantite;
            const remiseVal = prixTotalService * (remise / 100);
            const prixServiceRemise = prixTotalService - remiseVal;
            const tvaVal = prixServiceRemise * (tva / 100);
            prixTotal += prixTotalService;
            remiseTotale += remiseVal;
            totalTva += tvaVal;
            prixFinalTTC += prixServiceRemise + tvaVal;
        });

        this.reclamationForm.patchValue({
            prixTotal: +prixTotal.toFixed(2),
            remiseTotale: +remiseTotale.toFixed(2),
            totalTva: +totalTva.toFixed(2),
            prixFinalTTC: +prixFinalTTC.toFixed(2)
        }, { emitEvent: false });
    }

    onServiceSelect(serviceId: string, index: number) {
        const selectedService = this.services.find(s => s.value === serviceId);
        if (selectedService) {
            const serviceForm = this.servicesFormArray.at(index);
            serviceForm.patchValue({
                serviceName: selectedService.label,
                servicePrice: Number(selectedService.prix) || 0,
                tva: Number(selectedService.tva) || 0,
                prixTTC: Number(selectedService.prixTot) || (Number(selectedService.prix) + (Number(selectedService.prix) * (Number(selectedService.tva) || 0) / 100)),
                technicianPart: Number(selectedService.partTech) || 0,
                companyPart: Number(selectedService.partEnts) || 0,
                quantite: 1,
                serviceDiscount: 0
            }, { emitEvent: false });
        }
        if (this.showCostSection) this.updateSummary();
    }

    onArticleSelect(articleId: string, index: number) {
        const selectedArticle = this.articles.find(a => a.value === articleId);
        if (selectedArticle) {
            const articleForm = this.articlesFormArray.at(index);
            articleForm.patchValue({
                articleBrand: selectedArticle.marque || '',
                articlePrice: Number(selectedArticle.prixHT) || 0,
                tva: Number(selectedArticle.tva) || 0,
                prixTTC: Number(selectedArticle.prixTTC) || (Number(selectedArticle.prixHT) + (Number(selectedArticle.prixHT) * (Number(selectedArticle.tva) || 0) / 100)),
                quantite: 1,
                articleDiscount: 0
            }, { emitEvent: false });
        }
        if (this.showCostSection) this.updateSummary();
    }

    onSubmit() {
        const validation = this.validateStatusTransition();
        if (!validation.isValid) {
            this.modal.error({
                nzTitle: 'Erreur de transition',
                nzContent: validation.errorMessage
            });
            return;
        }

        if (this.showCostSection) {
            if (this.articlesFormArray.length === 0 && this.servicesFormArray.length === 0) {
                this.modal.error({
                    nzTitle: 'Erreur',
                    nzContent: 'Veuillez ajouter au moins un article ou un service pour la clôture.'
                });
                return;
            }

            let costInvalid = false;
            this.articlesFormArray.controls.forEach(ctrl => {
                if (ctrl.invalid) costInvalid = true;
            });
            this.servicesFormArray.controls.forEach(ctrl => {
                if (ctrl.invalid) costInvalid = true;
            });

            if (costInvalid) {
                this.modal.error({
                    nzTitle: 'Erreur',
                    nzContent: 'Veuillez remplir correctement tous les champs de coût.'
                });
                return;
            }
        }

        if (!this.showCostSection) {
            const invalidKeys = Object.keys(this.reclamationForm.controls).filter(key => {
                const control = this.reclamationForm.get(key);
                return control && control.invalid;
            });

            const nonCostInvalid = invalidKeys.filter(key => key !== 'services' && key !== 'articles');

            if (nonCostInvalid.length > 0) {
                nonCostInvalid.forEach(key => {
                    const control = this.reclamationForm.get(key);
                    if (control && control.invalid) {
                        console.warn(`Field "${key}" is invalid:`, control.errors);
                    }
                });
                this.modal.error({
                    nzTitle: 'Erreur',
                    nzContent: 'Veuillez remplir tous les champs requis'
                });
                return;
            }
        } else {
            if (this.reclamationForm.invalid) {
                console.log('Form Values:', this.reclamationForm.value);
                Object.keys(this.reclamationForm.controls).forEach(key => {
                    const control = this.reclamationForm.get(key);
                    if (control && control.invalid) {
                        console.warn(`Field "${key}" is invalid:`, control.errors);
                    }
                });
                this.modal.error({
                    nzTitle: 'Erreur',
                    nzContent: 'Veuillez remplir tous les champs requis'
                });
                return;
            }
        }

        const formValue = this.reclamationForm.getRawValue();
        let nextStatus = this.determineNextStatus();

        let formattedTime = '';
        if (formValue.heureDebut) {
            const date = new Date(formValue.heureDebut);
            formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`;
        }

        if (this.currentStatus === 'planifiée' && this.hasBeenInProgress()) {
            if (formValue.etat_visite === 'terminée' && formValue.note_technicien) {
                nextStatus = 'clôturée';
            }
        }

        const services = (formValue.services || []).map((srv: any) => ({
            idService: srv.serviceId,
            quantite: srv.quantite,
            servicePrice: srv.servicePrice,
            tva: srv.tva,
            prixTTC: srv.prixTTC,
            technicianPart: srv.technicianPart,
            companyPart: srv.companyPart,
            remise: srv.serviceDiscount
        }));
        console.log(services);
        const articles = formValue.articles || [];
        const updatedData = {
            ...formValue,
            heureDebut: formattedTime,
            status: nextStatus,
            services,
            articles,
            prixTotal: formValue.prixTotal,
            remiseTotale: formValue.remiseTotale,
            totalTva: formValue.totalTva,
            prixFinalTTC: formValue.prixFinalTTC,
            etat_visite: this.visite_termine ? 'Terminé' : formValue.etat_visite
        };

        this.reclamationService.updateReclamation(updatedData, this.reclamationId).subscribe({
            next: (res) => {
                this.modal.success({
                    nzTitle: 'Succès',
                    nzContent: `La réclamation a été mise à jour avec succès ! Nouveau statut: ${nextStatus}`,
                    nzOnOk: () => {
                        this.router.navigate(['/dashboard/reclamations']);
                    }
                });
            },
            error: (err) => {
                console.log(services, articles, this.reclamationForm.value)
                console.error('Erreur mise à jour:', err);
                this.modal.error({
                    nzTitle: 'Erreur',
                    nzContent: 'Erreur lors de la mise à jour de la réclamation'
                });
            }
        });
    }

    annuler() {
        this.router.navigate(['/reclamations']);
    }

    private showSuccess(message: string) {
        this.modal.success({
            nzTitle: 'Succès',
            nzContent: message
        });
    }

    private showError(message: string) {
        this.modal.error({
            nzTitle: 'Erreur',
            nzContent: message
        });
    }
}