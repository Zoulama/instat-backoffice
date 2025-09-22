import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TemplateListComponent } from './features/templates/template-list.component';
import { FormGeneratorComponent } from './features/templates/form-generator.component';
import { BackendSchemasComponent } from './features/admin/backend-schemas.component';
import { FrontendSchemasComponent } from './features/schemas/frontend-schemas.component';
import { SurveyCreateComponent } from './features/surveys/survey-create.component';
import { SurveySearchComponent } from './features/surveys/survey-search.component';
import { SurveyManagerComponent } from './features/surveys/survey-manager.component';

export const routes: Routes = [
  {
    path: 'auth/login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'templates',
        component: TemplateListComponent
      },
      {
        path: 'templates/form-generator',
        component: FormGeneratorComponent
      },
      {
        path: 'templates/form-generator/:id',
        component: FormGeneratorComponent
      },
      {
        path: 'surveys',
        loadComponent: () => import('./features/surveys/survey-list.component').then(m => m.SurveyListComponent)
      },
      {
        path: 'surveys/upload',
        loadComponent: () => import('./features/surveys/survey-upload.component').then(m => m.SurveyUploadComponent)
      },
      {
        path: 'surveys/create',
        component: SurveyCreateComponent
      },
      {
        path: 'surveys/search',
        component: SurveySearchComponent
      },
      {
        path: 'surveys/manager',
        component: SurveyManagerComponent
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'admin/backend-schemas',
        component: BackendSchemasComponent,
        // canActivate: [adminGuard] // Could add specific admin guard
      },
      {
        path: 'schemas',
        component: FrontendSchemasComponent,
        // canActivate: [managerOrAdminGuard] // Could add specific role guard
      },
      {
        path: 'forms/diag',
        loadComponent: () => import('./features/forms/diag-form.component').then(m => m.DiagFormComponent)
      },
      {
        path: 'forms/bilan',
        loadComponent: () => import('./features/forms/bilan-form.component').then(m => m.BilanFormComponent)
      },
      {
        path: 'forms/prog',
        loadComponent: () => import('./features/forms/prog-form.component').then(m => m.ProgFormComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
