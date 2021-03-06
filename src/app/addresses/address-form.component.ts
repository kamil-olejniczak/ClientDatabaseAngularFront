import {Component, OnDestroy, OnInit} from '@angular/core';
import {Address} from './address';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastsManager} from 'ng2-toastr';
import {AddressService} from './address.service';
import {Client} from '../clients/client';
import {ValidationAndLocaleMessagesService} from '../shared/validation-and-locale-messages.service';
import {Subject} from 'rxjs/Subject';

@Component({
  templateUrl: './address-form.component.html',
})
export class AddressFormComponent implements OnInit, OnDestroy {

  public activeAddress: Address;
  public activeClient: Client;
  public isNewAddress: boolean;
  public addressForm: FormGroup;
  public submitted: boolean;
  public formErrors = {
    'cityName': '',
    'streetName': '',
    'zipCode': ''
  };

  private clientId: number;
  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(private _addressService: AddressService, private _toastr: ToastsManager,
              private _validationService: ValidationAndLocaleMessagesService,
              private _route: ActivatedRoute, private _router: Router) {
  }

  ngOnInit() {
    this.getFormData();

    this.setUpForm();

    this.addressForm.valueChanges
      .takeUntil(this.ngUnsubscribe)
      .subscribe(data => this._validationService.onValueChanged(
        this.addressForm, this.formErrors, data));

    this.validateOnBlur();
  }

  onSubmit(id: number): void {
    this.submitted = true;

    if (this.isNewAddress) {
      this.tryToSaveNewAddress();
    } else {
      if (this.checkForAddressDataDuplication()) {
        return;
      } else {
        this.tryToUpdateAddress(id);
      }
    }
  }

  onBack(): void {
    this._router.navigate(['/clients', this.clientId, 'details']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  validateOnBlur(): void {
    this._validationService.onValueChanged(this.addressForm, this.formErrors);
  }

  private tryToSaveNewAddress(): void {
    this.activeAddress = this.addressForm.value;
    this._addressService.saveNewAddress(this.activeAddress, this.clientId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        response => this._toastr.success(this._validationService.getLocalizedMessages('addressAdded'),
          this._validationService.getLocalizedMessages('successTitle')).then(
          () => this.onBack()),
        error => {
          if (error === -1) {
            this._toastr.error(this._validationService.getLocalizedMessages('addressNotAdded'),
              this._validationService.getLocalizedMessages('errorTitle'));
          } else {
            this._toastr.error(error, this._validationService.getLocalizedMessages('errorTitle'));
          }
        }
      );
  }

  private tryToUpdateAddress(id: number): void {
    this.activeAddress = this.addressForm.value;
    this.activeAddress.id = id;
    this._addressService.updateAddress(this.activeAddress)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        response => this._toastr.success(response,
          this._validationService.getLocalizedMessages('successTitle')).then(
          () => this.onBack()),
        error => this._toastr.error(error, this._validationService.getLocalizedMessages('errorTitle')));
  }

  private checkForAddressDataDuplication(): boolean {
    // first check values that can differ the most
    if (this.activeAddress.streetName === this.addressForm.value.streetName
      && this.activeAddress.zipCode === this.addressForm.value.zipCode
      && this.activeAddress.cityName === this.addressForm.value.cityName) {
      this.submitted = false;
      this._toastr.error(this._validationService.getLocalizedMessages('addressExists'),
        this._validationService.getLocalizedMessages('errorTitle'));
      return true;
    }
    return false;
  }

  private getFormData(): void {
    this.clientId = +this._route.snapshot.paramMap.get('id');
    if (!this._route.snapshot.data['addresses']) {
      this.activeAddress = new Address();
      this.isNewAddress = true;
    } else {
      const data = this._route.snapshot.data['addresses'];
      const addressId = +this._route.snapshot.paramMap.get('addressId');
      this.activeAddress = data.find((element) => element.id === addressId);
      this.isNewAddress = false;
    }
    this.activeClient = this._route.snapshot.data['client'];
  }

  private setUpForm(): void {
    const id = new FormControl('');
    const streetName = new FormControl(this.activeAddress.streetName,
      [Validators.required, Validators.minLength(3)]);
    const cityName = new FormControl(this.activeAddress.cityName,
      [Validators.required, Validators.minLength(3)]);
    const zipCode = new FormControl(this.activeAddress.zipCode,
      [Validators.required, Validators.minLength(6), Validators.maxLength(6),
        Validators.pattern(/\d{2}-\d{3}/i)]);

    this.addressForm = new FormGroup({
      id: id,
      streetName: streetName,
      cityName: cityName,
      zipCode: zipCode
    });
  }
}
