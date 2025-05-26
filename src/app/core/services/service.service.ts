import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Service {
  idService: number;
  nom: string;
  prix: number;
  tva: number;
  prixTot: number;
  partTech: number;
  partEnts: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  constructor(private http: HttpClient) { }
  private readonly URL = `${environment.apiUrl}/services`;

  getAllServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.URL);
  }

  getServiceById(id: any): Observable<Service> {
    return this.http.get<Service>(`${this.URL}/${id}`);
  }

  addService(service: any): Observable<any> {
    return this.http.post(`${this.URL}/add-service`, service, { withCredentials: true });
  }

  updateService(service: any, id: any): Observable<any> {
    return this.http.put(`${this.URL}/update-service/${id}`, service, { withCredentials: true });
  }

  deleteService(id: any): Observable<any> {
    return this.http.delete(`${this.URL}/delete-service/${id}`, { withCredentials: true });
  }
} 