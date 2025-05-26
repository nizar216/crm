import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService, Client } from 'src/app/core/services/client.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-client-create',
  templateUrl: './client-create.component.html',
  styleUrls: ['./client-create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzIconModule,
    NzMessageModule,
    NzSelectModule
  ]
})
export class ClientCreateComponent implements OnInit {
  clientForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  countries = [
    { code: 'TN', name: 'Tunisie' },
    { code: 'FR', name: 'France' },
    { code: 'DZ', name: 'Algérie' },
    { code: 'MA', name: 'Maroc' },
    { code: 'EG', name: 'Égypte' },
    { code: 'SA', name: 'Arabie Saoudite' },
    { code: 'AE', name: 'Émirats Arabes Unis' },
    { code: 'QA', name: 'Qatar' },
    { code: 'KW', name: 'Koweït' },
    { code: 'BH', name: 'Bahreïn' },
    { code: 'OM', name: 'Oman' },
    { code: 'JO', name: 'Jordanie' },
    { code: 'LB', name: 'Liban' },
    { code: 'LY', name: 'Libye' },
    { code: 'SD', name: 'Soudan' }
  ];

  constructor(
    private clientService: ClientService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.clientForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: [''],
      personneAcontacter: ['', [Validators.required]],
      telephone1: ['', [Validators.required]],
      telephone2: [''],
      telephonePersonneaContacter: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      MF: ['', [Validators.required]],
      municipalite: [''],
      ville: [''],
      adresse: [''],
      pays: [''],
      zone: [''],
      note: ['']
    });
  }

  ngOnInit(): void {
    // Any initialization logic
  }

  onSubmit() {
    if (this.clientForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.clientForm.controls).forEach(key => {
        const control = this.clientForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.clientService.addClient(this.clientForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/clients']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la création du client';
        console.error('Error creating client:', err);
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/clients']);
  }
}
