import {inject, TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot} from '@angular/router';
import {ClientDetailResolver} from './client-detail-resolver.service';
import {ClientService} from './client.service';
import {ClientServiceStub} from '../../test/client.service.stub';
import {Client} from './client';

const clientServiceStub = new ClientServiceStub();

describe('ClientDetailResolverTests', () => {

  beforeEach(() => {
    TestBed.configureTestingModule(({
      providers: [
        ClientDetailResolver,
        {provide: ClientService, useValue: clientServiceStub},
      ]
    }));
  });

  it('should resolve client', inject([ClientDetailResolver], (resolver: ClientDetailResolver) => {
    const activatedRouteSnapshot = new ActivatedRouteSnapshot();
    const expectedId = 1;
    spyOn(activatedRouteSnapshot.paramMap, 'get').and.returnValue(expectedId);

    const data = resolver.resolve(activatedRouteSnapshot);

    data.subscribe((client: Client) => {
      expect(client.id).toBe(expectedId);
    });
  }));
});
