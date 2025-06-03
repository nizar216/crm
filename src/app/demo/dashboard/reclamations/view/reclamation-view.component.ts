import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ReclamationService } from 'src/app/core/services/reclamation.service';

@Component({
  selector: 'app-reclamation-view',
  templateUrl: './reclamation-view.component.html',
  styleUrls: ['./reclamation-view.component.scss'],
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzTableModule, NzTagModule, NzCardModule, NzSpinModule, NzDividerModule, NzTypographyModule]
})
export class ReclamationViewComponent implements OnInit {
  reclamation: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private reclamationService: ReclamationService,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reclamationService.getReclamationById(+id).subscribe({
        next: (data) => {
          this.reclamation = data;
          console.log(this.reclamation)
          this.isLoading = false;
        },
        error: () => {
          this.message.error('Erreur lors du chargement de la réclamation');
          this.isLoading = false;
        }
      });
    } else {
      this.message.error('ID de réclamation manquant');
      this.router.navigate(['/dashboard/reclamations']);
    }
  }

  cancel() {
    this.router.navigate(['/dashboard/reclamations']);
  }

  editReclamation() {
    // TODO: Implement edit navigation or logic
    console.log('editReclamation called');
  }
}
