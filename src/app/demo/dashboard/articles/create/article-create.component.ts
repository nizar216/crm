import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticleService } from 'src/app/core/services/article.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-article-create',
  templateUrl: './article-create.component.html',
  styleUrls: ['./article-create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
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
    private message: NzMessageService
  ) {
    this.articleForm = this.fb.group({
      famille: [null, [Validators.required]],
      unite: [null, [Validators.required]],
      marque: ['', [Validators.required]],
      model: ['', [Validators.required]],
      libelle: ['', [Validators.required, Validators.minLength(3)]],
      prixHT: [0, [Validators.required, Validators.min(0)]],
      tva: [0, [Validators.required, Validators.min(0)]],
      prixEntreprise: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    // Initialization if needed
  }

  submitForm() {
    // Mark all fields as dirty to trigger validation
    for (const i in this.articleForm.controls) {
      this.articleForm.controls[i].markAsDirty();
      this.articleForm.controls[i].updateValueAndValidity();
    }
    
    if (this.articleForm.invalid) {
      this.message.error('Veuillez remplir tous les champs obligatoires du formulaire.');
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
    formData.append('prixEntreprise', this.articleForm.value.prixEntreprise);
  
    this.isSubmitting = true;
    this.articleService.addArticle(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.message.success('Article créé avec succès!');
        this.router.navigate(['/dashboard/articles']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        this.message.error('Erreur lors de la création de l\'article');
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
      prixEntreprise: 0
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/articles']);
  }
}
