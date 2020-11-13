import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ISecret, ISecretMetadata} from './secret';

@Injectable({
  providedIn: 'root'
})
export class SecretsService {

  constructor(private http: HttpClient) { }

  createSecret(content: string, expirationDate: Date, accessLimit: number): Observable<ISecretMetadata> {
    const expiration = (Math.floor(expirationDate.getTime() / 1000)); // epoch in seconds
    return this.http.post<ISecretMetadata>(`api/v1/secrets`, {
      content,
      expiration_epoch: expiration,
      access_limit: accessLimit,
    });
  }

  accessSecret(secretId: string): Observable<ISecret> {
    return this.http.post<ISecret>(`api/v1/secrets/${secretId}/access`, {});
  }

  getSecretMetadata(secretId: string): Observable<ISecretMetadata> {
    return this.http.get<ISecretMetadata>(`api/v1/secrets/${secretId}`);
  }

  deleteSecret(secretId: string): Observable<any> {
    return this.http.delete(`api/v1/secrets/${secretId}`);
  }
}
