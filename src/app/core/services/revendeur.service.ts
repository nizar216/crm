import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Revendeur {
  idRevendeur?: number;
  nom: string;
  Telephone: string;
  email: string;
  responsable: string;
  MF: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RevendeurService {
  private readonly URL = `${environment.apiUrl}/revendeurs`;

  constructor(private http: HttpClient) { }

  getAllRevendeurs(): Observable<Revendeur[]> {
    return this.http.get<Revendeur[]>(this.URL);
  }

  getRevendeurById(id: number): Observable<Revendeur> {
    return this.http.get<Revendeur>(`${this.URL}/${id}`);
  }

  createRevendeur(revendeur: FormData): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.http.post(`${this.URL}/add-revendeur`, revendeur, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  updateRevendeur(id: any, revendeur: Revendeur): Observable<any> {
    return this.http.put(`${this.URL}/update-revendeur/${id}`, revendeur);
  }

  deleteRevendeur(id: number): Observable<any> {
    return this.http.delete(`${this.URL}/delete-revendeur/${id}`);
  }
}
