import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { FactureService } from 'src/app/core/services/facture.service';
import { ReclamationService } from 'src/app/core/services/reclamation.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-facture-view',
  templateUrl: './facture-view.component.html',
  styleUrls: ['./facture-view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzMessageModule,
    NzDatePickerModule,
    NzTableModule
  ]
})
export class FactureViewComponent implements OnInit {
  public facture: any = null;
  public reclamation: any = null;
  client: any = null;
  articles: any[] = [];
  services: any[] = [];
  reclamations: any[] = [];
  totals = {
    prixTotal: 0,
    totalArticle: 0,
    totalService: 0,
    prixHT: 0,
    TVAglobal: 0,
    remiseGlobal: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private factureService: FactureService,
    private reclamationService: ReclamationService
  ) { }

  ngOnInit(): void {
    const factureId = this.route.snapshot.paramMap.get('id');
    this.loadFacture(factureId);
  }

  loadFacture(id: any) {
    this.factureService.getAllFactures().subscribe({
      next: (factures) => {
        const facture = factures.find((f: any) => f.idFacture == id);
        if (facture) {
          this.facture = facture;
          this.client = facture.Client || facture.client;
          this.articles = facture.articles || [];
          this.services = facture.services || [];
          this.reclamations = facture.reclamations || [];
          this.totals = {
            prixTotal: facture.prixTotal || 0,
            totalArticle: facture.totalArticle || 0,
            totalService: facture.totalService || 0,
            prixHT: facture.prixHT || 0,
            TVAglobal: facture.TVAglobal || 0,
            remiseGlobal: facture.remiseGlobal || 0
          };
          this.fetchReclamationByFactureId(facture.idFacture);
        }
      },
      error: () => {
        this.message.error('Erreur lors du chargement de la facture');
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/factures']);
  }

  fetchReclamationByFactureId(factureId: any) {
    this.reclamationService.getReclamations().subscribe({
      next: (reclamations) => {
        this.reclamation = reclamations.find((rec: any) => rec.idFacture == factureId) || null;
        console.log(this.reclamation);
      },
      error: () => {
        this.message.error('Erreur lors du chargement de la réclamation');
      }
    });
  }

  generatePDF() {
    const factureElement = document.getElementById('facture-content');
    if (!factureElement) {
      this.message.error('Impossible de trouver la facture à imprimer.');
      return;
    }
    html2canvas(factureElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Calculate the image dimensions to fit the page
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`facture_${this.facture?.idFacture || ''}.pdf`);
    });
  }
}
