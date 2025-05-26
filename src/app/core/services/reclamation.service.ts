import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Reclamation {
  idReclamation: number;
  status: 'planifiée' | 'non planifiée' | 'en attente' | 'clôturée' | 'fermée' | 'facturée';
  note_technicien?: string;
  note_Sav?: string;
  serial_number?: number;
  dateSaisie?: Date;
  dateDeRandezVous?: Date;
  heureDebut?: string;
  typeIntervention?: string;
  typeregulation?: string;
  numeroDeFactureTech?: string;
  interventionFacture: boolean;
  cout?: number;
  part_tech?: number;
  part_Ents?: number;
  etat_visite?: 'Client Injoignable' | 'Difficult repair' | 'En Attente PDR' | 'PDR/ Produit non Disponible' | 'Terminé';
  prixTotal: number;
  remiseTotale: number;
  prixFinal: number;
  IdClient: number;
  IdTechnicien?: number;
  IdRevendeur: number;
  idArticle?: number;
  idFacture?: number;
  Client?: any;
  Technicien?: any;
  Revendeur?: any;
  Facture?: any;
  articles?: any[];
  services?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private apiUrl = `${environment.apiUrl}/reclamations`;

  constructor(private http: HttpClient) { }

  getReclamations(): Observable<any> {
    return this.http.get(this.apiUrl, { withCredentials: true });
  }

  getReclamationsWhereStatus(): Observable<any> {
    return this.http.get(this.apiUrl + '/where-status-close', { withCredentials: true });
  }

  getReclamationStat(): Observable<any> {
    return this.http.get(this.apiUrl + '/getCountReclamtion', { withCredentials: true });
  }

  addReclamation(reclamation: any): Observable<any> {
    return this.http.post(this.apiUrl + '/add-reclamation', reclamation, { withCredentials: true });
  }

  deleteReclamation(id: any): Observable<any> {
    return this.http.delete(this.apiUrl + '/delete-reclamation/' + id, { withCredentials: true });
  }

  updateReclamation(reclamation: any, id: any): Observable<any> {
    return this.http.put(this.apiUrl + '/update-reclamation/' + id, reclamation, { withCredentials: true });
  }

  getReclamationById(id: any): Observable<any> {
    return this.http.get(this.apiUrl + '/' + id, { withCredentials: true });
  }
}