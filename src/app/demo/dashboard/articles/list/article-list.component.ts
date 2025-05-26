import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticleService, Article } from 'src/app/core/services/article.service';
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
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardComponent,
    NzPaginationModule, NzTableModule, NzDividerModule,
    NzButtonModule, NzIconModule, NzInputModule,
    NzMessageModule, NzToolTipModule
  ]
})
export class ArticleListComponent implements OnInit {
  articles: Article[] = [];
  searchTerm = '';
  isLoading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  // Modal
  showDeleteModal = false;
  articleToDelete: any = null;

  constructor(
    private articleService: ArticleService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.isLoading = true;
    this.articleService.getAllArticles().subscribe({
      next: (data) => {
        this.articles = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching articles:', err);
        this.isLoading = false;
      }
    });
  }

  createArticle() {
    this.router.navigate(['/dashboard/articles/create']);
  }

  editArticle(idArticle: any) {
    this.router.navigate(['/dashboard/articles/edit', idArticle]);
  }

  openDeleteModal(idArticle: any) {
    this.articleToDelete = idArticle;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.articleToDelete = null;
  }

  confirmDelete() {
    if (this.articleToDelete) {
      this.articleService.deleteArticle(this.articleToDelete).subscribe({
        next: () => {
          this.loadArticles();
          this.closeDeleteModal();
          this.message.success('Article supprimé avec succès');
        },
        error: (err) => {
          console.error('Error deleting article:', err);
          this.closeDeleteModal();
        }
      });
    }
  }

  get filteredArticles() {
    return this.articles.filter(article =>
      (article.libelle && article.libelle.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
      (article.model && article.model.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
      (article.marque && article.marque.toLowerCase().includes(this.searchTerm.toLowerCase()))
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
    doc.text('Liste des Articles', 105, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Date: ${dateStr}`, 105, 22, { align: 'center' });

    const columns = [
      { header: 'Désignation', dataKey: 'designation' },
      { header: 'Référence', dataKey: 'reference' },
      { header: 'Prix', dataKey: 'prix' },
      { header: 'Quantité', dataKey: 'quantite' }
    ];

    const data = this.filteredArticles.map(article => ({
      designation: article.designation,
      reference: article.reference || '-',
      prix: article.prix || '-',
      quantite: article.quantite || '-'
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

    doc.save(`liste_articles_${dateStr.replace(/\//g, '-')}.pdf`);
    this.message.success('PDF exporté avec succès');
  }

  exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Articles');

    worksheet.columns = [
      { header: 'Désignation', key: 'designation', width: 25 },
      { header: 'Référence', key: 'reference', width: 20 },
      { header: 'Prix', key: 'prix', width: 15 },
      { header: 'Quantité', key: 'quantite', width: 15 }
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

    this.filteredArticles.forEach(article => {
      worksheet.addRow({
        designation: article.designation || '-',
        reference: article.reference || '',
        prix: article.prix || '',
        quantite: article.quantite || ''
      });
    });

    for (let i = 2; i <= this.filteredArticles.length + 1; i++) {
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
      saveAs(blob, `liste_articles_${today}.xlsx`);
      this.message.success('Excel exporté avec succès');
    });
  }

  printPdf() {
    const doc = new jsPDF();
    const today = new Date();
    doc.setFontSize(18);
    doc.text('Liste des Articles', 105, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Date: ${today.toLocaleDateString('fr-FR')}`, 105, 22, { align: 'center' });

    const columns = [
      { header: 'Désignation', dataKey: 'designation' },
      { header: 'Référence', dataKey: 'reference' },
      { header: 'Prix', dataKey: 'prix' },
      { header: 'Quantité', dataKey: 'quantite' }
    ];

    const data = this.filteredArticles.map(article => ({
      designation: article.designation,
      reference: article.reference || '-',
      prix: article.prix || '-',
      quantite: article.quantite || '-'
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

    window.open(doc.output('bloburl'));
  }
}
