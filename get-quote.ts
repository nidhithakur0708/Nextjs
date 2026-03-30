
import { Component, OnInit, ChangeDetectorRef, ElementRef, Input, Output, ViewChild, EventEmitter, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MobileAPIService } from '../../services/mobileAPI/mobile-api.service';
import { WhatsappOptInRequestModel, existingPortPolicyRequestModel, pincodeRequestModel } from 'src/app/model/whatsapp-opt-in-request-model';
import { healthApplicationStorage } from 'src/app/model/healthApplicationStorage';
import { Utility } from 'src/app/constants/utility';
import * as Constants from 'src/app/constants/Constants';
import { Observable, Subscription } from 'rxjs';
import { IL_GTM } from 'src/app/common/ga-events/IL_GTM';
import { ProductType } from '../../constants/ValidationConstants';
import { eChannelConfig } from '../../constants/Config'; // import the config file
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-get-quote',
  templateUrl: './get-quote.component.html',
  styleUrls: ['./get-quote.component.css']
})
export class GetQuoteComponent implements OnInit, OnChanges {

  @Output() childGetQuoteEvent = new EventEmitter<{ data: object, popupStatus: boolean }>();
  @Output() childMobileNoEvent = new EventEmitter<object>();
  @Output() childErrorPopupEvent = new EventEmitter<boolean>();
  @Input() selectedpolicyType: string | undefined;
  @Input() sessionCallBackHealthData: any | undefined;
  @Input() CCMobileNumber: any;
  @Input() CCEmailID: any;
  @Input() data: any;
  @Input() activeTab: string | undefined;
  @Input() elevateOrionTaggedUrl: boolean;
  @Input() abcOrionTaggedUrl: boolean;

  myForm!: FormGroup;
  _userData: healthApplicationStorage;
  adultspanText: string = '(21 years & above)';
  kidspanText: string = '(3 months - 18 years)';
  @ViewChild('dd1') dd1!: ElementRef;
  @ViewChild('mm1') mm1!: ElementRef;
  @ViewChild('yyyy1') yyyy1!: ElementRef;
  @ViewChild('dd2') dd2!: ElementRef;
  @ViewChild('mm2') mm2!: ElementRef;
  @ViewChild('yyyy2') yyyy2!: ElementRef;
  @ViewChild('dd3') dd3!: ElementRef;
  @ViewChild('mm3') mm3!: ElementRef;
  @ViewChild('yyyy3') yyyy3!: ElementRef;
  isEnable: boolean | undefined;
  showPopup: boolean = false;
  isEmailClicked: boolean | undefined;
  isMobileClicked: boolean | undefined;
  submitted: boolean | undefined;
  ismemberDetailsPopup: boolean = false;
  isAdultDobVaildated: boolean = false;
  isKidDobValidated: boolean = false;
  insuredDetailsErrorMessage: any = "";
  kidsDetailErrorMessage: any;
  subscriptionEmail!: Subscription;
  subsciptionMobile!: Subscription;
  isAnyFieldFocused: boolean = false;
  activeShow: any = '';
  isActive: string = 'marRight emailWrapp';
  PincodeSubmitted: boolean = false;
  isKidsDetailsPopup: boolean = false;
  isValidatePin: boolean = false;
  showErrMessage: boolean = false;
  PinCodeData: any = {};
  isMobile: boolean = window.innerWidth <= 768;
  isMember: boolean = false;

  sessionArray: string[] = [
    "ResumeChat",
    "OtpVerificationDone",
    "BotMessages",
    "BotConcludeChat",
    "CID",
    "clientipaddress",
    "KpointIdentifier",
    "utm_keyword",
    "PFQuoteId",
    "ECSProposalId",
    "IsBeFitApplicable",
    "SISliderbackCaseValue",
    "chi_Insured_GA_Datalayer",
    "IsBeFitRemoved",
    "GA_Datalayer",
    "ECSCustomerId",
    "chiFetchProposalResponseUIModel",
    "clientId",
    "utm_source",
    "ecsProposalIDInitial",
    "hapCalcReq",
    "DefaultZone",
    "utm_campaign",
    "devicetype",
    "Corelationid",
    "isProposalOTPAuth",
    "ProductName",
    "selectedYear",
    "ZoneVal",
    "SID",
    "SelectedZone",
    "mobiledevice",
    "IsDiscountAdded",
    "IsCalledGuestUserToken",
    "IsGuestUser",
    "ProposalId",
    "proposalId",
    "orderID",
    "IsNewLeadForm"
  ];

  maxAdults = 6;
  maxKids = 3;
  numberofAdults: number = 0;
  numberofChildss: number = 0;
  adults: any[] = [0, 1, 2, 3, 4, 5];
  kidsArray: any[] = [0, 1, 2];
  isAdultDOBValid: boolean[] = new Array(6).fill(false);
  isKidDOBValid: boolean[] = new Array(3).fill(false);
  adultDOB: string[] = [];
  kidDOB: string[] = [];
  PincodeInvalid: boolean = false;
  private isFormCreated = false;

  constructor(private formBuilder: FormBuilder, private mobileApiService: MobileAPIService, private cd: ChangeDetectorRef, private route: ActivatedRoute, private router: Router) {
    this._userData = new healthApplicationStorage();
  }

