import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReclamationService, Reclamation } from 'src/app/core/services/reclamation.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';

// PDF and Excel export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-reclamation-list',
    templateUrl: './reclamation-list.component.html',
    styleUrls: ['./reclamation-list.component.scss'],
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
        NzTagModule,
        NzModalModule
    ]
})
export class ReclamationListComponent implements OnInit {
    reclamations: Reclamation[] = [];
    searchTerm = '';
    isLoading = false;

    // Pagination
    currentPage = 1;
    pageSize = 10;
    pageSizeOptions = [5, 10, 20, 50];

    // Modal
    showDeleteModal = false;
    reclamationToDelete: any = null;

    constructor(
        private reclamationService: ReclamationService,
        private router: Router,
        private message: NzMessageService
    ) { }

    ngOnInit() {
        this.loadReclamations();
    }

    loadReclamations() {
        this.isLoading = true;
        this.reclamationService.getReclamations().subscribe({
            next: (data) => {
                this.reclamations = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching reclamations:', err);
                this.isLoading = false;
                this.message.error('Erreur lors du chargement des réclamations');
            }
        });
    }

    createReclamation() {
        this.router.navigate(['/dashboard/reclamations/create']);
    }

    editReclamation(idReclamation: number) {
        this.router.navigate(['/dashboard/reclamations/edit', idReclamation]);
    }

    openDeleteModal(idReclamation: number) {
        this.reclamationToDelete = idReclamation;
        this.showDeleteModal = true;
    }

    closeDeleteModal() {
        this.showDeleteModal = false;
        this.reclamationToDelete = null;
    }

    confirmDelete() {
        if (this.reclamationToDelete) {
            this.reclamationService.deleteReclamation(this.reclamationToDelete).subscribe({
                next: () => {
                    this.loadReclamations();
                    this.closeDeleteModal();
                    this.message.success('Réclamation supprimée avec succès');
                },
                error: (err) => {
                    console.error('Error deleting reclamation:', err);
                    this.message.error('Erreur lors de la suppression de la réclamation');
                    this.closeDeleteModal();
                }
            });
        }
    }

    get filteredReclamations() {
        return this.reclamations.filter(reclamation =>
            reclamation.Client?.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            reclamation.status.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            reclamation.typeIntervention?.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    getStatusColor(status: string): string {
        const statusColors: { [key: string]: string } = {
            'planifiée': 'blue',
            'non planifiée': 'orange',
            'en attente': 'gold',
            'clôturée': 'green',
            'fermée': 'red',
            'facturée': 'purple'
        };
        return statusColors[status] || 'default';
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
            title: `Liste des Réclamations - ${dateStr}`,
            author: 'Système de Gestion',
            subject: 'Liste des Réclamations',
            keywords: 'réclamations, liste, rapport',
            creator: 'Application Web'
        });

        doc.setFontSize(18);
        doc.text('Liste des Réclamations', 105, 15, { align: 'center' });

        doc.setFontSize(11);
        doc.text(`Date: ${dateStr}`, 105, 22, { align: 'center' });

        const columns = [
            { header: 'Client', dataKey: 'client' },
            { header: 'Status', dataKey: 'status' },
            { header: 'Date Saisie', dataKey: 'dateSaisie' },
            { header: 'Type Intervention', dataKey: 'typeIntervention' },
            { header: 'Prix Total', dataKey: 'prixTotal' }
        ];

        const data = this.filteredReclamations.map(reclamation => ({
            client: reclamation.Client?.nom || '-',
            status: reclamation.status,
            dateSaisie: reclamation.dateSaisie ? new Date(reclamation.dateSaisie).toLocaleDateString() : '-',
            typeIntervention: reclamation.typeIntervention || '-',
            prixTotal: reclamation.prixTotal
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

        doc.save(`liste_reclamations_${dateStr.replace(/\//g, '-')}.pdf`);
        this.message.success('PDF exporté avec succès');
    }

    // Export to Excel
    exportToExcel() {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Liste des Réclamations');

        worksheet.columns = [
            { header: 'Client', key: 'client', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Date Saisie', key: 'dateSaisie', width: 15 },
            { header: 'Date RDV', key: 'dateRDV', width: 15 },
            { header: 'Type Intervention', key: 'typeIntervention', width: 20 },
            { header: 'Prix Total', key: 'prixTotal', width: 15 },
            { header: 'Remise', key: 'remise', width: 15 },
            { header: 'Prix Final', key: 'prixFinal', width: 15 }
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

        this.filteredReclamations.forEach(reclamation => {
            worksheet.addRow({
                client: reclamation.Client?.nom || '',
                status: reclamation.status,
                dateSaisie: reclamation.dateSaisie ? new Date(reclamation.dateSaisie).toLocaleDateString() : '',
                dateRDV: reclamation.dateDeRandezVous ? new Date(reclamation.dateDeRandezVous).toLocaleDateString() : '',
                typeIntervention: reclamation.typeIntervention || '',
                prixTotal: reclamation.prixTotal,
                remise: reclamation.remiseTotale,
                prixFinal: reclamation.prixFinal
            });
        });

        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `liste_reclamations_${new Date().toISOString().split('T')[0]}.xlsx`);
            this.message.success('Excel exporté avec succès');
        });
    }
} 