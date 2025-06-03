import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from 'src/app/core/services/article.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.scss'],
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
    NzModalModule,
    NzSpinModule
  ]
})
export class ArticleEditComponent implements OnInit {
  articleForm: FormGroup;
  articleId: any;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  familles: string[] = ['Famille 1', 'Famille 2', 'Famille 3'];
  unites: string[] = ['Unité', 'Kg', 'Litre', 'Pièce'];

  constructor(
    private articleService: ArticleService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
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

  ngOnInit(): void {
    this.articleId = this.route.snapshot.paramMap.get('id');
    if (this.articleId) {
      this.loadArticle(this.articleId);
    } else {
      this.errorMessage = 'Article ID non trouvé';
      setTimeout(() => {
        this.router.navigate(['/dashboard/articles']);
      }, 2000);
    }
    this.articleForm.get('prixHT')?.valueChanges.subscribe(() => this.calculePrixTotal());
    this.articleForm.get('tva')?.valueChanges.subscribe(() => this.calculePrixTotal());
  }

  calculePrixTotal() {
    const prix = parseFloat(this.articleForm.get('prixHT')?.value) || 0;
    const tva = parseFloat(this.articleForm.get('tva')?.value) || 0;
    const prixTot = prix + (prix * tva) / 100;
    this.articleForm.get('prixTTC')?.patchValue(Number(prixTot.toFixed(2)), { emitEvent: false });
  }

  loadArticle(id: any) {
    this.isLoading = true;
    this.articleService.getArticleById(id).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const article = response.article || response;
        this.patchFormWithArticle(article);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement des données article';
        console.error('Error loading article:', err);
      }
    });
  }

  patchFormWithArticle(article: any) {
    const formValues = {
      famille: article.famille || null,
      unite: article.unite || null,
      marque: article.marque || '',
      model: article.model || '',
      libelle: article.libelle || '',
      prixHT: article.prixHT ? Number(article.prixHT) : 0,
      tva: article.tva ? Number(article.tva) : 0,
      prixTTC: article.prixTTC ? Number(article.prixTTC) : 0
    };

    this.articleForm.patchValue(formValues);
  }

  onSubmit() {
    if (this.articleForm.invalid) {
      Object.keys(this.articleForm.controls).forEach(key => {
        const control = this.articleForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const prixHT = parseFloat(this.articleForm.value.prixHT);
    const tva = parseFloat(this.articleForm.value.tva);
    const prixTTC = prixHT + (prixHT * tva / 100);

    const formData = {
      ...this.articleForm.value,
      prixHT: Number(this.articleForm.value.prixHT),
      tva: Number(this.articleForm.value.tva),
      prixTTC: Number(prixTTC)
    };

    this.articleService.updateArticle(formData, this.articleId).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modal.success({
          nzTitle: 'Succès',
          nzContent: "L'article a été mis à jour avec succès !",
          nzOnOk: () => {
            this.router.navigate(['/dashboard/articles']);
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour de l\'article';
        console.error('Error updating article:', err);
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/articles']);
  }
}