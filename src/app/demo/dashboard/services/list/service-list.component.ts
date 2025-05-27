import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ServiceService } from 'src/app/core/services/service.service';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';

interface Service {
  idService: number;
  nom: string;
  prix: number;
  tva: number;
  prixTot: number;
  partTech: number;
  partEnts: number;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    NzButtonModule,
    NzTableModule,
    NzIconModule,
    NzMessageModule,
    NzModalModule,
    NzSpinModule,
    NzInputModule, 
    FormsModule
  ]
})
export class ServiceListComponent implements OnInit {
  services: Service[] = [];
  loading = false;
  totalItems = 0;
  pageSize = 10;
  pageIndex = 1;
  searchTerm = '';

  // Modal
  showDeleteModal = false;
  serviceToDelete: any = null;

  constructor(
    private serviceService: ServiceService,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService
  ) { }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.serviceService.getAllServices().subscribe({
      next: (response: any) => {
        this.services = response.services || response;
        this.totalItems = this.services.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.message.error('Erreur lors du chargement des services');
        this.loading = false;
      }
    });
  }

  createService(): void {
    this.router.navigate(['/dashboard/services/create']);
  }

  editService(id: number): void {
    this.router.navigate(['/dashboard/services/edit', id]);
  }

  openDeleteModal(idService: any) {
    this.serviceToDelete = idService;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.serviceToDelete = null;
  }

  confirmDelete() {
    if (this.serviceToDelete) {
      this.serviceService.deleteService(this.serviceToDelete).subscribe({
        next: () => {
          this.loadServices();
          this.closeDeleteModal();
          this.message.success('Service supprimé avec succès');
        },
        error: (err) => {
          console.error('Error deleting service:', err);
          this.closeDeleteModal();
        }
      });
    }
  }

  printPdf() {
    // TODO: Implement print PDF for services
    this.message.info('Fonction impression à venir');
  }

  exportToPdf() {
    // TODO: Implement export to PDF for services
    this.message.info('Export PDF à venir');
  }

  exportToExcel() {
    // TODO: Implement export to Excel for services
    this.message.info('Export Excel à venir');
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
  }

  get filteredServices() {
    return this.services.filter(service =>
      (service.nom && service.nom.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
      (service.prix && service.prix.toString().includes(this.searchTerm)) ||
      (service.tva && service.tva.toString().includes(this.searchTerm)) ||
      (service.prixTot && service.prixTot.toString().includes(this.searchTerm)) ||
      (service.partTech && service.partTech.toString().includes(this.searchTerm)) ||
      (service.partEnts && service.partEnts.toString().includes(this.searchTerm))
    );
  }
} 