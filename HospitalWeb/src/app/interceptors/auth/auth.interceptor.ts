import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpStatusCode
} from '@angular/common/http';
import { catchError, finalize, Observable, Subject, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Store } from '@store';
import { RequestHeaders, ResponseHeaders, StorageKeys } from '@utils/constants';
import { SessionApi } from '@api/session/session.api';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private _refreshingToken: Subject<boolean>;

  constructor(
    private store: Store,
    private sessionApi: SessionApi
  ) {
    this._refreshingToken = null;
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if(request.url.startsWith(environment.apiURL)) {
      return next.handle(request).pipe(
        catchError((error) => {
          if(error instanceof HttpErrorResponse && error.status == HttpStatusCode.Unauthorized) {
            if(error.headers.has(ResponseHeaders.ACCESS_TOKEN_EXPIRED)) {
              if(this._refreshingToken == null) {
                this._refreshingToken = new Subject();
                return this.refreshSession(request, next);
              }
              
              return this.waitForRefresh(request, next);
            }

            this.store.closeSession();
          }

          throw error;  
        })
      );   
    }  

    return next.handle(request);
  }

  private refreshSession(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.sessionApi.refresh().pipe(
      switchMap((response) => {
        if(response.success) {
          localStorage.setItem(StorageKeys.ACCESS_TOKEN, response.data.accessToken);
          localStorage.setItem(StorageKeys.REFRESH_TOKEN, response.data.refreshToken);

          this._refreshingToken.next(true);
          return this.retryRequest(request, next);
        }

        this._refreshingToken.next(false);
        this.store.closeSession();
        throw new Error('Sesión falló al refrescar');
      }),
      finalize(() => {
        this._refreshingToken.complete();
        this._refreshingToken = null;
      })
    );
  }

  private waitForRefresh(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this._refreshingToken.pipe(
      switchMap((success) => {
        if(success) {
          return this.retryRequest(request, next);
        }

        throw new Error(`${request.url} cancelado`);
      })
    );
  }

  private retryRequest(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const updatedRequest = request.clone({
      headers: request.headers.set(RequestHeaders.AUTHORIZATION, `Bearer ${localStorage.getItem(StorageKeys.ACCESS_TOKEN)}`)
    });

    return next.handle(updatedRequest);
  }
}
