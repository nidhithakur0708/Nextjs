import { Component, ElementRef, ViewChild, Input, OnInit, AfterViewInit } from '@angular/core';
import { FormComponent } from '../form/form.component';
import * as Constants from 'src/app/constants/Constants';
import { Utility } from '../../constants/utility';
import { ActivatedRoute } from '@angular/router';
import { IL_GTM } from 'src/app/common/ga-events/IL_GTM';

@Component({
  selector: 'app-landing-page-modal',
  templateUrl: './landing-page-modal.component.html',
  styleUrls: ['./landing-page-modal.component.css']
})
export class LandingPageModalComponent implements OnInit {

  // policy = ['elevate', 'max', 'hb', 'hap', 'arog', 'pp', 'abc', 'ab'];
  policy = ['elevate', 'abc', 'ab', 'max', 'hap', 'arog', 'pp'];
  activeTab: string = this.policy[0];
  firstTab: string = "";
  sessionCallBackHealthData: any | undefined;
  activeTabIndex: number = 0;
  widgetActive: string = 'widget-active';
  selectedpolicyType: any;
  leftTabIdx = 1;
  atStart = true;
  atEnd = false;
  scrollElem = null;
  hapOrionTaggedUrl: boolean | null = null;
  elevateOrionTaggedUrl: boolean | null = null;
  abcOrionTaggedUrl: boolean | null = null;
  isMobile: boolean;
  showTabs = true; // default: show tabs
  tabDisplayNames: { [key: string]: string } = {
    elevate: 'Elevate',
    abc: 'Activate Booster (Combo)',
    ab: 'Activate Booster',
    max: 'Max Protect',
    hap: 'Health AdvantEdge',
    arog: 'Arogya Sanjeevani',
    pp: 'Personal Protect'
  };
  showNriPopup: boolean = false;
  @ViewChild('tabContainer', { read: ElementRef }) public tabContainer: ElementRef<any>;
  @ViewChild('widgetsContent', { read: ElementRef }) public widgetsContent: ElementRef<any>;


  tabs = [
    {
      id: 'elevate',
      title: 'Elevate - Health Insurance',
      desc: 'Reliable Protection. Zero Worries. 0% GST'
    },
    {
      id: 'abc',
      title: 'Activate Booster (Combo)',
      desc: 'High sum insured, low premium combo.'
    },
    {
      id: 'ab',
      title: 'Activate Booster',
      desc: 'Boost your coverage with super top-up.'
    }
  ];

  constructor(private route: ActivatedRoute) {
    this.isMobile = window.innerWidth <= 767;
  }

