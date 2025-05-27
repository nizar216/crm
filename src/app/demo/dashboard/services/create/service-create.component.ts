import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzIconModule,
    NzMessageModule,
    NzModalModule,
    FormsModule
  ]
})
export class ServiceCreateComponent implements OnInit {
  serviceForm: FormGroup;
  isSubmitting = false;
  lastChanged: 'partTech' | 'partEnts' | null = null;

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
      partEnts: [0, [Validators.required, Validators.min(0)]],
      prixTot: [0]
    }, { validators: this.partsValidator });
  }

  ngOnInit() {
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

  submitForm() {
    for (const i in this.serviceForm.controls) {
      this.serviceForm.controls[i].markAsDirty();
      this.serviceForm.controls[i].updateValueAndValidity();
    }
    if (this.serviceForm.invalid) {
      this.message.error('Veuillez remplir tous les champs obligatoires du formulaire et vérifier les parts.');
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
    this.lastChanged = null;
  }

  goBack() {
    this.router.navigate(['/dashboard/services']);
  }
} 