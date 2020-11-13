import {inject, TestBed} from '@angular/core/testing';

import { SecretsService } from './secrets.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {ISecret, ISecretMetadata} from './secret';

describe('SecretsService', () => {
  let service: SecretsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
    });
    service = TestBed.inject(SecretsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when creating a secret', () => {
    let actual: ISecretMetadata;
    let secretMetadataObservable;
    let request;

    const expected: ISecretMetadata = {
      id: 'V5nIvLMxZUYP4',
      access_count: 0,
      access_limit: 5,
      expiration: new Date(),
    };
    const secretContent = 'TSJ271HWvlSM 0dkxJ0J Cp57zLGlJsgwIl1 Oe510U893sU 7zn';

    beforeEach(() => {
      secretMetadataObservable = service.createSecret(secretContent, expected.expiration, expected.access_limit)
        .subscribe(next => actual = next);
      request = httpMock.expectOne('api/v1/secrets');
      request.flush(expected);
    });

    it('should make a post request', () => expect(request.request.method).toEqual('POST'));

    it('should make request with the correct body', () => {
      expect(request.request.body).toEqual({
        content: secretContent,
        expiration_epoch: Math.floor(expected.expiration.getTime() / 1000),
        access_limit: expected.access_limit,
      });
    });

    it('should respond with expected id', () => expect(actual.id).toEqual(expected.id));
    it('should respond with expected access limit', () => expect(actual.access_limit).toEqual(expected.access_limit));
    it('should respond with expected access count', () => expect(actual.access_count).toEqual(expected.access_count));
    it('should respond with expected expiration', () => expect(actual.expiration).toEqual(expected.expiration));
  });

  describe('when getting secret metadata', () => {
    let actual: ISecretMetadata;
    let secretMetadataObservable;
    let request;

    const expected: ISecretMetadata = {
      id: 'V5nIvLMxZUYP4',
      access_count: 0,
      access_limit: 5,
      expiration: new Date(),
    };

    beforeEach(() => {
      secretMetadataObservable = service.getSecretMetadata(expected.id)
        .subscribe(next => actual = next);
      request = httpMock.expectOne(`api/v1/secrets/${expected.id}`);
      request.flush(expected);
    });

    it('should make a get request', () => expect(request.request.method).toEqual('GET'));
    it('should respond with expected id', () => expect(actual.id).toEqual(expected.id));
    it('should respond with expected access limit', () => expect(actual.access_limit).toEqual(expected.access_limit));
    it('should respond with expected access count', () => expect(actual.access_count).toEqual(expected.access_count));
    it('should respond with expected expiration', () => expect(actual.expiration).toEqual(expected.expiration));
  });

  describe('when accessing a secret', () => {
    let actual: ISecret;
    let secretMetadataObservable;
    let request;

    const expected: ISecret = {
      id: 'V5nIvLMxZUYP4',
      content: 'TSJ271HWvlSM 0dkxJ0J Cp57zLGlJsgwIl1 Oe510U893sU 7zn'
    };

    beforeEach(() => {
      secretMetadataObservable = service.accessSecret(expected.id)
        .subscribe(next => actual = next);
      request = httpMock.expectOne(`api/v1/secrets/${expected.id}/access`);
      request.flush(expected);
    });

    it('should make a post request', () => expect(request.request.method).toEqual('POST'));
    it('should make request with empty body', () => expect(request.request.body).toEqual({}));
    it('should respond with expected id', () => expect(actual.id).toEqual(expected.id));
    it('should respond with expected content', () => expect(actual.content).toEqual(expected.content));
  });

  describe('when deleting a secret', () => {
    let actual;
    let request;
    let secretMetadataObservable;

    const secretId = 'V5nIvLMxZUYP4';

    beforeEach(() => {
      secretMetadataObservable = service.deleteSecret(secretId).subscribe(next => actual = next);
      request = httpMock.expectOne(`api/v1/secrets/${secretId}`);
    });

    it('should make a delete request', () => expect(request.request.method).toEqual('DELETE'));
    it('should make request with empty body', () => expect(request.request.body).toBeFalsy());
    it('should respond with null', () => expect(actual).toBeUndefined());
  });
});
