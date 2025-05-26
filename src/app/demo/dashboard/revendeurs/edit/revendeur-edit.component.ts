import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { RevendeurService } from 'src/app/core/services/revendeur.service';

@Component({
    selector: 'app-revendeur-edit',
    templateUrl: './revendeur-edit.component.html',
    styleUrls: ['./revendeur-edit.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CardComponent,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzMessageModule
    ]
})
export class RevendeurEditComponent implements OnInit {
    revendeurForm: FormGroup;
    isLoading = false;
    idRevendeur: number;

    constructor(
        private fb: FormBuilder,
        private revendeurService: RevendeurService,
        private router: Router,
        private route: ActivatedRoute,
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

    ngOnInit() {
        this.idRevendeur = Number(this.route.snapshot.paramMap.get('id'));
        this.loadRevendeur();
    }

    loadRevendeur() {
        this.isLoading = true;
        this.revendeurService.getRevendeurById(this.idRevendeur).subscribe({
            next: (revendeur) => {
                this.revendeurForm.patchValue({
                    nom: revendeur.nom,
                    Telephone: revendeur.Telephone,
                    email: revendeur.email,
                    responsable: revendeur.responsable,
                    MF: revendeur.MF
                });
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading revendeur:', err);
                this.message.error('Erreur lors du chargement du revendeur');
                this.isLoading = false;
                this.router.navigate(['/dashboard/revendeurs']);
            }
        });
    }

    onSubmit() {
        if (this.revendeurForm.valid) {
            this.isLoading = true;
            const revendeurData = this.revendeurForm.value;

            this.revendeurService.updateRevendeur(this.idRevendeur, revendeurData).subscribe({
                next: () => {
                    this.message.success('Revendeur mis à jour avec succès');
                    this.router.navigate(['/dashboard/revendeurs']);
                },
                error: (err) => {
                    console.error('Error updating revendeur:', err);
                    this.message.error('Erreur lors de la mise à jour du revendeur');
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