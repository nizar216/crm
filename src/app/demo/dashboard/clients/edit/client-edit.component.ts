import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService, Client } from 'src/app/core/services/client.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-client-edit',
  templateUrl: './client-edit.component.html',
  styleUrls: ['./client-edit.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NzSelectModule,NzModalModule]
})
export class ClientEditComponent implements OnInit {
  clientForm: FormGroup;
  clientId: any;
  isLoading = false;
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
    private route: ActivatedRoute,
    private router: Router,
    private modal: NzModalService
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
    this.clientId = this.route.snapshot.paramMap.get('id');
    if (this.clientId) {
      this.loadClient(this.clientId);
    } else {
      this.errorMessage = 'Client ID non trouvé';
      setTimeout(() => {
        this.router.navigate(['/dashboard/clients']);
      }, 2000);
    }
  }

  loadClient(id: any) {
    this.isLoading = true;
    this.clientService.getClientById(id).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const client = response.client || response;
        this.patchFormWithClient(client);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement des données client';
        console.error('Error loading client:', err);
      }
    });
  }

  patchFormWithClient(client: Client) {
    this.clientForm.patchValue({
      nom: client.nom,
      prenom: client.prenom || '',
      personneAcontacter: client.personneAcontacter,
      telephone1: client.telephone1,
      telephone2: client.telephone2 || '',
      telephonePersonneaContacter: client.telephonePersonneaContacter,
      email: client.email,
      MF: client.MF,
      municipalite: client.municipalite || '',
      ville: client.ville || '',
      adresse: client.adresse || '',
      pays: client.pays || '',
      zone: client.zone || '',
      note: client.note || ''
    });
    console.log(this.clientForm.value);
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

    this.clientService.updateClient(this.clientForm.value, this.clientId).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modal.success({
          nzTitle: 'Succès',
          nzContent: 'Le client a été modifié avec succès !',
          nzOnOk: () => {
            this.router.navigate(['/dashboard/clients']);
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour du client';
        console.error('Error updating client:', err);
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/clients']);
  }
}
