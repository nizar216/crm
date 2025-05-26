// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project import
import { AdminComponent } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard/default',
        pathMatch: 'full'
      },
      {
        path: 'dashboard/default',
        loadComponent: () => import('./demo/dashboard/default/default.component').then((c) => c.DefaultComponent)
      },
      {
        path: 'typography',
        loadComponent: () => import('./demo/component/basic-component/color/color.component').then((c) => c.ColorComponent)
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/component/basic-component/typography/typography.component').then((c) => c.TypographyComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      {
        path: 'dashboard/clients',
        loadComponent: () => import('./demo/dashboard/clients/list/client-list.component').then((c) => c.ClientListComponent)
      },
      {
        path: 'dashboard/clients/create',
        loadComponent: () => import('./demo/dashboard/clients/create/client-create.component').then((c) => c.ClientCreateComponent)
      },
      {
        path: 'dashboard/clients/edit/:id',
        loadComponent: () => import('./demo/dashboard/clients/edit/client-edit.component').then((c) => c.ClientEditComponent)
      },
      {
        path: 'dashboard/articles',
        loadComponent: () => import('./demo/dashboard/articles/list/article-list.component').then((c) => c.ArticleListComponent)
      },
      {
        path: 'dashboard/articles/create',
        loadComponent: () => import('./demo/dashboard/articles/create/article-create.component').then((c) => c.ArticleCreateComponent)
      },
      {
        path: 'dashboard/articles/edit/:id',
        loadComponent: () => import('./demo/dashboard/articles/edit/article-edit.component').then((c) => c.ArticleEditComponent)
      },
      {
        path: 'dashboard/services',
        loadComponent: () => import('./demo/dashboard/services/list/service-list.component').then((c) => c.ServiceListComponent)
      },
      {
        path: 'dashboard/services/create',
        loadComponent: () => import('./demo/dashboard/services/create/service-create.component').then((c) => c.ServiceCreateComponent)
      },
      {
        path: 'dashboard/services/edit/:id',
        loadComponent: () => import('./demo/dashboard/services/edit/service-edit.component').then((c) => c.ServiceEditComponent)
      },
      {
        path: 'dashboard/revendeurs',
        loadComponent: () => import('./demo/dashboard/revendeurs/list/revendeur-list.component').then((c) => c.RevendeurListComponent)
      },
      {
        path: 'dashboard/revendeurs/create',
        loadComponent: () => import('./demo/dashboard/revendeurs/create/revendeur-create.component').then((c) => c.RevendeurCreateComponent)
      },
      {
        path: 'dashboard/revendeurs/edit/:id',
        loadComponent: () => import('./demo/dashboard/revendeurs/edit/revendeur-edit.component').then((c) => c.RevendeurEditComponent)
      },
      {
        path: 'dashboard/techniciens',
        loadComponent: () => import('./demo/dashboard/techniciens/list/technicien-list.component').then((c) => c.TechnicienListComponent)
      },
      {
        path: 'dashboard/techniciens/create',
        loadComponent: () => import('./demo/dashboard/techniciens/create/technicien-create.component').then((c) => c.TechnicienCreateComponent)
      },
      {
        path: 'dashboard/techniciens/edit/:id',
        loadComponent: () => import('./demo/dashboard/techniciens/edit/technicien-edit.component').then((c) => c.TechnicienEditComponent)
      },
      {
        path: 'dashboard/reclamations',
        loadComponent: () => import('./demo/dashboard/reclamations/list/reclamation-list.component').then((c) => c.ReclamationListComponent)
      },
      {
        path: 'dashboard/reclamations/create',
        loadComponent: () => import('./demo/dashboard/reclamations/create/reclamation-create.component').then((c) => c.ReclamationCreateComponent)
      },
      {
        path: 'dashboard/reclamations/edit/:id',
        loadComponent: () => import('./demo/dashboard/reclamations/edit/reclamation-edit.component').then((c) => c.ReclamationEditComponent)
      }
    ]
  },
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./demo/pages/authentication/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
