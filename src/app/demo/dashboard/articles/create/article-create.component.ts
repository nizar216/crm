import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticleService } from 'src/app/core/services/article.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-article-create',
  templateUrl: './article-create.component.html',
  styleUrls: ['./article-create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzIconModule,
    NzMessageModule,
    NzModalModule
  ]
})
export class ArticleCreateComponent implements OnInit {
  articleForm: FormGroup;
  isSubmitting = false;
  familles: string[] = ['Famille 1', 'Famille 2', 'Famille 3'];
  unites: string[] = ['Unité', 'Kg', 'Litre', 'Pièce'];

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private router: Router,
    private modal: NzModalService
  ) {
    this.articleForm = this.fb.group({
      famille: [null, [Validators.required]],
      unite: [null, [Validators.required]],
      marque: ['', [Validators.required]],
      model: ['', [Validators.required]],
      libelle: ['', [Validators.required, Validators.minLength(3)]],
      prixHT: [0, [Validators.required, Validators.min(0)]],
      tva: [0, [Validators.required, Validators.min(0)]],
      prixTTC: [0]
    });
  }

  ngOnInit() {
    this.articleForm.get('prixHT')?.valueChanges.subscribe(() => this.calculePrixTotal());
    this.articleForm.get('tva')?.valueChanges.subscribe(() => this.calculePrixTotal());
  }

  calculePrixTotal() {
    const prix = parseFloat(this.articleForm.get('prixHT')?.value) || 0;
    const tva = parseFloat(this.articleForm.get('tva')?.value) || 0;
    const prixTot = prix + (prix * tva) / 100;
    this.articleForm.get('prixTTC')?.patchValue(Number(prixTot.toFixed(2)), { emitEvent: false });
  }

  submitForm() {
    for (const i in this.articleForm.controls) {
      this.articleForm.controls[i].markAsDirty();
      this.articleForm.controls[i].updateValueAndValidity();
    }

    if (this.articleForm.invalid) {
      this.modal.error({
        nzTitle: 'Erreur',
        nzContent: 'Veuillez remplir tous les champs obligatoires du formulaire.'
      });
      return;
    }

    const prixHT = parseFloat(this.articleForm.value.prixHT);
    const tva = parseFloat(this.articleForm.value.tva);
    const prixTTC = prixHT + (prixHT * tva / 100);

    const formData = new FormData();
    formData.append('famille', this.articleForm.value.famille);
    formData.append('unite', this.articleForm.value.unite);
    formData.append('marque', this.articleForm.value.marque);
    formData.append('model', this.articleForm.value.model);
    formData.append('libelle', this.articleForm.value.libelle);
    formData.append('prixHT', this.articleForm.value.prixHT);
    formData.append('tva', this.articleForm.value.tva);
    formData.append('prixTTC', prixTTC.toFixed(2));

    this.isSubmitting = true;
    this.articleService.addArticle(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.modal.success({
          nzTitle: 'Succès',
          nzContent: "L'article a été créé avec succès !",
          nzOnOk: () => {
            this.router.navigate(['/dashboard/articles']);
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        this.modal.error({
          nzTitle: 'Erreur',
          nzContent: 'Erreur lors de la création de l\'article'
        });
      }
    });
  }

  resetForm() {
    this.articleForm.reset({
      famille: null,
      unite: null,
      marque: '',
      model: '',
      libelle: '',
      prixHT: 0,
      tva: 0,
      prixTTC: 0
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/articles']);
  }
}
