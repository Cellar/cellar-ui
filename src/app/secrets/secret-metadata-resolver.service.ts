import { Injectable } from '@angular/core';
import {SecretsService} from './secrets.service';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {EMPTY, Observable} from 'rxjs';
import {ISecretMetadata} from './secret';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SecretMetadataResolverService implements Resolve<ISecretMetadata> {

  constructor(private secretsService: SecretsService,
              private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, _: RouterStateSnapshot): Observable<ISecretMetadata> | Promise<ISecretMetadata> | ISecretMetadata {
    const secretId = route.paramMap.get('id');
    return this.secretsService.getSecretMetadata(secretId).pipe(
      catchError(err => {
        this.router.navigate(['/error', 404]);
        return EMPTY;
      })
    );
  }
}
