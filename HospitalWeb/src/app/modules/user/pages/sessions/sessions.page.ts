import { Component, OnInit } from '@angular/core';
import { SessionApi } from '@api/session/session.api';
import { FilterSessionDTO } from '@api/session/session.dto';
import { Session } from '@api/session/session.model';
import { MessageType, QueryParams } from '@services/http/http.types';
import { firstValueFrom } from 'rxjs';
import { ButtonType, DateType, InputType } from '@shared/components/form-field/form-field.types';
import { ModalPosition } from '@shared/components/modal/modal.types';
import { Store } from '@store';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.page.html'
})
export class SessionsPage implements OnInit {
  public get confirmDelete(): boolean {
    return this.deleteId != null;
  }

  public sessions: Session[]; 
  public currentSession: string;
  public filter: QueryParams;
  public loading: boolean;
  public saving: boolean;
  public deleteId: string;

  public InputType = InputType;
  public DateType = DateType;
  public ButtonType = ButtonType;
  public ModalPosition = ModalPosition;

  constructor(
    private sessionApi: SessionApi,
    private store: Store
  ) {
    this.sessions = [];
    this.filter = new FilterSessionDTO();
    this.loading = false;
    this.saving = false;
    this.deleteId = null;
  }

  public ngOnInit(): void {
    this.currentSession = this.store.currentSession;
    this.list();
  }

  public async list(): Promise<void> {
    if(!this.loading) {
      this.loading = true;

      const response = await firstValueFrom(this.sessionApi.list(this.filter));
      if(response.success) {
        const currentSessionIndex = response.data.findIndex((session) => session.sessionId == this.currentSession);
        const currentSession = response.data.splice(currentSessionIndex, 1);
        this.sessions = [...currentSession, ...response.data];
      }
      
      this.loading = false;
    }
  }

  public async deleteSession(): Promise<void> {
    if(!this.saving) {
      this.saving = true;

      const response = await firstValueFrom(this.sessionApi.logout(this.deleteId));
      if(response.success) {
        this.store.siteMessage = { type: MessageType.Success, text: response.messages[0] };
        this.list();
      }

      this.saving = false;
      this.deleteId = null;
    }
  }
}
