import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { FactureService } from 'src/app/core/services/facture.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-facture-list',
  templateUrl: './facture-list.component.html',
  styleUrls: ['./facture-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzPaginationModule,
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzMessageModule,
    NzToolTipModule,
    NzModalModule,
    NzSpinModule,
    CardComponent,
  ]
})
export class FactureListComponent implements OnInit {
  articleModalVisible = false;
  selectedArticle: any = null;
  factures: any[] = [];
  searchTerm = '';
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  showDeleteModal = false;
  factureToDelete: any = null;

  constructor(
    private router: Router,
    private message: NzMessageService,
    private factureService: FactureService
  ) { }

  ngOnInit() {
    this.loadFactures();
  }

  exportToPdf() {
    // TODO: Implement PDF export logic
    this.message.info('Fonctionnalité Export PDF à venir.');
  }

  exportToExcel() {
    // TODO: Implement Excel export logic
    this.message.info('Fonctionnalité Export Excel à venir.');
  }

  createFacture() {
    this.router.navigate(['/dashboard/factures/create']);
  }

  loadFactures() {
    this.isLoading = true;
    this.factureService.getAllFactures().subscribe({
      next: (data) => {
        this.factures = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.message.error('Erreur lors du chargement des factures');
      }
    });
  }

  closeArticleModal() {
    this.articleModalVisible = false;
    this.selectedArticle = null;
  }

  showFacture(idFacture: any) {
    this.router.navigate(['/dashboard/factures/view', idFacture]);
  }

  openDeleteModal(idFacture: any) {
    this.factureToDelete = idFacture;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.factureToDelete = null;
  }

  confirmDelete() {
    if (this.factureToDelete) {
      this.factureService.deleteFacture(this.factureToDelete).subscribe({
        next: () => {
          this.loadFactures();
          this.closeDeleteModal();
        },
        error: (err) => {
          this.message.error('Erreur lors de la suppression de la facture');
          this.closeDeleteModal();
        }
      });
    }
  }

  get filteredFactures() {
    const term = this.searchTerm.toLowerCase();
    return this.factures.filter(f =>
      Object.values(f).some(value =>
        String(value).toLowerCase().includes(term)
      )
    );
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }
} 