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
    NzSpinModule
  ]
})
export class ServiceListComponent implements OnInit {
  services: Service[] = [];
  loading = false;
  totalItems = 0;
  pageSize = 10;
  pageIndex = 1;

  constructor(
    private serviceService: ServiceService,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

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

  deleteService(id: number): void {
    this.modal.confirm({
      nzTitle: 'Êtes-vous sûr de vouloir supprimer ce service ?',
      nzContent: 'Cette action est irréversible.',
      nzOkText: 'Oui',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.serviceService.deleteService(id).subscribe({
          next: () => {
            this.message.success('Service supprimé avec succès');
            this.loadServices();
          },
          error: (err) => {
            console.error('Error deleting service:', err);
            this.message.error('Erreur lors de la suppression du service');
          }
        });
      },
      nzCancelText: 'Non'
    });
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
  }
} 