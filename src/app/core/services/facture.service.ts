import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FactureService {
  constructor(private http: HttpClient) {}
  
  private URL = `${environment.backendUrl}/api/factures`;

  getAllFactures(): Observable<any> {
    return this.http.get(this.URL);
  }
  
  AddFacture(facture: any): Observable<any> {
    return this.http.post(`${this.URL}/add-facture`, facture, {
      withCredentials: true,
    });
  }
  
  getArticlesCount(): Observable<any> {
    return this.http.get(`${this.URL}/articles-count`);
  }
  
  getClientStats(): Observable<any> {
    return this.http.get(`${this.URL}/stats-clients`);
  }
  
  getFactureStats(): Observable<any> {
    return this.http.get(`${this.URL}/stats-facture`);
  }
  
  getRentableClient(): Observable<any> {
    return this.http.get(`${this.URL}/total-factures`);
  }
  
  deleteFacture(id: any): Observable<any> {
    return this.http.delete(`${this.URL}/delete-facture/${id}`);
  }

  getFactureDataFromClosedReclamations(clientId: number): Observable<any> {
    return this.http.get(`${this.URL}/data-from-reclamations/${clientId}`);
  }
}
