import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Client {
  idClient?: number;
  nom: string;
  prenom?: string;
  personneAcontacter: string;
  telephone1: string;
  telephone2?: string;
  telephonePersonneaContacter: string;
  email: string;
  MF: string;
  municipalite?: string;
  ville?: string;
  adresse?: string;
  pays?: string;
  zone?: string;
  note?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  constructor(private http: HttpClient) { }
  private readonly URL = `${environment.apiUrl}/clients`;

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.URL);
  }

  getClientById(id: any): Observable<Client> {
    return this.http.get<Client>(`${this.URL}/${id}`);
  }

  addClient(client: Client): Observable<any> {
    return this.http.post(`${this.URL}/add-client`, client);
  }

  updateClient(client: Client, id: any): Observable<any> {
    return this.http.put(`${this.URL}/update-client/${id}`, client);
  }

  deleteClient(id: any): Observable<any> {
    return this.http.delete(`${this.URL}/delete-client/${id}`);
  }
}
