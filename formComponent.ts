import { Component, OnInit, ChangeDetectorRef, ElementRef, Input, Output, ViewChild, EventEmitter, OnDestroy, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, FormControl } from '@angular/forms';
import { MobileAPIService } from '../../services/mobileAPI/mobile-api.service';
import { WhatsappOptInRequestModel, elevateLead, LiveVideoRequestModel, LiveVideoCxRequestModel } from 'src/app/model/whatsapp-opt-in-request-model';
import { healthApplicationStorage } from 'src/app/model/healthApplicationStorage';
import { Utility } from 'src/app/constants/utility';
import * as Constants from 'src/app/constants/Constants';
import * as ValidationConstants from "src/app/constants/ValidationConstants";
import { Observable, Subscription } from 'rxjs';
import { eChannelConfig } from 'src/app/constants/Config';
import { portPolicyResponseModel } from '../../model/whatsapp-opt-in-response-model';
import { ProductType } from 'src/app/constants/ValidationConstants';
import { IL_GTM } from '../../common/ga-events/IL_GTM';
import { utilityService } from 'src/app/services/utility/utility.service';
import { DEFAULT_CUSTOMER_NAME, VIDEOCALLENDTIME, VIDEOCALLSTARTTIME } from 'src/app/constants/Constants';
declare function continueRecentQuote(quote: any);

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  @Input() hapOrionTaggedUrl: boolean;
  @Input() elevateOrionTaggedUrl: boolean;
  @Input() abcOrionTaggedUrl: boolean;
  @Input() selectedpolicyType: string = "";
  @Input() sessionCallBackHealthData: any;
  @Input() activeTab: any;
  myForm: FormGroup;
  whatsAppOptInRequest: WhatsappOptInRequestModel;
  _userData: healthApplicationStorage;
  adultspanText: string = "";
  kidspanText: string = "";
  @ViewChild('dd1') dd1: ElementRef;
  @ViewChild('mm1') mm1: ElementRef;
  @ViewChild('yyyy1') yyyy1: ElementRef;
  @ViewChild('dd2') dd2: ElementRef;
  @ViewChild('mm2') mm2: ElementRef;
  @ViewChild('yyyy2') yyyy2: ElementRef;
  @ViewChild('dd3') dd3: ElementRef;
  @ViewChild('mm3') mm3: ElementRef;
  @ViewChild('yyyy3') yyyy3: ElementRef;
  @ViewChild('countryInput') countryInput: ElementRef;
  isEnable: boolean;
  isFormDirty: boolean = false;
  showPopup: boolean = false;
  isEmailClicked: boolean;
  isMobileClicked: boolean;
  PincodeInvalid: boolean | undefined;
  submitted: boolean;
  numberofAdults: number = 0;
  numberofChildss: number = 0;
  ismemberDetailsPopup: boolean = false;
  isKidsDetailsPopup: boolean = false;
  adult1DOB: string = "";
  adult2DOB: string = "";
  kid1DOB: string = "";
  kid2DOB: string = "";
  kid3DOB: string = "";
  isAdultDobVaildated: boolean = false;
  isKidDobValidated: boolean = false;
  isadult1DOBValid: number = 1;
  isadult2DOBValid: number = 1;
  isKid1DOBValid: number = 1;
  isKid2DOBValid: number = 1;
  isKid3DOBValid: number = 1;
  insuredDetailsErrorMessage: any = "";
  kidsDetailErrorMessage: any;
  isIAgreeChecked: boolean = true;
  fieldType: string = Constants.DATECONTROL;
  maxAdults = 2;
  adultsIndexes: number[] = [];
  kidsCounter: number = 0;
  form: FormGroup;
  subscriptionEmail: Subscription;
  subscriptionMobile: Subscription;
  isAnyFieldFocused: boolean = false;
  activeShow: any = 'active';
  showThankyouPopup: boolean = false;
  CCEmailID: string = "";
  CCMobileNo: string = "";
  activateBoosterThankyouPopup: boolean = false;
  dataLoaded: boolean = false;
  isLoginTypeUser: boolean;
  IsCallCenterUser: boolean = false;
  PortExistingPolicy: boolean = false;
  portPolicyLeftDay: string;
  tabname: string;
  searchDiv: boolean = false;
  CountryCodes: any
  liveVideoRequestModel: LiveVideoRequestModel = new LiveVideoRequestModel();
  liveVideoCxRequestModel: LiveVideoCxRequestModel = new LiveVideoCxRequestModel();
  isLinkDisabled: boolean = false;
  isMobile: boolean;
  showButton: boolean = false;

  showNriPopup = false;
  showPortExistingPopup: boolean = false;
  isWhatsappPop: boolean = false;
  isWhatsappOpted: boolean = true;
  nriThankyouPopup: boolean = false;


  showRecentQuote: boolean
  recentQuotes: any[] = [];
  filteredQuote: any;

  //To prevent IOS reload issue
  private intervalId: any;
 // private isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  private recentQuotesListener: any;
  constructor(private formBuilder: FormBuilder, private mobileApiService: MobileAPIService, private cd: ChangeDetectorRef, private renderer: Renderer2,
    private _utilityService: utilityService
  ) {
    this.whatsAppOptInRequest = new WhatsappOptInRequestModel();
    this._userData = new healthApplicationStorage();
    this.isMobile = window.innerWidth <= 767;
  }

  ngOnInit() {
    //To prevent IOS reload issue
    //if (this.isIOS) {
    //this.cd.detach(); 
    //setTimeout(() => this.cd.reattach(), 500);
    //}
    this.IsCallCenterUser = window.sessionStorage.getItem('IsCallCenterUser') == 'true' ? true : false;
    this.isLoginTypeUser = window.sessionStorage.getItem('LoginType') == 'User' ? true : false;
    this.PortExistingPolicy = window.sessionStorage.getItem('checkboxState') == 'true' ? true : false;
  //  this.availGstBenefit = window.sessionStorage.getItem('availGstBenefit') == 'true' ? true : false;
    if (this.isLoginTypeUser) {
      this.onChildCustomerProfile();
    }
    this._utilityService.addClassesForLanguages();

    this.updateButtonVisibility();
    // Optional: Update visibility periodically every minute
    this.intervalId = setInterval(() => this.updateButtonVisibility(), 60000);

  }
  ngAfterViewInit() {
    if (!this.IsCallCenterUser) {
      if ((window as any).__RECENT_QUOTES_SHARED__ && Array.isArray((window as any).__RECENT_QUOTES_SHARED__.data)) {
        this.recentQuotes = (window as any).__RECENT_QUOTES_SHARED__.data;
        console.log('load from global store');
        this.showRecentQuote = this.recentQuotes.length > 0;
        this.applyFilter();
        this.cd.detectChanges();
      }

      this.recentQuotesListener = (event: any) => {
        if (event?.detail && Array.isArray(event.detail)) {
          this.recentQuotes = event.detail;
          console.log('update', this.recentQuotes);
          this.showRecentQuote = this.recentQuotes.length > 0;
          this.applyFilter();
          this.cd.detectChanges();
        }
      };

      window.addEventListener('recentQuotes', this.recentQuotesListener);
    }
  }

  private getGAProductName(productType: string): string {
    switch (productType) {
      case 'elevate':
        return 'health_elevate';
      case 'ab':
        return 'health_ab';
      case 'abc':
        return 'health_abc';
      case 'fw':
      case 'fwtp':
        return 'motor_4w';
      case 'tw':
      case 'twtp':
        return 'motor_2w';
      default:
        return productType || 'unknown';
    }
  }

  applyFilter() {
    const allowedProducts = ['elevate', 'ab', 'abc'];
    const filtered = this.recentQuotes.filter(q =>
      allowedProducts.includes((q.productType || '').toLowerCase())
    );
    this.filteredQuote = filtered.length > 0 ? filtered[0] : null;
    this.showRecentQuote = this.filteredQuote;
    this.cd.detectChanges();

    if (this.filteredQuote && !this.IsCallCenterUser) {
      const quote = this.filteredQuote;

      const action = `recent_quote_widget`; 
      const productForGA = this.getGAProductName(quote.productType);
      const quoteId = quote.proposalId || '';
      const quoteRecallSource = 'leadform'; 

      const eventValue = `${productForGA}|${quoteId}|${quoteRecallSource}`;

      IL_GTM.pushCustomGAEvent(
        'custom_event',
        'retrieve_quote_interaction',       
        action,
        eventValue
      );
    }
  }

  formatSumInsured(amount: number): string {

    if (!amount) return '';

    if (amount === 9999999999) return 'Unlimited';

    const crore = 10000000;
    const lakh = 100000;

    if (amount >= crore) {
      const value = amount / crore;
      return `₹${this.formatDecimal(value)} ${value === 1 ? 'Crore' : 'Crores'}`;
    }

    if (amount >= lakh) {
      const value = amount / lakh;
      return `₹${this.formatDecimal(value)} ${value === 1 ? 'lakh' : 'lakhs'}`;
    }

    return `₹${amount.toLocaleString('en-IN')}`;
  }

  private formatDecimal(value: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  }

  continueWithQuote() {
    if (!this.filteredQuote) return;
    const quote = this.filteredQuote;
    if ((window as any).continueRecentQuoteGlobal) {
      (window as any).continueRecentQuoteGlobal(quote);
    }

  }
  // updateButtonVisibility(): void {
  //   const now = new Date();
  //   const currentHour = now.getHours();
  //   const currentMinutes = now.getMinutes();

  //   // Define the time range: 8 AM to 11 PM
  //   const startHour = VIDEOCALLSTARTTIME;
  //   const endHour = VIDEOCALLENDTIME;

  //   // Check if the current time falls within the range
  //   this.showButton = currentHour > startHour && currentHour < endHour ||
  //     (currentHour === startHour && currentMinutes >= 0) ||
  //     (currentHour === endHour && currentMinutes === 0);
  // }

  // Assume these are imported from another file
  // End time as Hours:Minutes

  updateButtonVisibility(): void {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const [startHour, startMinutes] = VIDEOCALLSTARTTIME.split(':').map(num => parseInt(num));
    const [endHour, endMinutes] = VIDEOCALLENDTIME.split(':').map(num => parseInt(num));

    // Check if the current time is within the range
    const isAfterStartTime = (currentHour > startHour) || (currentHour === startHour && currentMinutes >= startMinutes);
    const isBeforeEndTime = (currentHour < endHour) || (currentHour === endHour && currentMinutes <= endMinutes);

    // Set showButton based on whether the current time is between start and end time
    this.showButton = isAfterStartTime && isBeforeEndTime;
  }


  elevateLeadSubmit(request: elevateLead) {
    this.mobileApiService.elevateLeadCall(request)
      .then((res) => {
        if (res.Success) {
          this.activateBoosterThankyouPopup = true;
          // this._gaService.doGAPush(request.MobileNo, request.Email);
        }
      })
      .catch((err) => {
      });
  }

  onChildMobileNoEvent(data: any) {
    //this.whatsAppOptInRequest.MobileNo = Utility.ecryptData(data);
    this.whatsAppOptInRequest = data;
    let whatsAppOptResp = this.mobileApiService.whatsappOptIn(this.whatsAppOptInRequest);
  }

  onChildCustomerProfile() {
    this.mobileApiService
      .GetCustomerProfile()
      .then((response) => {
        if (!Utility.IsNullOrEmpty(response.EmailId)) {
          this._userData.EmailIdWithoutMask = response.EmailId;
          this.CCEmailID = response.EmailId;
        }
        if (!Utility.IsNullOrEmpty(response.MobileNo)) {
          this._userData.MobileNoWithoutMask = response.MobileNo;
          this.CCMobileNo = response.MobileNo;
        }
        this.dataLoaded = true;
      })
      .catch((error) => {
      });
  }

  onChildErrorPopupEvent(showPopup: any) {
    this.showPopup = showPopup;
  }

  onChildGetQuoteEvent(e: any) {
    //this._userData = { ...this._userData, ...e.detail.data };
    this._userData = { ...e.data };

    if (this.isIAgreeChecked) {
      if (this.selectedpolicyType === "elevate" || this.selectedpolicyType === "abc" || this.selectedpolicyType === "ab") {
        window.sessionStorage.setItem("TabMenu", "4");
        this._userData.PortExistingPolicy = this.PortExistingPolicy;
        window.sessionStorage.setItem(Constants.HEALTH_UI_DATA, JSON.stringify(this._userData));

        if (this._userData.isSeniorCitizenTrue) {
          window.location.href = eChannelConfig.SeniorCitizen_PAGE_URL;
        }
        else {
          if (this.selectedpolicyType === "elevate") {
            window.location.href = eChannelConfig.ELEVATE_URL_ORION;
          }
          //else if (!this.abcOrionTaggedUrl && this.selectedpolicyType === "abc") {
          //  window.location.href = eChannelConfig.SUPER_SAVER_URL;
          //}
          else if (this.selectedpolicyType === "abc") {
            window.location.href = eChannelConfig.SUPER_SAVER_URL_ORION;
          }
          else if (this.selectedpolicyType === "ab") {
            sessionStorage.setItem('ElevateAIBOT', 'false');
            window.location.href = eChannelConfig.AB_URL_ORION;
          }
        }
      }
      if (this.selectedpolicyType == "max") {
        window.sessionStorage.setItem("TabMenu", "4");
        window.sessionStorage.setItem(Constants.HEALTH_UI_DATA, JSON.stringify(this._userData));
        window.location.href = `${eChannelConfig.Home_PAGE_URL}${eChannelConfig.MP_PLAN_PAGE_URL}`;
      }
      if (this.selectedpolicyType == "arog") {
        window.sessionStorage.setItem("TabMenu", "4");
        window.sessionStorage.removeItem(Constants.HEALTH_UI_DATA);
        window.sessionStorage.setItem(Constants.HEALTHArogya_UI_DATA, JSON.stringify(this._userData));
        window.location.href = `${eChannelConfig.Home_PAGE_URL}${eChannelConfig.AROGYA_PLAN_PAGE_URL}`;
      }
      if (this.selectedpolicyType == "hb") {
        window.sessionStorage.setItem("TabMenu", "4");
        window.sessionStorage.setItem(Constants.HEALTH_UI_DATA, JSON.stringify(this._userData));
        window.location.href = `${eChannelConfig.Home_PAGE_URL}${eChannelConfig.HB_PLAN_PAGE_URL}`;
      }
      if (this.selectedpolicyType == "pp") {
        window.sessionStorage.setItem("TabMenu", "4");
        window.sessionStorage.setItem(Constants.HEALTH_UI_DATA, JSON.stringify(this._userData));
        window.location.href = `${eChannelConfig.Home_PAGE_URL}${eChannelConfig.PP_PLAN_PAGE_URL}`;
      }

      if (this.selectedpolicyType == "hap") {
        window.sessionStorage.setItem("TabMenu", "4");
        window.sessionStorage.setItem(Constants.HEALTH_UI_DATA, JSON.stringify(this._userData));
        //window.location.href = eChannelConfig.HAE_URL;

        if (this._userData.isSeniorCitizenTrue) {
          window.location.href = eChannelConfig.SeniorCitizen_PAGE_URL;
        }
        else if (this.hapOrionTaggedUrl) {
          window.location.href = eChannelConfig.HAE_URL;
        }
        else {
          window.location.href = eChannelConfig.HAE_URL_PF;
        }
      }
      //if (this.selectedpolicyType == "ab") {
      //let activateBoosterData: elevateLead = {
      //  PinCode: '',
      //  MobileNo: '',
      //  Email: '',
      //  numberOfAdult: '',
      //  numberOfKid: '',
      //  Product: '',
      //  ProductCode: 0,
      //  Insured1DOB: '',
      //  Insured2DOB: '',
      //  kid1DOB: '',
      //  kid2DOB: '',
      //  kid3DOB: '',
      //  ContactName: ''
      //};

      //activateBoosterData.PinCode = this._userData.PinCode;
      //activateBoosterData.MobileNo = this._userData.MobileNoWithoutMask;
      //activateBoosterData.Email = this._userData.EmailIdWithoutMask;
      //activateBoosterData.numberOfAdult = this._userData.NoOfAdult;
      //activateBoosterData.numberOfKid = this._userData.NoOfKids;
      //activateBoosterData.Product = "Activate Booster";
      //activateBoosterData.ProductCode = ProductType.ActivateBooster;
      //activateBoosterData.ContactName = this._userData.Name;

      //let counter = 0;
      //this._userData.Relations.forEach((relation: any, i: number) => {
      //  if (relation.KidAdultType === 2) {
      //    const adultDOB = relation.DateOfBirth;
      //    if (adultDOB) {
      //      activateBoosterData[`Insured${i + 1}DOB`] = adultDOB;
      //    }
      //  }
      //  else {
      //    const kidDOB = relation.DateOfBirth;
      //    if (kidDOB) {
      //      counter++;
      //      activateBoosterData[`kid${counter}DOB`] = kidDOB;
      //    }
      //  }
      //});

      //this.elevateLeadSubmit(activateBoosterData);
      //}
    }
  }

  addFocus(e: any) {
    e.target.offsetParent.classList.add('focus');
    e.isAnyFieldFocused = true;
  }

  removeFocus(e: any) {
    if ((e.target.value).trim() == '') {
      e.target.offsetParent.classList.remove('focus');
    }
    else {
      e.target.offsetParent.classList.remove('focus');
      e.target.offsetParent.classList.add('transform');
    }
  }

  get txtPolicyType() {
    return this.myForm.get("txtPolicyType")
  }
  get txtmobilenumber() {
    return this.myForm.get("txtmobilenumber");
  }
  get txtemail() {
    return this.myForm.get("txtemail");
  }
  get txtpincode() {
    return this.myForm.get("txtpincode");
  }

  portExistingClick() {
    this.PortExistingPolicy = !this.PortExistingPolicy;
  }

  portPolicy(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.PortExistingPolicy = checkbox.checked;

    window.sessionStorage.setItem('checkboxState', JSON.stringify(this.PortExistingPolicy));
  }

  //availNilGstBenefit(event: Event) {
  //  const checkbox = event.target as HTMLInputElement;
  //  this.availGstBenefit = checkbox.checked;
  //  window.sessionStorage.setItem('availGstBenefit', JSON.stringify(this.availGstBenefit));
  //}

  ngOnDestroy(): void {
    try {
      this.subscriptionMobile.unsubscribe();
      this.subscriptionEmail.unsubscribe();
    }
    catch (error) {
    }
    //To prevent IOS reload issue
    if (this.intervalId) {
    clearInterval(this.intervalId);
    }
    if (this.recentQuotesListener) {
    window.removeEventListener('recentQuotes', this.recentQuotesListener);
    }
  }

  gaEvent(fieldName: any): void {
    if (this.selectedpolicyType == 'ab') {
      if (fieldName == "got_it_click") {
        //IL_GTM.pushCustomGAEvent('custom_event', 'health_landing_page_interactions_' + this.selectedpolicyType, fieldName, this.selectedpolicyType ?? '');
      }
    }

  }
  onWhatsappPictureClick(event: Event): void {
    event.stopPropagation();
    IL_GTM.pushCustomGAEvent(
      'custom_event',
      this.selectedpolicyType + '_landing_page_interactions',
      'whatsapp_icon_click',
      ''
    );
  }

  getDateFromFields(day: string, month: string, year: string): Date | null {
    if (day && month && year && day.length == 2 && month.length == 2 && year.length == 4) {
      return new Date(+year, +month - 1, +day); // month is 0-indexed
    }
    return null;
  }
  //get policyMinDateInvalid() {
  //  return this.portForm.hasError('policyMinDateInvalid');
  //}
  //get policyMaxDateInvalid() {
  //  return this.portForm.hasError('policyMaxDateInvalid');
  //}

  openUrlInNewTab(url: string) {
    window.open(url, '_blank');
  }

  cancelManagePolicy(val: any) {
    document.getElementById('login-revamp-click')?.click();
    //IL_GTM.pushCustomGAEvent("custom_event", "travel_ins_lp_int_single_trip", val, "")
  }

  /* Port Existing Policy Popup */
  onPortExistingClick(): void {
    this.showPortExistingPopup = false;
    setTimeout(() => {
      this.showPortExistingPopup = true;
    });
    IL_GTM.pushCustomGAEvent('custom_event', 'elevate_lp_int', 'hyper_link_click', 'port_existing_policy');
  }

  onPortPopupClosed(): void {
    this.showPortExistingPopup = false;
  }

  /* NRI Popup */
  openNriPopup() {
      this.showNriPopup = false;   
      setTimeout(() => {
        this.showNriPopup = true;  
      });
    IL_GTM.pushCustomGAEvent('custom_event', 'elevate_lp_int', 'hyper_link_click', ' Get NRI health insurance at 25% off ');
  }

  onNriPopupClosed() {
    this.showNriPopup = false;
  }

  /* Whatsapp Opt-in Popup */
  openWhatsappPopup() {
    this.isWhatsappPop = true;
  }
}



