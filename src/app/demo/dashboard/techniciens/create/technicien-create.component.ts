import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TechnicienService } from 'src/app/core/services/technicien.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-technicien-create',
  templateUrl: './technicien-create.component.html',
  styleUrls: ['./technicien-create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzMessageModule,
    NzModalModule,
    NzSpinModule
  ]
})
export class TechnicienCreateComponent implements OnInit {
  technicienForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private technicienService: TechnicienService,
    private router: Router
  ) {
    this.technicienForm = this.fb.group({
      nom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      Telephone: ['', [Validators.required]],
      nomSociete: ['', [Validators.required]],
      MF: ['', [Validators.required]],
      adresse: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Any initialization logic if needed
  }

  onSubmit() {
    if (this.technicienForm.invalid) {
      Object.keys(this.technicienForm.controls).forEach(key => {
        const control = this.technicienForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.technicienService.createTechnicien(this.technicienForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/techniciens']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la création du technicien';
        console.error('Error creating technicien:', err);
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/techniciens']);
  }
}
