import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ServiceService } from 'src/app/core/services/service.service';

@Component({
  selector: 'app-service-create',
  templateUrl: './service-create.component.html',
  styleUrls: ['./service-create.component.scss'],
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
    NzModalModule
  ]
})
export class ServiceCreateComponent implements OnInit {
  serviceForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
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

  ngOnInit() {
    // Initialization if needed
  }

  submitForm() {
    // Mark all fields as dirty to trigger validation
    for (const i in this.serviceForm.controls) {
      this.serviceForm.controls[i].markAsDirty();
      this.serviceForm.controls[i].updateValueAndValidity();
    }
    
    if (this.serviceForm.invalid) {
      this.message.error('Veuillez remplir tous les champs obligatoires du formulaire.');
      return;
    }
  
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
  
    this.isSubmitting = true;
    this.serviceService.addService(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.message.success('Service créé avec succès!');
        this.router.navigate(['/dashboard/services']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        this.message.error('Erreur lors de la création du service');
      }
    });
  }

  resetForm() {
    this.serviceForm.reset({
      nom: '',
      prix: 0,
      tva: 0,
      partTech: 0,
      partEnts: 0
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/services']);
  }
} 