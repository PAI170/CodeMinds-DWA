import { Component, OnInit } from '@angular/core';
import { RoleApi } from '@api/role/role.api';
import { Role } from '@api/role/role.model';
import { UserApi } from '@api/user/user.api';
import { FilterUserDTO } from '@api/user/user.dto';
import { User } from '@api/user/user.model';
import { MessageType, QueryParams } from '@services/http/http.types';
import { ButtonType, InputType } from '@shared/components/form-field/form-field.types';
import { ModalPosition, ModalSize } from '@shared/components/modal/modal.types';
import { Store } from '@store';
import { UserRole } from '@utils/enums';
import { firstValueFrom, Observable } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html'
})
export class UsersPage implements OnInit {
  public get modalTitle() {
    return this.user?.id ?  'Editar Usuario' : 'Nuevo Usuario';
  }

  public get confirmDelete(): boolean {
    return this.deleteId != null;
  }

  public get passwordConfirmed(): boolean {
    return this.password == this.confirmPassword;
  }

  public users: User[];
  public roles: Role[];
  public modalOpen: boolean;
  public panelOpen: boolean;
  public user: User;
  public password: string;
  public confirmPassword: string;
  public loading: boolean;
  public saving: boolean;
  public filter: QueryParams;
  public deleteId: number;
  public messages: string[];
  public user$: Observable<User>;

  public InputType = InputType;
  public ModalSize = ModalSize;
  public ModalPosition = ModalPosition;
  public ButtonType = ButtonType;
  public UserRole = UserRole;

  constructor(
    private userApi: UserApi,
    private roleApi: RoleApi,
    private store: Store
  ) { 
    this.users = [];
    this.roles = [];
    this.modalOpen = false;
    this.panelOpen = false;
    this.password = '';
    this.confirmPassword = '';
    this.loading = false;
    this.saving = false;
    this.messages = [];
    this.filter = new FilterUserDTO();
  }

  ngOnInit(): void {
    this.user$ = this.store.user$;
    this.loadRoles();
    this.list();
  }

  public async loadRoles(): Promise<void> {
    const response = await firstValueFrom(this.roleApi.list());
    if(response.success) {
      this.roles = response.data;
    }
  }

  public async list(): Promise<void> {
    if(!this.loading) {
      this.loading = true;

      const response = await firstValueFrom(this.userApi.list(this.filter));
      if(response.success) {
        this.users = response.data;
      }

      this.loading = false;
    }
  }

  public insertUpdate(data: unknown = null): void {
    this.user = new User(data);
    this.modalOpen = true;
  }

  public async saveUser(): Promise<void> {
    if(!this.saving) {
      this.saving = true;

      const isNew = this.user.id == null;
      const response = await firstValueFrom(isNew ? this.userApi.insert(this.user, this.password) : this.userApi.update(this.user, this.password));
      this.messages = [];

      if(response.success) {
        this.panelOpen = true;
        this.filter = new FilterUserDTO({ 
          email: response.data.email 
        });

        this.modalOpen = false;
        this.store.siteMessage = { type: MessageType.Success, text: response.messages[0] };
        this.list();
      }else {
        this.messages = response.messages;
      }

      this.saving = false;
    }
  }

  public async deleteUser(): Promise<void> {
    if(!this.saving) {
      this.saving = true;

      const response = await firstValueFrom(this.userApi.delete(this.deleteId));
      if(response.success) {
        this.store.siteMessage = { type: MessageType.Success, text: response.messages[0] };
        this.list();
      }else if(response.messages.length > 0) {
        this.store.siteMessage = { type: MessageType.Warning, text: response.messages[0] };
      }

      this.saving = false;
      this.deleteId = null;
    }
  }

  public onModalClose(): void {
    this.user = null;
    this.password = '';
    this.confirmPassword = '';
    this.messages = [];
  }

  public canEdit(user: User, currentUser: User): boolean {
    return currentUser.isSuperAdmin || !user.hasRoles([UserRole.Administrator]);
  }
}
