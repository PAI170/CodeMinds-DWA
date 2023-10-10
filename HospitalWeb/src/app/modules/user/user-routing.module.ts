import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SessionsPage } from './pages/sessions/sessions.page';
import { ProfilePage } from './pages/profile/profile.page';

const routes: Routes = [
  {
    path: 'sessions',
    component: SessionsPage,
    data: { title: 'Sesiones' }
  },

  {
    path: 'profile',
    component: ProfilePage,
    data: { title: 'Perfil' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
