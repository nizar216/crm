import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Devis {
  idDevis?: number;
  client?: any;
  IdClient?: number;
  prixTotal?: number;
  remiseTotale?: number;
  prixFinalTTC?: number;
  totalTva?: number;
  date?: Date;
  articles?: any[];
  services?: any[];
  DevisArticles?: any[];
  DevisServices?: any[];
  createdAt?: Date;
  updatedAt?: Date;
  Client?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DevisService {
  private readonly URL = `${environment.apiUrl}/devis`;
  constructor(private http: HttpClient) { }

  getAllDevis(): Observable<Devis[]> {
    return this.http.get<Devis[]>(this.URL);
  }

  getDevisById(id: any): Observable<Devis> {
    return this.http.get<Devis>(`${this.URL}/${id}`);
  }

  addDevis(devis: any): Observable<any> {
    return this.http.post(`${this.URL}/add-devis`, devis);
  }

  updateDevis(devis: any, id: any): Observable<any> {
    return this.http.put(`${this.URL}/update-devis/${id}`, devis);
  }

  deleteDevis(id: any): Observable<any> {
    return this.http.delete(`${this.URL}/delete-devis/${id}`);
  }
} 