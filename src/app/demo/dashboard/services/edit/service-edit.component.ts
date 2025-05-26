import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
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
    CardComponent,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzIconModule,
    NzMessageModule,
    NzModalModule,
    NzSpinModule
  ]
})
export class ServiceEditComponent implements OnInit {
  serviceForm: FormGroup;
  serviceId: any;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private serviceService: ServiceService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.serviceForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      prix: [0, [Validators.required, Validators.min(0)]],
      tva: [0, [Validators.required, Validators.min(0)]],
      partTech: [0, [Validators.required, Validators.min(0)]],
      partEnts: [0, [Validators.required, Validators.min(0)]]
    });
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
  }

  onSubmit() {
    if (this.serviceForm.invalid) {
      Object.keys(this.serviceForm.controls).forEach(key => {
        const control = this.serviceForm.get(key);
        control?.markAsTouched();
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
        this.message.success('Service mis à jour avec succès');
        this.router.navigate(['/dashboard/services']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour du service';
        console.error('Error updating service:', err);
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/services']);
  }
} 