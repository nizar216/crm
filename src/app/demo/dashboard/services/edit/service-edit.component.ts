import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ServiceService } from 'src/app/core/services/service.service';

@Component({
  selector: 'app-service-edit',
  templateUrl: './service-edit.component.html',
  styleUrls: ['./service-edit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzIconModule,
    NzMessageModule,
    NzModalModule,
    NzSpinModule,
    FormsModule
  ]
})
export class ServiceEditComponent implements OnInit {
  serviceForm: FormGroup;
  serviceId: any;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  lastChanged: 'partTech' | 'partEnts' | null = null;

  constructor(
    private serviceService: ServiceService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private modal: NzModalService
  ) {
    this.serviceForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      prix: [0, [Validators.required, Validators.min(0)]],
      tva: [0, [Validators.required, Validators.min(0)]],
      partTech: [0, [Validators.required, Validators.min(0)]],
      partEnts: [0, [Validators.required, Validators.min(0)]],
      prixTot: [0]
    }, { validators: this.partsValidator });
  }

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id');
    if (this.serviceId) {
      this.loadService(this.serviceId);
    } else {
      this.errorMessage = 'ID du service non trouvé';
      setTimeout(() => {
        this.router.navigate(['/dashboard/services']);
      }, 2000);
    }
    this.serviceForm.get('prix')?.valueChanges.subscribe(prix => {
      this.updatePartsOnPrixChange(prix);
      this.updatePrixTot();
      this.serviceForm.updateValueAndValidity();
    });
    this.serviceForm.get('tva')?.valueChanges.subscribe(() => {
      this.updatePrixTot();
    });
    this.serviceForm.get('partTech')?.valueChanges.subscribe(val => {
      if (this.lastChanged !== 'partTech') {
        this.lastChanged = 'partTech';
        this.updatePartEntsFromPartTech();
      }
    });
    this.serviceForm.get('partEnts')?.valueChanges.subscribe(val => {
      if (this.lastChanged !== 'partEnts') {
        this.lastChanged = 'partEnts';
        this.updatePartTechFromPartEnts();
      }
    });
  }

  updatePartsOnPrixChange(prix: number) {
    const partTech = this.serviceForm.get('partTech')?.value || 0;
    const partEnts = this.serviceForm.get('partEnts')?.value || 0;
    if (this.lastChanged === 'partTech') {
      this.updatePartEntsFromPartTech();
    } else if (this.lastChanged === 'partEnts') {
      this.updatePartTechFromPartEnts();
    } else {
      // If neither, just ensure both are not greater than prix
      if (partTech > prix) this.serviceForm.get('partTech')?.setValue(prix);
      if (partEnts > prix) this.serviceForm.get('partEnts')?.setValue(prix);
    }
  }

  updatePartEntsFromPartTech() {
    const prix = this.serviceForm.get('prix')?.value || 0;
    let partTech = this.serviceForm.get('partTech')?.value || 0;
    if (partTech > prix) partTech = prix;
    const partEnts = prix - partTech;
    this.serviceForm.get('partEnts')?.setValue(partEnts, { emitEvent: false });
    this.lastChanged = null;
    this.serviceForm.updateValueAndValidity();
  }

  updatePartTechFromPartEnts() {
    const prix = this.serviceForm.get('prix')?.value || 0;
    let partEnts = this.serviceForm.get('partEnts')?.value || 0;
    if (partEnts > prix) partEnts = prix;
    const partTech = prix - partEnts;
    this.serviceForm.get('partTech')?.setValue(partTech, { emitEvent: false });
    this.lastChanged = null;
    this.serviceForm.updateValueAndValidity();
  }

  updatePrixTot() {
    const prix = parseFloat(this.serviceForm.get('prix')?.value) || 0;
    const tva = parseFloat(this.serviceForm.get('tva')?.value) || 0;
    const prixTot = prix + (prix * tva / 100);
    this.serviceForm.get('prixTot')?.setValue(Number(prixTot.toFixed(2)), { emitEvent: false });
  }

  partsValidator(form: FormGroup) {
    const prix = form.get('prix')?.value || 0;
    const partTech = form.get('partTech')?.value || 0;
    const partEnts = form.get('partEnts')?.value || 0;
    if (partTech < 0 || partEnts < 0) {
      return { negativePart: true };
    }
    if (partTech > prix) {
      return { partTechTooHigh: true };
    }
    if (partEnts > prix) {
      return { partEntsTooHigh: true };
    }
    if (partTech + partEnts !== prix) {
      return { partsSumMismatch: true };
    }
    return null;
  }

  loadService(id: any) {
    this.isLoading = true;
    this.serviceService.getServiceById(id).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const service = response.service || response;
        this.patchFormWithService(service);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement des données du service';
        console.error('Error loading service:', err);
      }
    });
  }

  patchFormWithService(service: any) {
    const formValues = {
      nom: service.nom || '',
      prix: service.prix ? Number(service.prix) : 0,
      tva: service.tva ? Number(service.tva) : 0,
      partTech: service.partTech ? Number(service.partTech) : 0,
      partEnts: service.partEnts ? Number(service.partEnts) : 0
    };
    this.serviceForm.patchValue(formValues);
    this.lastChanged = null;
  }

  onSubmit() {
    if (this.serviceForm.invalid) {
      Object.keys(this.serviceForm.controls).forEach(key => {
        const control = this.serviceForm.get(key);
        control?.markAsTouched();
      });
      this.modal.error({
        nzTitle: 'Erreur',
        nzContent: 'Veuillez remplir tous les champs obligatoires du formulaire et vérifier les parts.'
      });
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    const prix = parseFloat(this.serviceForm.value.prix);
    const tva = parseFloat(this.serviceForm.value.tva);
    const prixTot = prix + (prix * tva / 100);
    const formData = {
      ...this.serviceForm.value,
      prix: Number(this.serviceForm.value.prix),
      tva: Number(this.serviceForm.value.tva),
      prixTot: prixTot,
      partTech: Number(this.serviceForm.value.partTech),
      partEnts: Number(this.serviceForm.value.partEnts)
    };
    this.serviceService.updateService(formData, this.serviceId).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modal.success({
          nzTitle: 'Succès',
          nzContent: 'Le service a été mis à jour avec succès !',
          nzOnOk: () => {
            this.router.navigate(['/dashboard/services']);
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.modal.error({
          nzTitle: 'Erreur',
          nzContent: 'Erreur lors de la mise à jour du service'
        });
        console.error('Error updating service:', err);
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/services']);
  }
} 