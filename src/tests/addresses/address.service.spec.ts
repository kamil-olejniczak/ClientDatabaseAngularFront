import {inject, TestBed} from '@angular/core/testing';
import {AuthenticationServiceStub} from '../testdata/stubs/authentication.service.stub';
import {AuthenticationService} from '../../app/login/authentication.service';
import {MockBackend} from '@angular/http/testing';
import {BaseRequestOptions, Http} from '@angular/http';
import {AddressService} from '../../app/addresses/address.service';
import {Address} from '../../app/addresses/address';
import {TestUtils} from '../testdata/common/test-utils';
import {TestData} from '../testdata/common/test-data';

const authenticationServiceStub = new AuthenticationServiceStub();

describe('AddressService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule(({
      providers: [
        AddressService,
        {provide: AuthenticationService, useValue: authenticationServiceStub},
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions],
        },
      ]
    }));
  });

  afterEach(() => {
    authenticationServiceStub.resetData();
  });

  it('should get all addresses', inject([AddressService, MockBackend],
    (addressService: AddressService, mockBackend: MockBackend) => {
      const address: Address = TestData.ADDRESS_DATA;
      const data = [address];
      TestUtils.createResponse(mockBackend, data);

      addressService.getAllAddresses(1).subscribe((addresses: Address[]) => {
        expect(addresses.length).toBe(data.length);
        expect(addresses[0].id).toBe(address.id);
      });
    }));

  it('should save new address', inject([AddressService, MockBackend],
    (addressService: AddressService, mockBackend: MockBackend) => {
      const address: Address = TestData.ADDRESS_DATA;
      const clientId = 1;
      const expectedResponse = Number(address.id);
      TestUtils.createResponse(mockBackend, expectedResponse);

      addressService.saveNewAddress(address, clientId).subscribe((newAddressId: number) => {
        expect(newAddressId).toBe(expectedResponse);
      });
    }));

  it('should update existing address', inject([AddressService, MockBackend],
    (addressService: AddressService, mockBackend: MockBackend) => {
      const expectedResponse = 'Address updated';
      TestUtils.createResponse(mockBackend, expectedResponse);

      addressService.updateAddress(TestData.ADDRESS_DATA).subscribe((response: string) => {
        expect(response).toContain(expectedResponse);
      });
    }));

  it('should delete existing address', inject([AddressService, MockBackend],
    (addressService: AddressService, mockBackend: MockBackend) => {
      const expectedResponse = 'Address deleted';
      const clientId = 1;
      TestUtils.createResponse(mockBackend, expectedResponse);

      addressService.deleteAddress(TestData.ADDRESS_DATA.id, clientId).subscribe((response: string) => {
        expect(response).toContain(expectedResponse);
      });
    }));

  it('should set address as main address', inject([AddressService, MockBackend],
    (addressService: AddressService, mockBackend: MockBackend) => {
      const expectedResponse = 'Address changed';
      const clientId = 1;
      TestUtils.createResponse(mockBackend, expectedResponse);

      addressService.setAsMainAddress(TestData.ADDRESS_DATA.id, clientId).subscribe((response: string) => {
        expect(response).toContain(expectedResponse);
      });
    }));

  it('should catch error', inject([AddressService, MockBackend],
    (addressService: AddressService, mockBackend: MockBackend) => {
      const bodyMessage = 'Unauthorized';
      TestUtils.createError(mockBackend, bodyMessage, 401);

      addressService.getAllAddresses(1).subscribe(
        null,
        (error: string) => {
          expect(error).toContain(bodyMessage);
        });
    }));
});
