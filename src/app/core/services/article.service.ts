import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Article {
  idArticle?: number;
  famille: string;
  unite: string;
  marque: string;
  model: string;
  libelle: string;
  prixHT: number;
  tva: number;
  prixTTC?: number;
  prixEntreprise: number;
  reference?: string;
  prix?: number;
  quantite?: number;
  designation?: string;
  category?: string;
  description?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  constructor(private http: HttpClient) { }
  private readonly URL = `${environment.apiUrl}/articles`;

  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.URL).pipe(
      map((articles: Article[]) => {
        return articles.map(article => {
          return {
            ...article,
            designation: article.libelle,
            reference: article.model,
            prix: article.prixTTC || article.prixHT,
            quantite: parseInt(article.unite),
            category: article.famille,
            description: '',
            image: ''
          };
        });
      })
    );
  }

  getArticleById(id: any): Observable<Article> {
    return this.http.get<Article>(`${this.URL}/${id}`).pipe(
      map((article: Article) => {
        return {
          ...article,
          designation: article.libelle,
          reference: article.model,
          prix: article.prixTTC || article.prixHT,
          quantite: parseInt(article.unite),
          category: article.famille,
          description: '',
          image: ''
        };
      })
    );
  }

  addArticle(article: FormData): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.http.post(`${this.URL}/add-article`, article, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  updateArticle(article: FormData, id: any): Observable<any> {
    return this.http.put(`${this.URL}/update-article/${id}`, article);
  }

  deleteArticle(id: any): Observable<any> {
    return this.http.delete(`${this.URL}/delete-article/${id}`);
  }
}
