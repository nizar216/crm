import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RevendeurService, Revendeur } from 'src/app/core/services/revendeur.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-revendeur-list',
  templateUrl: './revendeur-list.component.html',
  styleUrls: ['./revendeur-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardComponent,
    NzPaginationModule, NzTableModule, NzDividerModule,
    NzButtonModule, NzIconModule, NzInputModule,
    NzMessageModule, NzToolTipModule
  ]
})
export class RevendeurListComponent implements OnInit {
  revendeurs: Revendeur[] = [];
  searchTerm = '';
  isLoading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private revendeurService: RevendeurService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.loadRevendeurs();
  }

  loadRevendeurs() {
    this.isLoading = true;
    this.revendeurService.getAllRevendeurs().subscribe({
      next: (data) => {
        this.revendeurs = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching revendeurs:', err);
        this.isLoading = false;
      }
    });
  }

  createRevendeur() {
    this.router.navigate(['/dashboard/revendeurs/create']);
  }

  editRevendeur(idRevendeur: any) {
    this.router.navigate(['/dashboard/revendeurs/edit', idRevendeur]);
  }

  deleteRevendeur(idRevendeur: any) {
    this.revendeurService.deleteRevendeur(idRevendeur).subscribe({
      next: () => {
        this.loadRevendeurs();
        this.message.success('Revendeur supprimé avec succès');
      },
      error: (err) => {
        console.error('Error deleting revendeur:', err);
        this.message.error('Erreur lors de la suppression du revendeur');
      }
    });
  }

  get filteredRevendeurs() {
    return this.revendeurs.filter(revendeur =>
      (revendeur.nom && revendeur.nom.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
      (revendeur.email && revendeur.email.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
      (revendeur.Telephone && revendeur.Telephone.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  exportToPdf() {
    const doc = new jsPDF();
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR');

    doc.setFontSize(18);
    doc.text('Liste des Revendeurs', 105, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Date: ${dateStr}`, 105, 22, { align: 'center' });

    const columns = [
      { header: 'Nom', dataKey: 'nom' },
      { header: 'Téléphone', dataKey: 'telephone' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Responsable', dataKey: 'responsable' },
      { header: 'MF', dataKey: 'mf' }
    ];

    const data = this.filteredRevendeurs.map(revendeur => ({
      nom: revendeur.nom,
      telephone: revendeur.Telephone || '-',
      email: revendeur.email || '-',
      responsable: revendeur.responsable || '-',
      mf: revendeur.MF || '-'
    }));

    autoTable(doc, {
      columns,
      body: data,
      startY: 30,
      headStyles: {
        fillColor: [114, 103, 239],
        textColor: [255, 255, 255]
      },
      alternateRowStyles: {
        fillColor: [240, 240, 250]
      }
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} de ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`liste_revendeurs_${dateStr.replace(/\//g, '-')}.pdf`);
    this.message.success('PDF exporté avec succès');
  }

  exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Revendeurs');

    worksheet.columns = [
      { header: 'Nom', key: 'nom', width: 25 },
      { header: 'Téléphone', key: 'telephone', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Responsable', key: 'responsable', width: 25 },
      { header: 'MF', key: 'mf', width: 20 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '7267EF' }
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFF' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    this.filteredRevendeurs.forEach(revendeur => {
      worksheet.addRow({
        nom: revendeur.nom || '-',
        telephone: revendeur.Telephone || '-',
        email: revendeur.email || '-',
        responsable: revendeur.responsable || '-',
        mf: revendeur.MF || '-'
      });
    });

    for (let i = 2; i <= this.filteredRevendeurs.length + 1; i++) {
      const row = worksheet.getRow(i);
      if (i % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F0F0FA' }
          };
        });
      }
    }

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const today = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
      saveAs(blob, `liste_revendeurs_${today}.xlsx`);
      this.message.success('Excel exporté avec succès');
    });
  }
} 