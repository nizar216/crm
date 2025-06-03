import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService, Client } from 'src/app/core/services/client.service';
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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, NzPaginationModule, NzTableModule, NzDividerModule, NzButtonModule, NzIconModule, NzInputModule, NzMessageModule, NzToolTipModule,NzModalModule,NzSpinModule,NzTagModule]
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  searchTerm = '';
  isLoading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  // Modal
  showDeleteModal = false;
  clientToDelete: any = null;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService
  ) { }

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.isLoading = true;
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
        this.isLoading = false;
      }
    });
  }

  createClient() {
    this.router.navigate(['/dashboard/clients/create']);
  }

  editClient(idClient: any) {
    this.router.navigate(['/dashboard/clients/edit', idClient]);
  }

  openDeleteModal(idClient: any) {
    this.clientToDelete = idClient;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.clientToDelete = null;
  }

  confirmDelete() {
    if (this.clientToDelete) {
      this.clientService.deleteClient(this.clientToDelete).subscribe({
        next: () => {
          this.loadClients();
          this.closeDeleteModal();
        },
        error: (err) => {
          console.error('Error deleting client:', err);
          this.closeDeleteModal();
        }
      });
    }
  }

  get filteredClients() {
    const term = this.searchTerm.toLowerCase();
    return this.clients.filter(client =>
      Object.values(client).some(value =>
        String(value).toLowerCase().includes(term)
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
    // Create a new jsPDF instance
    const doc = new jsPDF();
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR');

    // Set document properties
    doc.setProperties({
      title: `Liste des Clients - ${dateStr}`,
      author: 'Système de Gestion',
      subject: 'Liste des Clients',
      keywords: 'clients, liste, rapport',
      creator: 'Application Web'
    });

    // Add a title
    doc.setFontSize(18);
    doc.text('Liste des Clients', 105, 15, { align: 'center' });

    // Add date
    doc.setFontSize(11);
    doc.text(`Date: ${dateStr}`, 105, 22, { align: 'center' });

    // Column definitions
    const columns = [
      { header: 'Nom', dataKey: 'nom' },
      { header: 'Prénom', dataKey: 'prenom' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Téléphone', dataKey: 'telephone1' },
      { header: 'Personne à contacter', dataKey: 'personneAcontacter' },
      { header: 'Ville', dataKey: 'ville' }
    ];

    // Data rows
    const data = this.filteredClients.map(client => ({
      nom: client.nom,
      prenom: client.prenom || '-',
      email: client.email,
      telephone1: client.telephone1,
      personneAcontacter: client.personneAcontacter || '-',
      ville: client.ville || '-'
    }));

    // Create the table
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

    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} de ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    // Save the PDF
    doc.save(`liste_clients_${dateStr.replace(/\//g, '-')}.pdf`);

    // Show success modal
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
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Liste des Clients');

    // Add header row with styling
    worksheet.columns = [
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Téléphone', key: 'telephone1', width: 15 },
      { header: 'Téléphone 2', key: 'telephone2', width: 15 },
      { header: 'Personne à contacter', key: 'personneAcontacter', width: 25 },
      { header: 'Tél. Personne à contacter', key: 'telephonePersonneaContacter', width: 25 },
      { header: 'Matricule Fiscal', key: 'MF', width: 15 },
      { header: 'Municipalité', key: 'municipalite', width: 20 },
      { header: 'Ville', key: 'ville', width: 20 },
      { header: 'Adresse', key: 'adresse', width: 35 },
      { header: 'Pays', key: 'pays', width: 15 },
      { header: 'Zone', key: 'zone', width: 15 }
    ];

    // Style the header row
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

    // Add data rows
    this.filteredClients.forEach(client => {
      worksheet.addRow({
        nom: client.nom,
        prenom: client.prenom || '',
        email: client.email,
        telephone1: client.telephone1,
        telephone2: client.telephone2 || '',
        personneAcontacter: client.personneAcontacter || '',
        telephonePersonneaContacter: client.telephonePersonneaContacter || '',
        MF: client.MF || '',
        municipalite: client.municipalite || '',
        ville: client.ville || '',
        adresse: client.adresse || '',
        pays: client.pays || '',
        zone: client.zone || ''
      });
    });

    // Style all data rows with alternating colors
    for (let i = 2; i <= this.filteredClients.length + 1; i++) {
      const row = worksheet.getRow(i);

      // Alternate row background colors
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

    // Generate and save Excel file
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const today = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
      saveAs(blob, `liste_clients_${today}.xlsx`);

      // Show success message
      this.message.success('Excel exporté avec succès');
    });
  }

  // Print PDF directly
  printPdf() {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Add a title
    doc.setFontSize(18);
    doc.text('Liste des Clients', 105, 15, { align: 'center' });

    // Add date
    const today = new Date();
    doc.setFontSize(11);
    doc.text(`Date: ${today.toLocaleDateString('fr-FR')}`, 105, 22, { align: 'center' });

    // Column definitions - slightly fewer columns for better print fit
    const columns = [
      { header: 'Nom', dataKey: 'nom' },
      { header: 'Prénom', dataKey: 'prenom' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Téléphone', dataKey: 'telephone1' },
      { header: 'Ville', dataKey: 'ville' }
    ];

    // Data rows
    const data = this.filteredClients.map(client => ({
      nom: client.nom,
      prenom: client.prenom || '-',
      email: client.email,
      telephone1: client.telephone1,
      ville: client.ville || '-'
    }));

    // Create the table
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

    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} de ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    // Print the PDF
    doc.autoPrint();
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    // Show success message
    this.message.success('Document envoyé à l\'impression');
  }

  // Track by function for better performance
  trackByClientId(index: number, client: any): any {
    return client.idClient;
  }

  // Generate initials for avatar
  getClientInitials(nom: string, prenom?: string): string {
    if (!nom) return '?';

    const firstInitial = nom.charAt(0).toUpperCase();
    const secondInitial = prenom ? prenom.charAt(0).toUpperCase() : nom.charAt(1)?.toUpperCase() || '';

    return firstInitial + secondInitial;
  }
}
