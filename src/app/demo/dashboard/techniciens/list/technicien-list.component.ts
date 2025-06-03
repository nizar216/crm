import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TechnicienService, Technicien } from 'src/app/core/services/technicien.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

// PDF and Excel export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-technicien-list',
  templateUrl: './technicien-list.component.html',
  styleUrls: ['./technicien-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    NzPaginationModule,
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzMessageModule,
    NzToolTipModule,
    NzModalModule
  ]
})
export class TechnicienListComponent implements OnInit {
  techniciens: Technicien[] = [];
  searchTerm = '';
  isLoading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  // Modal state for delete confirmation
  showDeleteModal = false;
  technicienToDelete: any = null;

  constructor(
    private technicienService: TechnicienService,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService
  ) { }

  ngOnInit() {
    this.loadTechniciens();
  }

  loadTechniciens() {
    this.isLoading = true;
    this.technicienService.getAllTechniciens().subscribe({
      next: (data) => {
        this.techniciens = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching techniciens:', err);
        this.isLoading = false;
      }
    });
  }

  createTechnicien() {
    this.router.navigate(['/dashboard/techniciens/create']);
  }

  editTechnicien(idTechnicien: any) {
    this.router.navigate(['/dashboard/techniciens/edit', idTechnicien]);
  }

  // Open the delete confirmation modal
  openDeleteModal(idTechnicien: any) {
    this.technicienToDelete = idTechnicien;
    this.showDeleteModal = true;
  }

  // Close the delete confirmation modal
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.technicienToDelete = null;
  }

  // Confirm deletion and delete the technicien
  confirmDelete() {
    if (this.technicienToDelete) {
      this.technicienService.deleteTechnicien(this.technicienToDelete).subscribe({
        next: () => {
          this.loadTechniciens();
          this.closeDeleteModal();
          this.message.success('Technicien supprimé avec succès');
        },
        error: (err) => {
          console.error('Error deleting technicien:', err);
          this.closeDeleteModal();
          this.message.error('Erreur lors de la suppression du technicien');
        }
      });
    }
  }

  get filteredTechniciens() {
    if (!this.searchTerm) return this.techniciens;
    const term = this.searchTerm.toLowerCase();
    return this.techniciens.filter(technicien =>
      Object.values(technicien).some(value =>
        value && value.toString().toLowerCase().includes(term)
      )
    );
  }

  // Handle page index change for the table
  changePage(page: number) {
    this.currentPage = page;
  }

  // Handle page size change for the table
  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  // Export to PDF
  exportToPdf() {
    const doc = new jsPDF();
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR');

    doc.setProperties({
      title: `Liste des Techniciens - ${dateStr}`,
      author: 'Système de Gestion',
      subject: 'Liste des Techniciens',
      keywords: 'techniciens, liste, rapport',
      creator: 'Application Web'
    });

    doc.setFontSize(18);
    doc.text('Liste des Techniciens', 105, 15, { align: 'center' });

    doc.setFontSize(11);
    doc.text(`Date: ${dateStr}`, 105, 22, { align: 'center' });

    const columns = [
      { header: 'Nom', dataKey: 'nom' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Téléphone', dataKey: 'Telephone' },
      { header: 'Société', dataKey: 'nomSociete' },
      { header: 'Matricule Fiscal', dataKey: 'MF' },
      { header: 'Adresse', dataKey: 'adresse' }
    ];

    const data = this.filteredTechniciens.map(technicien => ({
      nom: technicien.nom,
      email: technicien.email,
      Telephone: technicien.Telephone,
      nomSociete: technicien.nomSociete,
      MF: technicien.MF,
      adresse: technicien.adresse
    }));

    autoTable(doc, {
      columns: columns,
      body: data,
      startY: 30,
      headStyles: {
        fillColor: [114, 103, 239],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 250]
      },
      margin: { top: 30 },
      styles: {
        fontSize: 10,
        cellPadding: 3
      }
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} de ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`liste_techniciens_${dateStr.replace(/\//g, '-')}.pdf`);
    this.modal.info({
      nzTitle: 'Export PDF',
      nzContent: 'Le PDF a été exporté avec succès.',
      nzOkText: 'OK',
      nzCentered: true,
      nzClassName: 'modern-modal'
    });
  }

  // Export to Excel
  exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Liste des Techniciens');

    worksheet.columns = [
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Téléphone', key: 'Telephone', width: 15 },
      { header: 'Société', key: 'nomSociete', width: 25 },
      { header: 'Matricule Fiscal', key: 'MF', width: 15 },
      { header: 'Adresse', key: 'adresse', width: 35 }
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

    this.filteredTechniciens.forEach(technicien => {
      worksheet.addRow({
        nom: technicien.nom,
        email: technicien.email,
        Telephone: technicien.Telephone,
        nomSociete: technicien.nomSociete,
        MF: technicien.MF,
        adresse: technicien.adresse
      });
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `liste_techniciens_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.xlsx`);
      this.message.success('Excel exporté avec succès');
    });
  }
}
