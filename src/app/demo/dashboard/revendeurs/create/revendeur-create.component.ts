import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RevendeurService } from 'src/app/core/services/revendeur.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-revendeur-create',
  templateUrl: './revendeur-create.component.html',
  styleUrls: ['./revendeur-create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzMessageModule
  ]
})
export class RevendeurCreateComponent {
  revendeurForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private revendeurService: RevendeurService,
    private router: Router,
    private message: NzMessageService
  ) {
    this.revendeurForm = this.fb.group({
      nom: ['', [Validators.required]],
      Telephone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      responsable: ['', [Validators.required]],
      MF: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.revendeurForm.valid) {
      this.isLoading = true;
      this.revendeurService.createRevendeur(this.revendeurForm.value).subscribe({
        next: () => {
          this.message.success('Revendeur créé avec succès');
          this.router.navigate(['/dashboard/revendeurs']);
        },
        error: (err) => {
          console.error('Error creating revendeur:', err);
          this.message.error('Erreur lors de la création du revendeur');
          this.isLoading = false;
        }
      });
    } else {
      Object.values(this.revendeurForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/dashboard/revendeurs']);
  }
} 