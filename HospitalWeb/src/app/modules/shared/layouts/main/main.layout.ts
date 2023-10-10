import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { SessionApi } from '@api/session/session.api';
import { UserApi } from '@api/user/user.api';
import { User } from '@api/user/user.model';
import { MessageType } from '@services/http/http.types';
import { Store } from '@store';
import { UserRole } from '@utils/enums';
import { firstValueFrom, fromEvent, Observable } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.layout.html',
  styleUrls: ['./main.layout.css']
})
export class MainLayout implements OnInit {
  @ViewChild('menu')
  private menuRef: ElementRef;

  @ViewChild('menuButton')
  private menuButtonRef: ElementRef;

  public menuOpen: boolean;
  public accountMenuOpen: boolean;
  public siteTitle$: Observable<string>;
  public user$: Observable<User>;
  
  constructor(
    private sessionApi: SessionApi,
    private userApi: UserApi,
    private store: Store
  ) {
    this.menuOpen = false;
    this.accountMenuOpen = false;
  }

  public ngOnInit(): void {
    //Utilizamos los subjects de state management como observables
    //para aprovecha los "async pipes" y tener beneficios
    //como la auto-desuscripción de observables al destruir
    //el componente sin tener que hacer manualmente
    //Más info: https://medium.com/angular-in-depth/angular-question-rxjs-subscribe-vs-async-pipe-in-component-templates-c956c8c0c794
    this.siteTitle$ = this.store.siteTitle$;
    this.user$ = this.store.user$;
    this.userApi.load();

    //Si se hace click en cualquier lugar del body
    //el menu se cierra con la excepción de dos elementos
    //que queremos ignorar para su propio funcionamiento
    fromEvent(document.body, 'click', { capture: true })
      .subscribe((e: any) => {
        if(e.target != this.menuButtonRef.nativeElement && e.target.parentElement != this.menuRef.nativeElement) {
          this.accountMenuOpen = false;
        }
      });
  }

  //El evento para abrir o cerrar cancela el event bubbling para evitar
  //que el host listener de body vuelva cerrar el menú
  public toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  public toggleAccountMenu(): void {
    this.accountMenuOpen = !this.accountMenuOpen;
  }

  public handleMenuNavigate(): void {
    this.menuOpen = false;
  }

  public async logout(): Promise<void> {
    this.store.siteMessage = { type: MessageType.Info, text: 'Saliendo del sistema...' };

    const response = await firstValueFrom(this.sessionApi.logout());
    if(response.success) {
      this.store.closeSession();
    }
  }

  public isAdmin(user: User): boolean {
    return user?.isSuperAdmin || user?.hasRoles([UserRole.Administrator]);
  }
}
