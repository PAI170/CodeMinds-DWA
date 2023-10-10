import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '@shared/shared.module';
import { SessionsPage } from './pages/sessions/sessions.page';
import { ProfilePage } from './pages/profile/profile.page';


@NgModule({
  declarations: [
    SessionsPage,
    ProfilePage
  ],
  imports: [
    SharedModule,
    CommonModule,
    UserRoutingModule
  ]
})
export class UserModule { }