  ngOnInit() {
    if (!this.isFormCreated) {
      this.createForm();
    }
    if (this.selectedpolicyType == 'elevate' || this.selectedpolicyType == 'abc') {
      this.maxAdults = 2;
    }
    if (this.sessionCallBackHealthData && !Utility.IsNullOrEmpty(this.sessionCallBackHealthData)) {
      let counter = 0;
      if (this.selectedpolicyType == 'hap' || this.selectedpolicyType == 'elevate' || this.selectedpolicyType == 'abc' || this.selectedpolicyType == 'ab') {
        this.sessionCallBackHealthData.Relations.forEach((relation: any, i: number) => {
          if (relation.KidAdultType === 2) {
            const adultDOB = relation.DateOfBirth;
            if (adultDOB) {
              this.myForm.patchValue({
                [`txtadult${i + 1}date`]: adultDOB.split('/')[1] || '',
                [`txtadult${i + 1}month`]: adultDOB.split('/')[0] || '',
                [`txtadult${i + 1}year`]: adultDOB.split('/')[2] || ''
              });
            }
          }
          else {
            const kidDOB = relation.DateOfBirth;
            if (kidDOB) {
              counter++;
              this.myForm.patchValue({
                [`txtKid${counter}Date`]: kidDOB.split('/')[1] || '',
                [`txtKid${counter}Month`]: kidDOB.split('/')[0] || '',
                [`txtKid${counter}Year`]: kidDOB.split('/')[2] || ''
              });
            }
          }
        });
      }
      else {
        for (let i = 1; i <= this.maxAdults; i++) {
          const adultDOB = this.sessionCallBackHealthData[`Adult${i}DOB`]; // Get the DOB for the current adult
          // Set the form values based on the DOB
          this.myForm.patchValue({
            [`txtadult${i}date`]: adultDOB ? adultDOB.split('/')[1] : '',
            [`txtadult${i}month`]: adultDOB ? adultDOB.split('/')[0] : '',
            [`txtadult${i}year`]: adultDOB ? adultDOB.split('/')[2] : ''
          });
        }
        for (let i = 1; i <= this.maxKids; i++) {
          const kidDOB = this.sessionCallBackHealthData[`Kid${i}DOB`]; // Get the DOB for the current adult
          // Set the form values based on the DOB
          this.myForm.patchValue({
            [`txtKid${i}Date`]: kidDOB ? kidDOB.split('/')[1] : '',
            [`txtKid${i}Month`]: kidDOB ? kidDOB.split('/')[0] : '',
            [`txtKid${i}Year`]: kidDOB ? kidDOB.split('/')[2] : ''
          });
        }
      }

      this.myForm.patchValue(
        {
          txtNumberofadults: this.sessionCallBackHealthData.NoOfAdult,
          txtnumberofchilds: this.sessionCallBackHealthData.NoOfKids,
          txtmobilenumber: (!Utility.IsNullOrEmpty(this.sessionCallBackHealthData) && !Utility.IsNullOrEmpty(this.sessionCallBackHealthData.MobileNoWithoutMask)) ? this.sessionCallBackHealthData.MobileNoWithoutMask : this.sessionCallBackHealthData.MobileNo,
          txtemail: (!Utility.IsNullOrEmpty(this.sessionCallBackHealthData) && !Utility.IsNullOrEmpty(this.sessionCallBackHealthData.EmailIdWithoutMask)) ? this.sessionCallBackHealthData.EmailIdWithoutMask : this.sessionCallBackHealthData.EmailId,
          txtpincode: this.sessionCallBackHealthData.PinCode,
          txtPolicyType: this.selectedpolicyType,
          txtName: this.sessionCallBackHealthData.Name
        }
      );

      if ((this.selectedpolicyType == 'max' || this.selectedpolicyType == 'arog' || this.selectedpolicyType == 'abc' || this.selectedpolicyType == 'hb' || this.selectedpolicyType == 'ab')
        && (this.myForm.controls[`txtNumberofadults`].value > 2 || (this.myForm.controls[`txtNumberofadults`].value == 1 && this.myForm.controls['txtnumberofchilds'].value == 3))) {
        this.numberofAdults = 0;
        this.numberofChildss = 0;
        this.myForm.controls['txtNumberofadults'].setValue(0);
        this.myForm.controls['txtnumberofchilds'].setValue(0);
      } else if (this.selectedpolicyType == 'elevate'
        && (this.myForm.controls[`txtNumberofadults`].value > 2 || (this.myForm.controls[`txtNumberofadults`].value == 1 && this.myForm.controls['txtnumberofchilds'].value > 3))) {
        this.numberofAdults = 0;
        this.numberofChildss = 0;
        this.myForm.controls['txtNumberofadults'].setValue(0);
        this.myForm.controls['txtnumberofchilds'].setValue(0);
      }

      if (!Utility.IsNullOrEmpty(this.myForm.controls['txtNumberofadults'].value)) {
        this.numberofAdults = parseInt(this.myForm.controls['txtNumberofadults'].value);
        if (this.numberofAdults > 0) {
          this.isAdultDobVaildated = this.numberofAdults > 0;

          // Loop through each adult and set their DOB if the form controls exist
          for (let i = 1; i <= this.numberofAdults; i++) {
            const monthControl = this.myForm.controls[`txtadult${i}month`];
            const dateControl = this.myForm.controls[`txtadult${i}date`];
            const yearControl = this.myForm.controls[`txtadult${i}year`];

            // Check if form controls exist and have values
            if (monthControl && dateControl && yearControl &&
              monthControl.value && dateControl.value && yearControl.value) {
              this.adultDOB[i] = `${monthControl.value}/${dateControl.value}/${yearControl.value}`;
            }
          }
        }
      }
      if (!Utility.IsNullOrEmpty(this.myForm.controls['txtnumberofchilds'].value)) {
        this.numberofChildss = parseInt(this.myForm.controls['txtnumberofchilds'].value);
        if (this.numberofChildss > 0) {
          this.isKidDobValidated = this.numberofChildss > 0;


          // Loop through each adult and set their DOB if the form controls exist
          for (let i = 1; i <= this.numberofChildss; i++) {
            const monthControl = this.myForm.controls[`txtKid${i}Month`];
            const dateControl = this.myForm.controls[`txtKid${i}Date`];
            const yearControl = this.myForm.controls[`txtKid${i}Year`];

            // Check if form controls exist and have values
            if (monthControl && dateControl && yearControl &&
              monthControl.value && dateControl.value && yearControl.value) {
              this.kidDOB[i] = `${monthControl.value}/${dateControl.value}/${yearControl.value}`;
            }
          }
        }
      }

      if (!Utility.IsNullOrEmpty(this.myForm.controls['txtpincode'].value)) {
        this.validatePincode(this.myForm.controls['txtpincode'].value)
        // this.childPinCodeEvent.emit(this.myForm.controls['txtpincode'].value);
      }

      this.sessionArray.forEach(item => {
        window.sessionStorage.removeItem(item);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const loginType = window.sessionStorage.getItem("LoginType");
    if (loginType != null && loginType == "User" && changes['CCMobileNumber'].firstChange && changes['CCEmailID'].firstChange) {
      if (!this.isFormCreated) {
        this.createForm();
      }
      if (!Utility.IsNullOrEmpty(this.CCMobileNumber) && !Utility.IsNullOrEmpty(this.CCEmailID)) {
        this.myForm.patchValue({
          txtemail: this.CCEmailID,
          txtmobilenumber: this.CCMobileNumber,
        });
      }
    }
    if (loginType != null && loginType == "User" && changes['sessionCallBackHealthData'].currentValue !== undefined) {
      if (this.selectedpolicyType == 'hap' || this.selectedpolicyType == 'elevate' || this.selectedpolicyType == 'abc' || this.selectedpolicyType == 'ab') {
        let counter = 0;
        this.sessionCallBackHealthData.Relations.forEach((relation: any, i: number) => {
          if (relation.KidAdultType === 2) {
            const adultDOB = relation.DOB;
            if (adultDOB) {
              this.myForm.patchValue({
                [`txtadult${i + 1}date`]: adultDOB.split('/')[1] || '',
                [`txtadult${i + 1}month`]: adultDOB.split('/')[0] || '',
                [`txtadult${i + 1}year`]: adultDOB.split('/')[2] || ''
              });
            }
          }
          else {
            const kidDOB = relation.DOB;
            if (kidDOB) {
              counter++;
              this.myForm.patchValue({
                [`txtKid${counter}Date`]: kidDOB.split('/')[1] || '',
                [`txtKid${counter}Month`]: kidDOB.split('/')[0] || '',
                [`txtKid${counter}Year`]: kidDOB.split('/')[2] || ''
              });
            }
          }
        });
      }
      else {
        for (let i = 1; i <= this.maxAdults; i++) {
          const adultDOB = this.sessionCallBackHealthData[`Adult${i}DOB`]; // Get the DOB for the current adult
          // Set the form values based on the DOB
          this.myForm.patchValue({
            [`txtadult${i}date`]: adultDOB ? adultDOB.split('/')[1] : '',
            [`txtadult${i}month`]: adultDOB ? adultDOB.split('/')[0] : '',
            [`txtadult${i}year`]: adultDOB ? adultDOB.split('/')[2] : ''
          });
        }
        for (let i = 1; i <= this.maxKids; i++) {
          const kidDOB = this.sessionCallBackHealthData[`Kid${i}DOB`]; // Get the DOB for the current adult
          // Set the form values based on the DOB
          this.myForm.patchValue({
            [`txtKid${i}Date`]: kidDOB ? kidDOB.split('/')[1] : '',
            [`txtKid${i}Month`]: kidDOB ? kidDOB.split('/')[0] : '',
            [`txtKid${i}Year`]: kidDOB ? kidDOB.split('/')[2] : ''
          });
        }
      }

      this.myForm.patchValue({
        txtNumberofadults: this.sessionCallBackHealthData.NoOfAdult,
        txtnumberofchilds: this.sessionCallBackHealthData.NoOfKids,
        txtpincode: this.sessionCallBackHealthData.PinCode,
        txtPolicyType: this.selectedpolicyType,
        txtName: this.sessionCallBackHealthData.Name
      });

      if ((this.selectedpolicyType == 'max' || this.selectedpolicyType == 'arog' || this.selectedpolicyType == 'abc' || this.selectedpolicyType == 'hb' || this.selectedpolicyType == 'ab')
        && (this.myForm.controls[`txtNumberofadults`].value > 2 || (this.myForm.controls[`txtNumberofadults`].value == 1 && this.myForm.controls['txtnumberofchilds'].value == 3))) {
        this.numberofAdults = 0;
        this.numberofChildss = 0;
        this.myForm.controls['txtNumberofadults'].setValue(0);
        this.myForm.controls['txtnumberofchilds'].setValue(0);
      } else if (this.selectedpolicyType == 'elevate'
        && (this.myForm.controls[`txtNumberofadults`].value > 2 || (this.myForm.controls[`txtNumberofadults`].value == 1 && this.myForm.controls['txtnumberofchilds'].value > 3))) {
        this.numberofAdults = 0;
        this.numberofChildss = 0;
        this.myForm.controls['txtNumberofadults'].setValue(0);
        this.myForm.controls['txtnumberofchilds'].setValue(0);
      }

      if (!Utility.IsNullOrEmpty(this.myForm.controls['txtNumberofadults'].value)) {
        this.numberofAdults = parseInt(this.myForm.controls['txtNumberofadults'].value);
        if (this.numberofAdults > 0) {
          this.isAdultDobVaildated = this.numberofAdults > 0;

          // Loop through each adult and set their DOB if the form controls exist
          for (let i = 1; i <= this.numberofAdults; i++) {
            const monthControl = this.myForm.controls[`txtadult${i}month`];
            const dateControl = this.myForm.controls[`txtadult${i}date`];
            const yearControl = this.myForm.controls[`txtadult${i}year`];

            // Check if form controls exist and have values
            if (monthControl && dateControl && yearControl &&
              monthControl.value && dateControl.value && yearControl.value) {
              this.adultDOB[i] = `${monthControl.value}/${dateControl.value}/${yearControl.value}`;
            }
          }
        }
      }
      if (!Utility.IsNullOrEmpty(this.myForm.controls['txtnumberofchilds'].value)) {
        this.numberofChildss = parseInt(this.myForm.controls['txtnumberofchilds'].value);
        if (this.numberofChildss > 0) {
          this.isKidDobValidated = this.numberofChildss > 0;

          // Loop through each adult and set their DOB if the form controls exist
          for (let i = 1; i <= this.numberofChildss; i++) {
            const monthControl = this.myForm.controls[`txtKid${i}Month`];
            const dateControl = this.myForm.controls[`txtKid${i}Date`];
            const yearControl = this.myForm.controls[`txtKid${i}Year`];

            // Check if form controls exist and have values
            if (monthControl && dateControl && yearControl &&
              monthControl.value && dateControl.value && yearControl.value) {
              this.kidDOB[i] = `${monthControl.value}/${dateControl.value}/${yearControl.value}`;
            }
          }

        }
      }

      if (!Utility.IsNullOrEmpty(this.myForm.controls['txtpincode'].value)) {
        this.validatePincode(this.myForm.controls['txtpincode'].value)
        //this.childPinCodeEvent.emit(this.myForm.controls['txtpincode'].value);
      }

      this.sessionArray.forEach(item => {
        window.sessionStorage.removeItem(item);
      });
    }
    else if (changes['sessionCallBackHealthData'].currentValue !== undefined) {
      this.sessionArray.forEach(item => {
        window.sessionStorage.removeItem(item);
      });
    }
  }

  createForm() {
    try {
      this.myForm = this.formBuilder.group(
        {
          txtPolicyType: this.selectedpolicyType,
          txtmobilenumber: new FormControl("", [Validators.required, Validators.minLength(10), Validators.pattern('^[^0-5][^/S][0-9,*]{8}$')]),
          //txtmobilenumber: new FormControl("", [Validators.required, Validators.minLength(10), Validators.pattern(/^(?!9999999999$)\d{10}$/)]),
          txtemail: new FormControl("", [Validators.required, Validators.pattern(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,4})$/)]),
          txtName: new FormControl(""),
          txtpincode: new FormControl("", [Validators.required, Validators.minLength(6)]),
          txtNumberofadults: new FormControl({ value: 0, disabled: true }),
          txtnumberofchilds: new FormControl({ value: 0, disabled: true }),
        });

      for (let i = 0; i < this.maxAdults; i++) {
        const controlName1 = `txtadult${i + 1}date`;
        this.myForm.addControl(controlName1, this.formBuilder.control(''));
        const controlName2 = `txtadult${i + 1}month`;
        this.myForm.addControl(controlName2, this.formBuilder.control(''));
        const controlName3 = `txtadult${i + 1}year`;
        this.myForm.addControl(controlName3, this.formBuilder.control(''));
      }
      for (let i = 0; i < this.maxKids; i++) {
        const controlName4 = `txtKid${i + 1}Date`;
        this.myForm.addControl(controlName4, this.formBuilder.control(''));
        const controlName5 = `txtKid${i + 1}Month`;
        this.myForm.addControl(controlName5, this.formBuilder.control(''));
        const controlName6 = `txtKid${i + 1}Year`;
        this.myForm.addControl(controlName6, this.formBuilder.control(''));
      }

      this.isFormCreated = true;
    }
    catch (error) {
      console.log('Please try again cc!!'); // Log the error message
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

  whatsAppOpt() {
    try {
      if (this.txtmobilenumber && this.txtmobilenumber.value.length == 10) {

        var dob1 = null;
        var dob2 = null;
        if (this.numberofAdults == 2) {
          dob1 = this.adultDOB[1];
          dob2 = this.adultDOB[2];
        } else if (this.numberofAdults == 1) {
          dob1 = this.adultDOB[1];
        }
        var data: any;
        data =
        {
          MobileNo: Utility.ecryptData(this.txtmobilenumber.value),
          EmailID: this.txtemail.value,
          Product: this.getProductName(this.selectedpolicyType),
          ProductCode: this.getProductCode(this.selectedpolicyType),
          PolicySubType: this.getPolicySubType(this.selectedpolicyType),
          NoOfAdults: this.numberofAdults,
          NoOfKids: this.numberofChildss,
          Insured1_Dob: dob1,
          Insured2_Dob: dob2,
        };

        this.childMobileNoEvent.emit(data);
      }
    }
    catch (error) {
      console.log(error);
    }
  }
  isDOBEntered(): boolean {
    if (this.adultDOB && this.adultDOB.some(dob => dob && dob.trim().length > 0)) {
      return true;
    }

    if (this.kidDOB && this.kidDOB.some(dob => dob && dob.trim().length > 0)) {
      return true;
    }

    return false;
  }

  showGetQuoteButton(): boolean {

    if (this.isMobile) {
      return false;
    }

    if ((this.selectedpolicyType == 'hap' || this.selectedpolicyType == 'elevate' || this.selectedpolicyType == 'abc' || this.selectedpolicyType == 'max' || this.selectedpolicyType == 'ab')
      && this.txtpincode && this.txtpincode.valid && !this.PincodeInvalid
      && this.txtmobilenumber && this.txtmobilenumber.valid
      && this.txtemail && this.txtemail.valid
      && this.isDOBEntered()) {
      return false;
    }
    else if (this.selectedpolicyType == 'arog' || this.selectedpolicyType == 'hb' || this.selectedpolicyType == 'pp') {
      return false;
    }
    return true;
  }

  showInsuredMemberDetailsPopup() {
    try {
      this.ismemberDetailsPopup = true;
      this.isAdultDobVaildated = false;
    }
    catch (error) {
      console.log(error);
    }
  }

  closeInsureMemberDetails() {
    try {
      if (this.validateInsuredMembersSection() == true) {
        this.ismemberDetailsPopup = false;
        this.isAdultDobVaildated = true;
        IL_GTM.pushCustomGAEvent('custom_event', this.selectedpolicyType + '_lp_int', 'Adult(s) date of birth', this.numberofAdults.toString());
      }
      else {
        this.isAdultDobVaildated = false;
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  //original function - to decrement adultDOB
  changeAdultCountMinus(number: number) {
    this.insuredDetailsErrorMessage = "";
    this.showInsuredMemberDetailsPopup();
    if ((number == 1 && this.numberofAdults < this.maxAdults) || (number == -1 && this.numberofAdults > 0)) {
      this.numberofAdults = this.numberofAdults + number;
      this.myForm.patchValue({ txtNumberofadults: this.numberofAdults });
      this.myForm.patchValue({ txtnumberofchilds: 0 });
      this.kidDOB = [];
      this.numberofChildss = 0;
      this.isKidDobValidated = false;
      this.submitted = false;

      for (let i = 1; i <= this.maxKids; i++) {
        const kidDateControl = this.myForm.get(`txtKid${i}Date`);
        const kidMonthControl = this.myForm.get(`txtKid${i}Month`);
        const kidYearControl = this.myForm.get(`txtKid${i}Year`);
        kidDateControl?.patchValue("");
        kidMonthControl?.patchValue("");
        kidYearControl?.patchValue("");
        this.isKidDOBValid[i] = false;
      }

    }
    if (this.numberofAdults == this.maxAdults) { this.insuredDetailsErrorMessage = "Not more than 6 adults can be selected"; }

    if (this.numberofAdults == 0) {
      this.adultDOB = [];
      this.kidDOB = [];
    }

    for (let i = 1; i <= this.maxAdults; i++) {
      const adultDateControl = this.myForm.get(`txtadult${i}date`);
      const adultMonthControl = this.myForm.get(`txtadult${i}month`);
      const adultYearControl = this.myForm.get(`txtadult${i}year`);

      if (this.numberofAdults < i) {
        adultDateControl?.patchValue("");
        adultMonthControl?.patchValue("");
        adultYearControl?.patchValue("");
        this.isAdultDOBValid[i] = false;
        this.activebtn();
      }
    }
  }

  //original function - to increment adultDOB
  changeAdultCount(number: number) {
    this.isEnable = false;
    try {
      this.insuredDetailsErrorMessage = "";
      this.showInsuredMemberDetailsPopup();


      if ((number == 1 && this.numberofAdults < this.maxAdults) || (number == -1 && this.numberofAdults > 0)) {

        this.numberofAdults = this.numberofAdults + number;
        this.myForm.patchValue({ txtNumberofadults: this.numberofAdults });
        this.myForm.patchValue({ txtnumberofchilds: 0 });
        this.kidDOB = [];
        this.numberofChildss = 0;
        this.isKidDobValidated = false;

        this.submitted = false;

        for (let i = 1; i <= this.maxKids; i++) {
          const kidDateControl = this.myForm.get(`txtKid${i}Date`);
          const kidMonthControl = this.myForm.get(`txtKid${i}Month`);
          const kidYearControl = this.myForm.get(`txtKid${i}Year`);
          kidDateControl?.patchValue("");
          kidMonthControl?.patchValue("");
          kidYearControl?.patchValue("");
          this.isKidDOBValid[i] = false;
        }
      }
      if (this.numberofAdults == this.maxAdults) { this.insuredDetailsErrorMessage = "Not more than 6 adults can be selected"; }
    }
    catch (error) { /* empty */ }
  }

  //Combined function - does incr, decr, and remove Adult DOB at index
  updateAdultCount(number: number, index?: number) {
    try {
      this.insuredDetailsErrorMessage = "";
      this.showInsuredMemberDetailsPopup();

      //to remove adult DOB at specific index 
      if (number === 0 && index != undefined) {

        const i = index + 1;

        //shift DOB values upward if its not last
        for (let j = i; j < this.numberofAdults; j++) {
          this.myForm.get(`txtadult${j}date`)?.patchValue(this.myForm.get(`txtadult${j + 1}date`)?.value);
          this.myForm.get(`txtadult${j}month`)?.patchValue(this.myForm.get(`txtadult${j + 1}month`)?.value);
          this.myForm.get(`txtadult${j}year`)?.patchValue(this.myForm.get(`txtadult${j + 1}year`)?.value);
          this.isAdultDOBValid[j] = this.isAdultDOBValid[j + 1];
        }

        //clear the last field of adult
        const last = this.numberofAdults;
        this.myForm.get(`txtadult${last}date`)?.patchValue('');
        this.myForm.get(`txtadult${last}month`)?.patchValue('');
        this.myForm.get(`txtadult${last}year`)?.patchValue('');

        //decrement adult count
        this.numberofAdults--;
        this.myForm.patchValue({ txtNumberofadults: this.numberofAdults });

      } else {  //to increment or decrement based on +1/-1

        //check for add/remove adults based on current adult count
        if ((number === 1 && this.numberofAdults < this.maxAdults) || (number === -1 && this.numberofAdults > 0)) {

          //update adult count
          this.numberofAdults += number;
          this.myForm.patchValue({ txtNumberofadults: this.numberofAdults });

        }

        //error message for max limit
        if (this.numberofAdults === this.maxAdults) {
          this.insuredDetailsErrorMessage = "Not more than 6 adults can be selected";
        }

        //clearing values
        for (let i = 1; i <= this.maxAdults; i++) {
          if (this.numberofAdults < i) {
            this.myForm.get(`txtadult${i}date`)?.patchValue("");
            this.myForm.get(`txtadult${i}month`)?.patchValue("");
            this.myForm.get(`txtadult${i}year`)?.patchValue("");
            this.isAdultDOBValid[i] = false;

            this.activebtn();
          }
        }
      }
      if (this.numberofAdults === 0) this.adultDOB = [];

      if (this.numberofAdults === 0 && this.numberofChildss === 0) {
        this.isMember = true; 
      } else {
        this.isMember = false; 
      }

      //reset kid info
      this.myForm.patchValue({ txtnumberofchilds: 0 });
      this.kidDOB = [];
      this.numberofChildss = 0;
      this.isKidDobValidated = false;

      this.submitted = false;

      //clear out all kid DOB fields
      for (let i = 1; i <= this.maxKids; i++) {
        this.myForm.get(`txtKid${i}Date`)?.patchValue("");
        this.myForm.get(`txtKid${i}Month`)?.patchValue("");
        this.myForm.get(`txtKid${i}Year`)?.patchValue("");
        this.isKidDOBValid[i] = false;
      }

    } catch (error) {
      console.log(error);
    }
  }
  //original function - to increment/decrement kidDOB count
  changeKidCount(number: number) {
    try {
      if (this.numberofAdults == 0) {
        this.maxKids = 1;
      }
      if (this.numberofAdults == 1) {
        this.maxKids = 2;
      }
      if (this.numberofAdults == 2) {
        this.maxKids = 3;
      }
      this.kidsDetailErrorMessage = "";
      this.showInsuredKidDetailsPopup();
      if ((number == 1 && this.numberofChildss < this.maxKids) || (number == -1 && this.numberofChildss > 0)) {
        this.kidDOB = [];
        this.numberofChildss = this.numberofChildss + number;
        for (let i = 2; i >= 0; i--) {
          if (i == this.numberofChildss && number == -1) {
            const kidDateControl = this.myForm.get(`txtKid${i + 1}Date`);
            const kidMonthControl = this.myForm.get(`txtKid${i + 1}Month`);
            const kidYearControl = this.myForm.get(`txtKid${i + 1}Year`);


            if (kidDateControl && kidMonthControl && kidYearControl) {
              kidDateControl.patchValue("");
              kidMonthControl.patchValue("");
              kidYearControl.patchValue("");
              this.isKidDOBValid[i + 1] = false;
              this.activebtn();
            }
          }
        }

        if (this.myForm)
          this.myForm.patchValue({ txtnumberofchilds: this.numberofChildss.toString() });
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  //combined function - to incr, decr and remove Kid dob at specific index
  updateKidCount(number: number, index?: number) {
    try {
      //to remove DOB at specifc index 
      if (number === 0) {

        const i = index + 1;

        //shift DOB values upward if its not last
        for (let j = i; j < this.numberofChildss; j++) {
          this.myForm.get(`txtKid${j}Date`)?.patchValue(this.myForm.get(`txtKid${j + 1}Date`)?.value);
          this.myForm.get(`txtKid${j}Month`)?.patchValue(this.myForm.get(`txtKid${j + 1}Month`)?.value);
          this.myForm.get(`txtKid${j}Year`)?.patchValue(this.myForm.get(`txtKid${j + 1}Year`)?.value);
          this.isKidDOBValid[j] = this.isKidDOBValid[j + 1];
        }

        //clear the last field
        const last = this.numberofChildss;
        this.myForm.get(`txtKid${last}Date`)?.patchValue('');
        this.myForm.get(`txtKid${last}Month`)?.patchValue('');
        this.myForm.get(`txtKid${last}Year`)?.patchValue('');
        this.isKidDOBValid[last] = false;

        //decrement kid count
        this.numberofChildss--;
        this.myForm.patchValue({ txtnumberofchilds: this.numberofChildss });

      } else { //to increment/decrement based on +1/-1

        //setting maxKids based on current number of adults
        if (this.numberofAdults === 0) this.maxKids = 1;
        if (this.numberofAdults === 1) this.maxKids = 3;
        if (this.numberofAdults === 2) this.maxKids = 3;

        //reset error and show popup
        this.kidsDetailErrorMessage = "";
        this.showInsuredKidDetailsPopup();

        if ((number === 1 && this.numberofChildss < this.maxKids) || (number === -1 && this.numberofChildss > 0)) {

          //update count
          this.numberofChildss += number;

          if (this.myForm)
            this.myForm.patchValue({ txtnumberofchilds: this.numberofChildss.toString() });

          //clear all unused kid DOB fields 
          for (let i = 1; i <= this.maxKids; i++) {
            if (this.numberofChildss < i) {
              this.myForm.get(`txtKid${i}Date`)?.patchValue("");
              this.myForm.get(`txtKid${i}Month`)?.patchValue("");
              this.myForm.get(`txtKid${i}Year`)?.patchValue("");
              this.isKidDOBValid[i] = false;
              this.activebtn();
            }
          }
        }
      }
      if (this.numberofChildss === 0) this.kidDOB = [];

      if (this.numberofAdults === 0 && this.numberofChildss === 0) {
        this.isMember = true;
      } else {
        this.isMember = false;
      }

    } catch (error) {
      console.log(error);
    }
  }

  activebtn() {
    try {
      if (this.numberofAdults > 1 || this.numberofChildss > 1) {
        if ((this.dd1.nativeElement.value.length > 1 && this.mm1.nativeElement.value.length > 1 && this.yyyy1.nativeElement.value.length > 3) &&
          (this.dd2.nativeElement.value.length > 1 && this.mm2.nativeElement.value.length > 1 && this.yyyy2.nativeElement.value.length > 3)) {
          this.isEnable = true;
        }
        else {
          this.isEnable = false;
        }
      }
      else {
        if ((this.dd1.nativeElement.value.length > 1 && this.mm1.nativeElement.value.length > 1 && this.yyyy1.nativeElement.value.length > 3)) {
          this.isEnable = true;
        }
        else {
          this.isEnable = false;
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  validateInsuredMembersSection() {
    try {
      let minAge = 21;
      let maxAge = 125;
      const maxDay = 0;
      const minDay = 0;
      const maxMonth = 0;
      const minMonth = 0;

      if (this.selectedpolicyType && this.selectedpolicyType == "hap") { minAge = 18; maxAge = 125; }
      if (this.selectedpolicyType && this.selectedpolicyType == "max") { maxAge = 65; }
      if (this.selectedpolicyType && this.selectedpolicyType == "arog") { maxAge = 65; }
      if (this.selectedpolicyType && this.selectedpolicyType == "hb") { maxAge = 125; }
      if (this.selectedpolicyType && this.selectedpolicyType == "elevate") { minAge = 18; maxAge = 125; }
      if (this.selectedpolicyType && this.selectedpolicyType == "abc") { minAge = 18; maxAge = 125; }
      if (this.selectedpolicyType && this.selectedpolicyType == "ab") { minAge = 18; maxAge = 125; }


      this.adultDOB = [];
      let isValid: boolean = true;
      let validateDob: any = null;
      for (let i = 0; i < this.maxAdults; i++) {
        this.isAdultDOBValid[i + 1] = false;
      }

      for (let i = 0; i < this.numberofAdults; i++) {
        const dateControl = this.myForm.get(`txtadult${i + 1}date`);
        const monthControl = this.myForm.get(`txtadult${i + 1}month`);
        const yearControl = this.myForm.get(`txtadult${i + 1}year`);

        // Check if any of the DOB controls are invalid and mark true to show validations
        if (Utility.IsNullOrEmpty(dateControl?.value) || Utility.IsNullOrEmpty(monthControl?.value) || Utility.IsNullOrEmpty(yearControl?.value)) {
          this.isAdultDOBValid[i + 1] = true;
          isValid = false;
        } else {
          if (monthControl && dateControl && yearControl &&
            monthControl.value && dateControl.value && yearControl.value) {
            const month = monthControl.value;
            const date = dateControl.value;
            const year = yearControl.value;

            // Construct the DOB string and assign it to the corresponding index in adultDOBs array
            this.adultDOB[i + 1] = `${month}/${date}/${year}`;
            validateDob = `${date}/${month}/${year}`;
          }
          // Perform DOB validation
          if (!Utility.isValidDOB(validateDob, minAge, maxAge, maxMonth, minMonth, maxDay, minDay)) {
            this.isAdultDOBValid[i + 1] = true;
            isValid = false;
          }
        }
      }
      return isValid;
    }
    catch (error) {
      return;
    }
  }

  validateInsuredkidSection() {
    try {

      const minAge = 0;
      let maxAge = 25;
      const maxDay = 0;
      const minDay = 0;
      const maxMonth = 3;
      const minMonth = 0;

      if (this.selectedpolicyType && this.selectedpolicyType == "hap") { maxAge = 25; }
      if (this.selectedpolicyType && this.selectedpolicyType == "max") { maxAge = 20; }
      if (this.selectedpolicyType && this.selectedpolicyType == "arog") { maxAge = 20; }
      if (this.selectedpolicyType && this.selectedpolicyType == "hb") { maxAge = 20; }
      if (this.selectedpolicyType && (this.selectedpolicyType == "elevate" || this.selectedpolicyType == "abc" || this.selectedpolicyType == "ab")) { maxAge = 30; }

      this.kidDOB = [];
      let isValid: boolean = true;
      let validateDob: any = null;

      for (let i = 0; i < this.maxKids; i++) {
        this.isKidDOBValid[i + 1] = false;
      }

      for (let i = 0; i < this.numberofChildss; i++) {
        const dateControl = this.myForm.get(`txtKid${i + 1}Date`);
        const monthControl = this.myForm.get(`txtKid${i + 1}Month`);
        const yearControl = this.myForm.get(`txtKid${i + 1}Year`);

        // Check if any of the DOB controls are invalid and mark true to show validations
        if (Utility.IsNullOrEmpty(dateControl?.value) || Utility.IsNullOrEmpty(monthControl?.value) || Utility.IsNullOrEmpty(yearControl?.value)) {
          this.isKidDOBValid[i + 1] = true;
          isValid = false;
        } else {
          if (monthControl && dateControl && yearControl &&
            monthControl.value && dateControl.value && yearControl.value) {
            const month = monthControl.value;
            const date = dateControl.value;
            const year = yearControl.value;

            // Construct the DOB string and assign it to the corresponding index in adultDOBs array
            this.kidDOB[i + 1] = `${month}/${date}/${year}`;
            validateDob = `${date}/${month}/${year}`;
          }
          // Perform DOB validation
          if (this.numberofAdults == 0 && this.numberofChildss == 1 && this.selectedpolicyType == 'hap') {
            if (!Utility.isValidDOB(validateDob, 6, 25, 0, 0, 0, 0)) {
              this.isKidDOBValid[i + 1] = true;
              isValid = false;
            }
          }
          if (this.numberofAdults == 0 && this.numberofChildss == 1 && (this.selectedpolicyType == 'elevate' || this.selectedpolicyType == 'abc' || this.selectedpolicyType == 'ab')) {
            if (!Utility.isValidDOB(validateDob, 6, 30, 0, 0, 0, 0)) {
              this.isKidDOBValid[i + 1] = true;
              isValid = false;
            }
          }
          else if (!Utility.isValidDOB(validateDob, minAge, maxAge, maxMonth, minMonth, maxDay, minDay)) {
            this.isKidDOBValid[i + 1] = true;
            isValid = false;
          }
        }
      }
      return isValid;
    }
    catch (error) {
      return;
    }
  }


  /*validatePincode(e: any) {
    if (this.txtpincode.value.length <= 5) {
      this.PincodeInvalid = true;
      //this.PincodeSubmitted = false;
    }
    else if (this.txtpincode && this.txtpincode.value.length === 6) {
      this.PincodeSubmitted = true;
      this.isValidatePin=true;
      //this.childPinCodeEvent.emit(this.txtpincode.value);
      this.mobileApiService.getCityDistrictByPincode(this.txtpincode.value).then((res: any) => {
        this.isValidatePin=false;
        if (res && res.countryId !== 0) {
          this._userData.PinCode = this.txtpincode.value;
          this._userData.City = res.cityDistrictName.split(',')[0].trim();
          this._userData.State = res.cityDistrictName.split(',')[1].trim();
          this.PincodeInvalid = false;
        }
        else {
          this.PincodeInvalid = true;
          this.PincodeSubmitted = true;
        }
      }).catch(() => {
        this.isValidatePin=false;
        this.PincodeSubmitted = true;
        this.PincodeInvalid = true; // Handle any errors from the API call
      });
      //this.gaEvent('Pincode');
    }
    
  }*/
  /*validatePincode(e: any) {
    if (this.txtpincode.value.length <= 5) {
      this.PincodeInvalid = true;
      //this.PincodeSubmitted = false;
    }
    else if (this.txtpincode && this.txtpincode.value.length === 6) {
      this.PincodeSubmitted = true;
      this.isValidatePin = true;
      //this.childPinCodeEvent.emit(this.txtpincode.value);
      const pincodemodel: pincodeRequestModel = { pincode: e };
      this.mobileApiService.getCityDistrictByPincode(pincodemodel).then((res: any) => {
        this.isValidatePin = false;
        if (res && res.StateId !== 0) {
          this.PinCodeData.PinCode = res.PinCode;
          this.PinCodeData.City = res.CityDistrictName;
          this._userData.PinCode = res.PinCode;
          this._userData.City = res.CityDistrictName;
          this._userData.State = res.StateName;
          this.PincodeInvalid = false;
        }
        else {
          this.PincodeInvalid = true;
          this.PincodeSubmitted = true;
        }
      }).catch(() => {
        this.isValidatePin = false;
        this.PincodeSubmitted = true;
        this.PincodeInvalid = true; // Handle any errors from the API call
      });
      //this.gaEvent('Pincode');
    }

  }*/

  validatePincode(e: any) {
    if (this.txtpincode.value.length <= 5) {
      this.PincodeInvalid = true;
      return;
    }

    if (this.txtpincode && this.txtpincode.value.length === 6) {
      this.PincodeSubmitted = true;
      this.isValidatePin = true;
      const pincodemodel: pincodeRequestModel = { pincode: this.txtpincode.value };
      const handleResponse = (res: any) => {
        this.isValidatePin = false;
        if (res && res.StateId !== 0) {
          this.PinCodeData.PinCode = res.PinCode;
          this.PinCodeData.City = res.CityDistrictName;
          this._userData.PinCode = res.PinCode;
          this._userData.City = res.CityDistrictName;
          this._userData.State = res.StateName;
          if (res.Zone) {
            if (res.Zone === 'Zone I') {
              this._userData.Zone = "1";
            } else if (res.Zone === 'Zone II') {
              this._userData.Zone = "2";
            } else if (res.Zone === 'Zone III') {
              this._userData.Zone = "3";
            } else if (res.Zone === 'Zone IV') {
              this._userData.Zone = "4";
            }
          }
          this.PincodeInvalid = false;
        } else {
          this.PincodeInvalid = true;
          this.PincodeSubmitted = true;
        }
      };

      const handleError = () => {
        this.isValidatePin = false;
        this.PincodeSubmitted = true;
        this.PincodeInvalid = true;
      };

      if (this.selectedpolicyType === 'max') {
        this.mobileApiService.getCityDistrictByPincode(pincodemodel)
          .then(handleResponse)
          .catch(handleError);
      } else {
        this.mobileApiService.getCityDistrictByPincodeArtemis(pincodemodel)
          .then(handleResponse)
          .catch(handleError);
      }

    }
  }


  closePopup() {
    this.showPopup = false;
  }

  getFinalKidCount() {
    if (this.selectedpolicyType == 'max' && this.numberofChildss > 0) {
      return
    }
    else {
      let count = 0;
      for (let i = 0; i < this.numberofChildss; i++) {
        const dateControl = this.myForm.get(`txtKid${i + 1}Date`);
        const monthControl = this.myForm.get(`txtKid${i + 1}Month`);
        const yearControl = this.myForm.get(`txtKid${i + 1}Year`);
        if (dateControl?.value && monthControl?.value && yearControl?.value) {
          count++;
          this.isKidDOBValid[i] = true;

        } else {
          this.isKidDOBValid[i] = false;

        }
      }
      this.numberofChildss = count;
    }
  }

  onNameInput(event: any): void {
    const sanitized = event.target.value.replace(/[^A-Za-z\s.'/]/g, '');
    if (sanitized !== event.target.value) {
      event.target.value = sanitized;
      this.myForm.controls['txtName'].setValue(sanitized, { emitEvent: false });
    }
  }
  proceed() {
    this.isMember = false;
    if (this.isMobile) {
      setTimeout(() => {
        window.scrollTo({
          top: 0, behavior: "smooth"
        });
      }, 100);
      if ((this.selectedpolicyType == 'hap' || this.selectedpolicyType == 'elevate' || this.selectedpolicyType == 'abc' || this.selectedpolicyType == 'hb' || this.selectedpolicyType == 'ab') && this.numberofAdults == 0 && this.numberofChildss == 0) {
        this.isMember = true;
        this.isAdultDobVaildated = false;
        this.isKidDobValidated = false;
      }
      else if ((this.selectedpolicyType == 'max' || this.selectedpolicyType == 'arog') && this.numberofAdults == 0) {
        this.isMember = true;
        this.isAdultDobVaildated = false;
        this.isKidDobValidated = false;
      }
      this.myForm.markAllAsTouched();
      this.myForm.updateValueAndValidity();
      if (this.txtpincode?.invalid || this.PincodeInvalid) {
        if (!this.PincodeInvalid) {
          this.validatePincode(this.txtpincode.value);
        }
        this.PincodeSubmitted = true;
        return;
      }
    }

    if (this.txtmobilenumber.value == 9999999999 && this.selectedpolicyType == 'ab') {
      this.showErrMessage = true;
    } else {
      this.showErrMessage = false;
    }

    if (this.numberofAdults > 0 && !this.validateInsuredMembersSection()) {
      return
    }

    if (this.selectedpolicyType != 'max') {
      if (this.numberofChildss > 0 && !this.validateInsuredkidSection()) {
        return
      }
    }


    this.submitted = true;
    this.getFinalKidCount();
    if (this.isMobileClicked && this.txtmobilenumber) {
      this.txtmobilenumber.setValidators(Constants.mobileNumberValidation);
      this.txtmobilenumber.updateValueAndValidity();
    }

    if (this.isEmailClicked && this.txtemail) {
      this.txtemail.setValidators([Validators.required]);
    }

    if ((this.selectedpolicyType == 'hap' || this.selectedpolicyType == 'elevate' || this.selectedpolicyType == 'abc' || this.selectedpolicyType == 'hb' || this.selectedpolicyType == 'ab') && this.numberofAdults == 0 && this.numberofChildss == 0) {
      //this.childErrorPopupEvent.emit(true);
      this.isMember = true;
      this.isAdultDobVaildated = false;
      this.isKidDobValidated = false;
    }
    else if ((this.selectedpolicyType == 'max' || this.selectedpolicyType == 'arog') && this.numberofAdults == 0) {
      //this.childErrorPopupEvent.emit(true);
      this.isMember = true;
      this.isAdultDobVaildated = false;
      this.isKidDobValidated = false;
    }

    if (this.selectedpolicyType == 'pp' && this.txtmobilenumber && this.txtmobilenumber.valid && this.txtemail && this.txtemail.valid) {
      const policyType = this.selectedpolicyType;
      this.prepare_userData(policyType);
      this.childGetQuoteEvent.emit({ data: this._userData, popupStatus: this.showPopup });
    }
    else if ((this.isAdultDobVaildated || (this.numberofAdults == 0 && this.numberofChildss != 0 && this.validateInsuredkidSection() == true))
      && this.txtmobilenumber && this.txtmobilenumber.valid && this.txtemail && this.txtemail.valid) {

      const policyType = this.selectedpolicyType;
      this.prepare_userData(policyType);
      this.childGetQuoteEvent.emit({ data: this._userData, popupStatus: this.showPopup });
    }
  }




  prepare_userData(policyType: any) {
    try {
      if (policyType == "hap") {
        this._userData.healthTransfor = "CHI";
        this._userData.tabId = 'chiSubmit';
        this._userData.whatupagreeid = "health-whatsappcheck2";
        this._userData.whatupmanageid = "health-managewht2";
      }
      else if (policyType == "elevate") {
        this._userData.healthTransfor = "ELEVATE";
        this._userData.tabId = 'elevateSubmit';
        this._userData.whatupagreeid = "health-whatsappcheck2";
        this._userData.whatupmanageid = "health-managewht2";
      }
      else if (policyType == "abc") {
        this._userData.healthTransfor = "ACTIVATE BOOSTER COMBO";
        this._userData.tabId = 'abcSubmit';
        this._userData.whatupagreeid = "health-whatsappcheck2";
        this._userData.whatupmanageid = "health-managewht2";
      }
      else if (policyType == "ab") {
        this._userData.healthTransfor = "ACTIVATE BOOSTER";
        this._userData.tabId = 'abSubmit';
        this._userData.whatupagreeid = "health-whatsappcheck2";
        this._userData.whatupmanageid = "health-managewht2";
      }
      else if (policyType == "max") {
        this._userData.healthTransfor = "MP";
        this._userData.tabId = 'maxprotecSubmit';
        this._userData.whatupagreeid = "health-whatsappcheck2";
        this._userData.whatupmanageid = "health-managewht2";
      }
      else if (policyType == "arog") {
        this._userData.tabId = "argSubmit";
        this._userData.EldestDateofBirth = "";
        this._userData.EldestMemberDOB = "";
        this._userData.healthTransfor = "arog";
        this._userData.PlanType = "T1";
        this._userData.SumInsured = "400000";
        this._userData.tenure = "1";
        this._userData.EmailID = this.txtemail && this.txtemail.value;
        this._userData.NoOfAdults = this.numberofAdults.toString();

        if (this.txtadult1month?.value && this.txtadult1date?.value && this.txtadult1year?.value)
          this._userData.AgeGroup1 = this.txtadult1year.value + "-" + this.txtadult1month.value + "-" + this.txtadult1date.value;
        else
          this._userData.AgeGroup1 = "";

        if (this.txtadult2month?.value && this.txtadult2date?.value && this.txtadult2year?.value)
          this._userData.AgeGroup2 = this.txtadult2year.value + "-" + this.txtadult2month.value + "-" + this.txtadult2date.value;
        else
          this._userData.AgeGroup2 = "";
      }
      else if (policyType == "hb") {
        this._userData.healthTransfor = "HB";
        this._userData.tabId = 'hbSubmit';
        this._userData.hbAgeSlabString = '6-20|21-25|26-30|31-35|36-40|41-45|46-50|51-55|56-60|61-65|66-70|71-75|76-80|81-125';
        this._userData.hbAgeSlabStringForHBPlanTable = '6-20|21-25|26-35|36-45|46-50|51-55|56-60|61-65|66-70|71-75|76-80|81-125';
        this._userData.hbMaxAge = '125';
        this._userData.hbMinAge = '6';
        this._userData.whatupagreeid = "health-whatsappcheck1";
        this._userData.whatupmanageid = "health-managewht1";
      }
      else if (policyType == "pp") {
        this._userData.healthTransfor = "PP";
        this._userData.tabId = 'ppSubmit';
        this._userData.whatupagreeid = "health-whatsappcheck3";
        this._userData.whatupmanageid = "health-managewht3";
      }
      this._userData.SelectedPolicyType = policyType;
      if (policyType == "hap" || policyType == "hb" || policyType == "max" || policyType == "arog" || policyType == "pp" || policyType == "elevate" || policyType == "abc" || policyType == "ab") {
        this._userData.HealthType = "";
        this._userData.LandingURL = window.location.href;
        this._userData.IsBeFit = false;

        this._userData.Name = this.txtName && this.txtName.value;
        this._userData.MobileNo = this.txtmobilenumber && this.txtmobilenumber.value;
        this._userData.EmailIdWithoutMask = this.txtemail && this.txtemail.value;
        this._userData.MobileNoWithoutMask = this.txtmobilenumber && this.txtmobilenumber.value;

        if (policyType == "hap" || policyType == "max" || policyType == "elevate" || policyType == "abc" || policyType == "ab") {
          if (this.txtpincode.value !== undefined && this.txtpincode.value != null) {
            //this._userData.PinCode = this.PinCodeData.PinCode;
            //this._userData.City = this.PinCodeData.City;
            //this._userData.State = this.PinCodeData.State;
          }
        }

        this._userData.NoOfKids = this.numberofChildss.toString();

        if (policyType !== 'arog' && policyType !== 'hap' && policyType !== 'elevate' && policyType !== 'abc' && policyType !== 'ab') {
          this._userData.EmailId = this.txtemail && this.txtemail.value;
          this._userData.NoOfAdult = this.numberofAdults.toString();
          if (this.numberofAdults >= 1)
            this._userData.Adult1DOB = this.adultDOB[1];
          else
            this._userData.Adult1DOB = "";
          if (this.numberofAdults > 1)
            this._userData.Adult2DOB = this.adultDOB[2];
          else
            this._userData.Adult2DOB = "";
        }

        if (policyType == 'hap' || policyType == 'elevate' || policyType == 'abc' || policyType == 'ab') {
          this._userData.EmailId = this.txtemail && this.txtemail.value;
          this._userData.NoOfAdult = this.numberofAdults.toString();

          this._userData.Relations = [];
          const relationsToAdd: { DateOfBirth: string; KidAdultType: number; }[] = [];

          this.adultDOB.forEach((dob) => {
            const relation = { DateOfBirth: dob, KidAdultType: 2 };
            relationsToAdd.push(relation);
          });
          this.kidDOB.forEach((dob) => {
            const relation = { DateOfBirth: dob, KidAdultType: 0 };
            relationsToAdd.push(relation);
          });
          this._userData.Relations.push(...relationsToAdd);

          if (policyType == 'hap' && (!Utility.IsNullOrEmpty(this.adultDOB[1]) || !Utility.IsNullOrEmpty(this.adultDOB[2]) || !Utility.IsNullOrEmpty(this.adultDOB[3]) ||
            !Utility.IsNullOrEmpty(this.adultDOB[4]) || !Utility.IsNullOrEmpty(this.adultDOB[5]) || !Utility.IsNullOrEmpty(this.adultDOB[6]))) {
            const A1DOB = this.adultDOB && this.adultDOB[1] ? this.isOlderThan65(new Date(this.adultDOB[1])) : "";
            const A2DOB = this.adultDOB && this.adultDOB[2] ? this.isOlderThan65(new Date(this.adultDOB[2])) : "";
            const A3DOB = this.adultDOB && this.adultDOB[3] ? this.isOlderThan65(new Date(this.adultDOB[3])) : "";
            const A4DOB = this.adultDOB && this.adultDOB[4] ? this.isOlderThan65(new Date(this.adultDOB[4])) : "";
            const A5DOB = this.adultDOB && this.adultDOB[5] ? this.isOlderThan65(new Date(this.adultDOB[5])) : "";
            const A6DOB = this.adultDOB && this.adultDOB[6] ? this.isOlderThan65(new Date(this.adultDOB[6])) : "";

            if (A1DOB || A2DOB || A3DOB || A4DOB || A5DOB || A6DOB) {
              this._userData.Adult1DOB = this.adultDOB && this.adultDOB[1] ? this.adultDOB[1] : "";
              this._userData.Adult2DOB = this.adultDOB && this.adultDOB[2] ? this.adultDOB[2] : "";
              this._userData.isSeniorCitizenTrue = true;
            }
          }
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  showInsuredKidDetailsPopup() {
    this.isKidsDetailsPopup = true;
    this.isKidDobValidated = false;
  }
  handleEnterKey(event: KeyboardEvent) {
    event.preventDefault();

    if (this.numberofAdults > 0) {
      this.closeInsureMemberDetails();
    }
    if (this.numberofChildss > 0) {
      this.closeInsuredKidDetails();
    }
  }

  closeInsuredKidDetails() {
    try {
      if (this.validateInsuredkidSection() == true) {
        this.isKidsDetailsPopup = false;
        this.isKidDobValidated = true;
        IL_GTM.pushCustomGAEvent('custom_event', this.selectedpolicyType + '_lp_int', 'Kid(s) date of birth', this.numberofChildss.toString());
      }
      else {
        this.isKidDobValidated = false;
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  get txtPolicyType() {
    return this.myForm.get("txtPolicyType");
  }
  get txtadult1date() {
    return this.myForm.get("txtadult1date");
  }
  get txtadult1month() {
    return this.myForm.get("txtadult1month");
  }
  get txtadult1year() {
    return this.myForm.get("txtadult1year");
  }
  get txtadult2date() {
    return this.myForm.get("txtadult2date");
  }
  get txtadult2month() {
    return this.myForm.get("txtadult2month");
  }
  get txtadult2year() {
    return this.myForm.get("txtadult2year");
  }

  //3
  get txtadult3date() {
    return this.myForm.get("txtadult3date");
  }
  get txtadult3month() {
    return this.myForm.get("txtadult3month");
  }
  get txtadult3year() {
    return this.myForm.get("txtadult3year");
  }

  //4
  get txtadult4date() {
    return this.myForm.get("txtadult4date");
  }
  get txtadult4month() {
    return this.myForm.get("txtadult4month");
  }
  get txtadult4year() {
    return this.myForm.get("txtadult4year");
  }

  //5
  get txtadult5date() {
    return this.myForm.get("txtadult5date");
  }
  get txtadult5month() {
    return this.myForm.get("txtadult5month");
  }
  get txtadult5year() {
    return this.myForm.get("txtadult5year");
  }

  //6
  get txtadult6date() {
    return this.myForm.get("txtadult6date");
  }
  get txtadult6month() {
    return this.myForm.get("txtadult6month");
  }
  get txtadult6year() {
    return this.myForm.get("txtadult6year");
  }

  get txtmobilenumber() {
    return this.myForm.get("txtmobilenumber");
  }
  get txtemail() {
    return this.myForm.get("txtemail");
  }
  get txtName() {
    return this.myForm.get("txtName");
  }
  get txtpincode() {
    return this.myForm.get("txtpincode");
  }


  get txtKid1Date() {
    return this.myForm.get("txtKid1Date");
  }
  get txtKid1Month() {
    return this.myForm.get("txtKid1Month");
  }
  get txtKid1Year() {
    return this.myForm.get("txtKid1Year");
  }

  get txtKid2Date() {
    return this.myForm.get("txtKid2Date");
  }
  get txtKid2Month() {
    return this.myForm.get("txtKid2Month");
  }
  get txtKid2Year() {
    return this.myForm.get("txtKid2Year");
  }

  get txtKid3Date() {
    return this.myForm.get("txtKid3Date");
  }
  get txtKid3Month() {
    return this.myForm.get("txtKid3Month");
  }
  get txtKid3Year() {
    return this.myForm.get("txtKid3Year");
  }


  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy(): void {
    try {
      this.subsciptionMobile.unsubscribe();
      this.subscriptionEmail.unsubscribe();
    }
    catch (error) {
      console.log(error);
    }
  }

  gaEvent(fieldName: any): void {
    if (this.selectedpolicyType == 'elevate' || this.selectedpolicyType == 'abc' || this.selectedpolicyType == 'ab' || this.selectedpolicyType == 'max' || this.selectedpolicyType == 'arog') {
      if (fieldName == 'get_quote_click') {
        if ((this.isAdultDobVaildated ||
          (this.numberofAdults == 0 &&
            this.numberofChildss != 0 &&
            this.validateInsuredkidSection() == true)) &&
          this.txtmobilenumber &&
          this.txtmobilenumber.valid &&
          this.txtemail &&
          this.txtemail.valid
        ) {
          IL_GTM.pushCustomGAEvent('custom_event', this.selectedpolicyType + '_lp_int', 'success', 'get_quote');
        }
        else {
          IL_GTM.pushCustomGAEvent('custom_event', this.selectedpolicyType + '_lp_int', 'fail', 'get_quote');
        }
      } else if (fieldName == 'Pincode') {
        IL_GTM.pushCustomGAEvent('custom_event', this.selectedpolicyType + '_lp_int', fieldName, this.txtpincode.value);
      } else if (fieldName == 'Mobile') {
        var hashMobile = Utility.hashIt(this.txtmobilenumber.value);
        sessionStorage.setItem('hashMobile', hashMobile);
        IL_GTM.pushCustomGAEvent('custom_event', this.selectedpolicyType + '_lp_int', fieldName + ' number', hashMobile);
      } else if (fieldName == 'Email') {
        var hashEmail = Utility.hashIt(this.txtemail.value);
        sessionStorage.setItem('hashEmail', hashEmail);
        IL_GTM.pushCustomGAEvent('custom_event', this.selectedpolicyType + '_lp_int', fieldName, hashEmail);
      } else if (fieldName == 'Name') {
        IL_GTM.pushCustomGAEvent('custom_event', this.selectedpolicyType + '_lp_int', fieldName, this.txtName.value);
      }
      else
        IL_GTM.pushCustomGAEvent('custom_event', this.selectedpolicyType + '_lp_int', fieldName, '');
    }
    else {
      if (fieldName == 'Pincode') {
        IL_GTM.pushCustomGAEvent('custom_event', this.selectedpolicyType + '_lp_int', fieldName, this.txtpincode.value);
      } else if (fieldName == 'Mobile') {
        var hashMobile = Utility.hashIt(this.txtmobilenumber.value);
        sessionStorage.setItem('hashMobile', hashMobile);
        IL_GTM.pushCustomGAEvent('custom_event', this.selectedpolicyType + '_lp_int', fieldName + ' number', hashMobile);
      } else if (fieldName == 'Email') {
        var hashEmail = Utility.hashIt(this.txtemail.value);
        sessionStorage.setItem('hashEmail', hashEmail);
        IL_GTM.pushCustomGAEvent('custom_event', this.selectedpolicyType + '_lp_int', fieldName, hashEmail);
      } else if (fieldName == 'Name') {
        IL_GTM.pushCustomGAEvent('custom_event', this.selectedpolicyType + '_lp_int', fieldName, this.txtName.value);
      } else
        IL_GTM.pushCustomGAEvent('custom_event', this.selectedpolicyType + '_lp_int', fieldName, '');
    }

  }

  appendZeroDOB(inptField: string) {
    const value = this.myForm.get(inptField)?.value;
    if (this.myForm.get(inptField)?.value.length == 1) {
      this.myForm.get(inptField)?.patchValue("0" + value);
    }
  }

  isOlderThan65(birthDate: Date): boolean {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 65;
  }


  isAddKidButtonEnabled(): boolean {
    const numAdults = this.numberofAdults;
    const numKids = this.numberofChildss;
    const policyType = this.selectedpolicyType;

    if (policyType == 'hap') {
      if (numAdults === 0 && numKids === 0) {
        return false; // 1K
      }
      else if (numAdults === 0 && numKids === 1) {
        return true; // 1K
      }
      else if (numAdults === 1 && numKids === 0) {
        return false; // 1A
      } else if (numAdults === 1 && numKids === 1) {
        return false; // 1A+1K
      } else if (numAdults === 1 && numKids === 2) {
        return false; // 1A+2K
      } else if (numAdults === 1 && numKids === 3) {
        return true; // 1A+3K
      } else if (numAdults === 2 && numKids === 0) {
        return false; // 2A
      } else if (numAdults === 2 && numKids === 1) {
        return false; // 2A+1K
      } else if (numAdults === 2 && numKids === 2) {
        return false; // 2A+2K
      } else if (numAdults === 2 && numKids === 3) {
        return true; // 2A+3K
      } else if (numAdults === 3 && numKids === 0) {
        return false; // 3A+0K
      }
      else if (numAdults === 3 && numKids === 1) {
        return false; // 3A+1K
      } else if (numAdults === 3 && numKids === 2) {
        return false; // 3A+2K
      } else if (numAdults === 3 && numKids === 3) {
        return true; // 3A+3K
      } else if (numAdults === 4 && numKids === 0) {
        return false; // 4A+1K
      }
      else if (numAdults === 4 && numKids === 1) {
        return false; // 4A+1K
      } else if (numAdults === 4 && numKids === 2) {
        return false; // 4A+2K
      } else if (numAdults === 4 && numKids === 3) {
        return true; // 4A+3K
      } else if (numAdults === 5 && numKids === 0) {
        return false; // 5A+1K
      } else if (numAdults === 5 && numKids === 1) {
        return false; // 5A+1K
      } else if (numAdults === 5 && numKids === 2) {
        return true; // 5A+2K
      } else if (numAdults === 6 && numKids === 0) {
        return false; // 6A+1K
      } else if (numAdults === 6 && numKids === 1) {
        return true; // 6A+1K
      } else {
        return true; // All other combinations disable the button
      }
    }
    else if ((this.selectedpolicyType == 'max' || this.selectedpolicyType == 'arog') && this.numberofAdults == 0) {
      if (this.numberofChildss === 0) {
        return true;
      }
    }
    else if (this.selectedpolicyType == 'max' || this.selectedpolicyType == 'arog' || this.selectedpolicyType == 'hb' || this.selectedpolicyType == 'abc' || this.selectedpolicyType == 'ab') {
      if ((this.numberofAdults == 0 && this.numberofChildss == 1) || (this.numberofAdults == 1 && this.numberofChildss == 2) || (this.numberofAdults == 2 && this.numberofChildss == 3)) {
        return true;
      }
    } else if (this.selectedpolicyType == 'elevate') {
      if ((this.numberofAdults == 0 && this.numberofChildss == 1) || (this.numberofAdults == 1 && this.numberofChildss == 3) || (this.numberofAdults == 2 && this.numberofChildss == 3)) {
        return true;
      }
    }
    return false;
  }


  getProductCode(policyType) {
    var ProductCode = 0;
    switch (policyType) {
      case "hap":
        ProductCode = ProductType.hap;
        break;
      case "max":
        ProductCode = ProductType.max;
        break;
      case "hb":
        ProductCode = ProductType.Booster;
        break;
      case "pp":
        ProductCode = ProductType.PersonalProtect;
        break;
      case "arog":
        ProductCode = ProductType.arog;
        break;
      case "elevate":
        ProductCode = ProductType.Elevate;
        break;
      case "abc":
        ProductCode = ProductType.ActivateBoosterCombo;
        break;
      case "ab":
        ProductCode = ProductType.ActivateBooster;
        break;
    }
    return ProductCode;
  }

  getProductName(policyType) {
    var ProductName = '';
    switch (policyType) {

      case "hap":
        ProductName = "Health AdvantEdge";
        break;
      case "max":
        ProductName = "MaxProtect";
        break;
      case "hb":
        ProductName = "HealthBooster";
        break;
      case "pp":
        ProductName = "PersonalProtect";
        break;
      case "arog":
        ProductName = "Arogya Sanjeevani Policy";
        break;
      case "elevate":
        ProductName = "Elevate";
        break;
      case "abc":
        ProductName = "Activate Booster (Combo)";
        break;
      case "ab":
        ProductName = "Activate Booster";
        break;
    }

    return ProductName;
  }
  getPolicySubType(policyType) {
    var PolicySubType = '';
    switch (policyType) {

      case "hap":
        PolicySubType = "36";
        break;
      case "max":
        PolicySubType = "33";
        break;
      case "hb":
        PolicySubType = "20";
        break;
      case "pp":
        PolicySubType = "6";
        break;
      case "arog":
        PolicySubType = "22";
        break;
      case "elevate":
        PolicySubType = "35";
        break;
      case "abc":
        PolicySubType = "37";
        break;
      case "ab":
        PolicySubType = "38";
        break;
    }

    return PolicySubType;
  }



}
