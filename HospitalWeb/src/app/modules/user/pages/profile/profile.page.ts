import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageType, QueryParams } from '@services/http/http.types';
import { User } from '@api/user/user.model';
import { UpdateSelfUserDTO } from '@api/user/user.dto';
import { UserApi } from '@api/user/user.api';
import { ButtonType, InputType } from '@shared/components/form-field/form-field.types';
import { Store } from '@store';
import { Subject, firstValueFrom, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
})
export class ProfilePage implements OnInit, OnDestroy {
  public get passwordConfirmed(): boolean {
    return this.password == this.confirmPassword;
  }

  public user: User;
  public password: string;
  public confirmPassword: string;
  public saving: boolean;
  public messages: string[];

  public InputType = InputType;
  public ButtonType = ButtonType;

  private unsubscribe: Subject<void>;

  constructor(
      private store: Store,
      private userApi: UserApi,
  ) { 
    this.user = null;
    this.password = '';
    this.confirmPassword = '';
    this.saving = false;
    this.messages = [];
    this.unsubscribe = new Subject();
  }

  public ngOnInit(): void {
    this.store.user$
      .pipe(
        takeUntil(this.unsubscribe)
      )
      .subscribe((user) => {
        this.user = new User(user);
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public async saveUser(): Promise<void> {
    if(!this.saving) {
      this.saving = true;
      
      const response = await firstValueFrom(this.userApi.updateSelf(this.user, this.password));
      this.messages = [];

      if(response.success){
        this.store.siteMessage = { type: MessageType.Success, text: response.messages[0] };
        this.store.user = response.data;
        this.password = '';
        this.confirmPassword = '';
      }else {
        this.messages = response.messages;
      }

      this.saving = false;
    }
  }
}