  ngOnInit() {
    let hiddenPageName = (document.getElementById("hdn_landing_page") as HTMLInputElement)?.value || null;

    // Set IsNewLeadForm to false for normal landing/form flow
    sessionStorage.setItem('IsNewLeadForm', 'false');

    this.route.queryParams.subscribe(params => {
      let urlparam = Utility.GetUrlParameter('opt');

      if (urlparam && (urlparam?.toLowerCase() === 'elevateArtemisAI'.toLowerCase())) {
        sessionStorage.setItem('ElevateAIBOT', 'true');
      }
      else {
        sessionStorage.setItem('ElevateAIBOT', 'false');
      }

      let typeparam = Utility.GetUrlParameter('type');
      if (typeparam && typeparam?.toLowerCase() === 'nri'.toLowerCase()) {
       this.openNriPopup();
      }

      this.activeTab = urlparam || this.activeTab;
      this.firstTab = this.activeTab;
      if (!urlparam) {
        this.activeTab = hiddenPageName;
      }
      //orion hap redirection handling
      this.hapOrionTaggedUrl = this.activeTab === 'hap' ? true : this.activeTab === 'happf' ? false : true;

      if (this.activeTab === 'happf')
        this.activeTab = this.policy[4];

      //orion elevate redirection handling
      //this.elevateOrionTaggedUrl = this.activeTab?.toLowerCase() === 'elevatepf'.toLowerCase() ? false : true;
      this.elevateOrionTaggedUrl = this.activeTab?.toLowerCase() === 'elevate' || this.activeTab?.toLowerCase() === 'elevateartemisai' ? true : false;

      //orion abc redirection handling
      this.abcOrionTaggedUrl = this.activeTab === 'abc' ? false : this.activeTab === 'abcartemis' ? true : false;
      if (this.activeTab === 'abcartemis')
        this.activeTab = this.policy[1]
      //other parameters handling for elevate
      if (!this.activeTab || this.activeTab === 'health' || this.activeTab?.toLowerCase() === 'elevate'.toLowerCase() || this.activeTab?.toLowerCase() === 'elevateartemisai'.toLowerCase() || !this.policy.includes(this.activeTab)) {
        this.activeTab = this.policy[0];
      }


    });

    let sessionActiveTab;
    let sessionData;
    const healthUIData = window.sessionStorage.getItem(Constants.HEALTH_UI_DATA);
    const healthArogyaUIData = window.sessionStorage.getItem(Constants.HEALTHArogya_UI_DATA);


    if (!Utility.IsNullOrEmpty(healthUIData) || !Utility.IsNullOrEmpty(healthArogyaUIData)) {
      sessionData = !Utility.IsNullOrEmpty(healthUIData)
        ? JSON.parse(healthUIData)
        : JSON.parse(healthArogyaUIData);
      sessionActiveTab = this.activeTab;
    }

    if (sessionActiveTab) //&& this.activeTab === sessionActiveTab
    {
      this.selectedpolicyType = sessionActiveTab;
      this.sessionCallBackHealthData = sessionData;
    }
    this.selectedpolicyType = this.activeTab;

    this.changeTab(this.selectedpolicyType);

    //if (this.selectedpolicyType == "pp" || this.selectedpolicyType == "hb") {
    //  this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft + 900), behavior: 'smooth' });
    //}

    window.sessionStorage.removeItem(Constants.SESSION_STORAGE_KEY_OTPVERIFY);
    window.sessionStorage.removeItem(Constants.SESSION_STORAGE_KEY_PROPOSALAUTH);
  }

  ngAfterViewInit() {
    //  if (this.activeTab == this.policy[3] || this.activeTab == this.policy[4] || this.activeTab == this.policy[5]) {
    //  //  this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft + 1000), behavior: 'smooth' });
    //  //}
    //}

    //scrollTab(x, scrollTo): void {
    //  if (this.atStart && x < 0 || this.atEnd && x > 0) {
    //    return
    //  }
    //this.leftTabIdx = this.leftTabIdx + x;
    //this.atStart = this.leftTabIdx === 1;
    //this.atEnd = this.leftTabIdx === this.policy.length - 3;
    //if (scrollTo == 'left') {
    //  this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft - 500), behavior: 'smooth' });
    //}
    //else {
    //  this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft + 500), behavior: 'smooth' });
    //}
  }

  onBack() {
    this.widgetActive = '';
    this.showTabs = false;
  }

  changeTab(tabName: string) {
    window.sessionStorage.setItem("DetailProd", tabName);
    this.widgetActive = 'widget-active';
    this.activeTab = tabName;
    this.activeTabIndex = this.policy.indexOf(tabName);
    this.selectedpolicyType = tabName;
    if (this.isMobile)
      this.showTabs = true;
    IL_GTM.pushCustomGAEvent(
      'custom_event',
      tabName + '_lp_int',
      'health_insurance_tab_click',
      this.tabDisplayNames[tabName] || tabName
    );
  }
  openNriPopup() {
    this.showNriPopup = false;
    setTimeout(() => {
      this.showNriPopup = true;
    });
    IL_GTM.pushCustomGAEvent('custom_event', 'all_page_common_int', 'main_navigation', ' Get NRI health insurance at 25% off ');
  }

  onNriPopupClosed() {
    this.showNriPopup = false;
  }
}
