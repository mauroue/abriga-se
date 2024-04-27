import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { IonHeader, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonToolbar, IonTitle, IonContent} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sunnyOutline, navigateCircleOutline } from 'ionicons/icons';
import { Tab1Page } from '../tab1/tab1.page';
import { Tab2Page } from '../tab2/tab2.page';
import { BehaviorSubject } from 'rxjs';
import {AsyncPipe} from "@angular/common";

export interface TabConfig {
  order: number;
  name: string,
  icon: string
}

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonToolbar, IonTitle, Tab1Page, Tab2Page, AsyncPipe],
})
export class TabsPage implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);
  public tabNum: number = 1;
  public title = new BehaviorSubject<string>('Clima')

  public tabs: TabConfig[]= [
    {
      order: 1,
      name: 'Clima',
      icon: 'sunny-outline'
    },
    {
      order: 2,
      name: 'Local',
      icon: 'navigate-circle-outline'
    }
  ]

  constructor() {
    addIcons({ sunnyOutline, navigateCircleOutline });
  }

  ngOnInit(): void {
    this.switchTab(1);
  }

  switchTab(tabNum: number): void {
    const newTab = this.tabs.find(item => item.order == tabNum)
    if (!newTab) return;
    this.tabNum = tabNum;
    this.title.next(newTab.name)
  }

}
