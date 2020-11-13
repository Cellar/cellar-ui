import { TestBed } from '@angular/core/testing';

import { SecretMetadataResolverService } from './secret-metadata-resolver.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ISecretMetadata} from './secret';
import {Observable, of, throwError} from 'rxjs';
import {SecretsService} from './secrets.service';
import {convertToParamMap, Router} from '@angular/router';

describe('SecretMetadataResolverService', () => {
  describe('When secret is found', () => {
    let service: SecretMetadataResolverService;
    let mockSecretsService;
    let mockRouteSnapshot;
    const secretMetadata: ISecretMetadata = {
      id: '535',
      expiration: new Date(),
      access_count: 322,
      access_limit: 341,
    };

    beforeEach(() => {
      mockSecretsService = jasmine.createSpyObj(['getSecretMetadata']);
      mockSecretsService.getSecretMetadata.and.returnValue(of(secretMetadata));

      mockRouteSnapshot = {paramMap: convertToParamMap({id: secretMetadata.id})};

      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule,
          RouterTestingModule,
        ],
        providers: [
          {
            provide: SecretsService,
            useValue: mockSecretsService,
          },
        ],
      });
      service = TestBed.inject(SecretMetadataResolverService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should respond with secret metadata', () => {
      (service.resolve(mockRouteSnapshot, null) as Observable<ISecretMetadata>).subscribe(
        actual => {
          expect(actual).toEqual(secretMetadata);
        }
      );
    });
  });

  describe('When secret is not found', () => {
    let service: SecretMetadataResolverService;
    let mockSecretsService;
    let mockRouteSnapshot;
    let mockRouter;

    beforeEach(() => {
      mockSecretsService = jasmine.createSpyObj(['getSecretMetadata']);
      mockSecretsService.getSecretMetadata.and.returnValue(throwError({status: 404}));

      mockRouter = jasmine.createSpyObj(['navigate']);

      mockRouteSnapshot = {paramMap: convertToParamMap({id: '360'})};

      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule,
          RouterTestingModule,
        ],
        providers: [
          {
            provide: SecretsService,
            useValue: mockSecretsService,
          },
          {
            provide: Router,
            useValue: mockRouter,
          }
        ],
      });
      service = TestBed.inject(SecretMetadataResolverService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should redirect to 404 error page', () => {
      (service.resolve(mockRouteSnapshot, null) as Observable<ISecretMetadata>).subscribe();
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/error', 404]);
    });
  });
});
