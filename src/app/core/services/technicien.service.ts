import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Technicien {
  idTechnicien: number;
  nom: string;
  Telephone: string;
  email: string;
  nomSociete: string;
  MF: string;
  adresse: string;
}

@Injectable({
  providedIn: 'root'
})
export class TechnicienService {
  private baseUrl = `${environment.apiUrl}/techniciens`;

  constructor(private http: HttpClient) {}

  getAllTechniciens(): Observable<Technicien[]> {
    return this.http.get<Technicien[]>(this.baseUrl);
  }

  getTechnicienById(id: number): Observable<Technicien> {
    return this.http.get<Technicien>(`${this.baseUrl}/${id}`);
  }

  createTechnicien(technicien: Omit<Technicien, 'idTechnicien'>): Observable<Technicien> {
    return this.http.post<Technicien>(`${this.baseUrl}/add-technicien`, technicien, { withCredentials: true });
  }

  updateTechnicien(id: number, technicien: Partial<Technicien>): Observable<Technicien> {
    return this.http.put<Technicien>(`${this.baseUrl}/update-technicien/${id}`, technicien, { withCredentials: true });
  }

  deleteTechnicien(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete-technicien/${id}`, { withCredentials: true });
  }
}
