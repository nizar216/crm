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
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { DevisService, Devis } from 'src/app/core/services/devis.service';

@Component({
  selector: 'app-devis-list',
  templateUrl: './devis-list.component.html',
  styleUrls: ['./devis-list.component.scss'],
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
    NzModalModule,
    NzSpinModule
  ]
})
export class DevisListComponent implements OnInit {
  devis: Devis[] = [];
  searchTerm = '';
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  showDeleteModal = false;
  devisToDelete: any = null;

  constructor(
    private router: Router,
    private message: NzMessageService,
    private devisService: DevisService
  ) { }

  ngOnInit() {
    this.loadDevis();
  }

  loadDevis() {
    this.isLoading = true;
    this.devisService.getAllDevis().subscribe({
      next: (data) => {
        this.devis = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.message.error('Erreur lors du chargement des devis');
      }
    });
  }

  createDevis() {
    this.router.navigate(['/dashboard/devis/create']);
  }

  editDevis(idDevis: any) {
    this.router.navigate(['/dashboard/devis/edit', idDevis]);
  }

  openDeleteModal(idDevis: any) {
    this.devisToDelete = idDevis;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.devisToDelete = null;
  }

  confirmDelete() {
    if (this.devisToDelete) {
      this.devisService.deleteDevis(this.devisToDelete).subscribe({
        next: () => {
          this.loadDevis();
          this.closeDeleteModal();
        },
        error: (err) => {
          this.message.error('Erreur lors de la suppression du devis');
          this.closeDeleteModal();
        }
      });
    }
  }

  get filteredDevis() {
    const term = this.searchTerm.toLowerCase();
    return this.devis.filter(d =>
      Object.values(d).some(value =>
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