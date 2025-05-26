import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TechnicienService } from 'src/app/core/services/technicien.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-technicien-edit',
  templateUrl: './technicien-edit.component.html',
  styleUrls: ['./technicien-edit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzMessageModule
  ]
})
export class TechnicienEditComponent implements OnInit {
  technicienForm: FormGroup;
  technicienId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private technicienService: TechnicienService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.technicienForm = this.fb.group({
      nom: ['', [Validators.required]],
      Telephone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      nomSociete: ['', [Validators.required]],
      MF: ['', [Validators.required]],
      adresse: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.technicienId = idParam ? +idParam : null;

    if (this.technicienId) {
      this.loadTechnicien(this.technicienId);
    } else {
      this.errorMessage = 'ID du technicien non trouvé';
      this.message.error(this.errorMessage);
      setTimeout(() => {
        this.router.navigate(['/dashboard/techniciens']);
      }, 2000);
    }
  }

  loadTechnicien(id: number) {
    this.isLoading = true;
    this.technicienService.getTechnicienById(id).subscribe({
      next: (technicien) => {
        this.technicienForm.patchValue(technicien);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading technicien:', err);
        this.message.error('Erreur lors du chargement du technicien');
        this.router.navigate(['/dashboard/techniciens']);
      }
    });
  }

  onSubmit() {
    if (this.technicienForm.invalid) {
      Object.values(this.technicienForm.controls).forEach(control => {
        control.markAsTouched();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.technicienService.updateTechnicien(this.technicienId!, this.technicienForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.message.success('Technicien mis à jour avec succès');
        this.router.navigate(['/dashboard/techniciens']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error updating technicien:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour du technicien';
        this.message.error(this.errorMessage);
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/techniciens']);
  }
}
