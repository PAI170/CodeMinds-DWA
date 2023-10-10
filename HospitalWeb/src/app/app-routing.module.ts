import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayout } from '@shared/layouts/main/main.layout';
import { AuthGuard } from '@guards/auth/auth.guard';
import { LoginPage } from './login/login.page';
import { LoginGuard } from '@guards/login/login.guard';
import { UserRole } from '@utils/enums';
import { ForbiddenPage } from './error/forbidden/forbidden.page';

const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('@appointments/appointments.module').then((m) => m.AppointmentsModule),
      },
      {
        path: 'admin',
        data: { roles: [UserRole.Administrator] },
        loadChildren: () => import('@administration/administration.module').then((m) => m.AdministrationModule),
      },
      {
        path: 'user',
        loadChildren: () => import('@user/user.module').then((m) => m.UserModule)
      },
      {
        path: 'error',
        children: [
          {
            path: 'forbidden',
            component: ForbiddenPage
          }
        ]
      }
    ]
  },
  {
    path: 'login',
    canActivate: [LoginGuard],
    component: LoginPage
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
