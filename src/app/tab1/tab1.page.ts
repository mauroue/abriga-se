import { Component, LOCALE_ID, OnInit, signal } from '@angular/core';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { BehaviorSubject, map, tap, timer } from 'rxjs';
import { AsyncPipe, CommonModule, DATE_PIPE_DEFAULT_OPTIONS, DatePipe, DecimalPipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { WeatherService } from '../weather.service';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { sunnyOutline, partlySunnyOutline } from 'ionicons/icons';
import { AppChartComponent } from '../components/graph/chart.component';

registerLocaleData(localePt);

export interface WeatherData {
  current: CurrentData,
  hourly: HourlyData

}

export interface CurrentData {
  time: Date; temperature2m: number; apparentTemperature: number; precipitation: number; rain: number; weatherCode: number;
}
export interface HourlyData {
  time: Date[]; temperature2m: Float32Array; relativeHumidity2m: Float32Array; precipitation: Float32Array; rain: Float32Array;
}

export interface ParsedHourlyData {
  time: Date; temperature2m: number; relativeHumidity2m: number; precipitation: number; rain: number;
}
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { locale: 'pt-BR' } }
  ],
  imports: [IonicModule, ExploreContainerComponent, DatePipe, AsyncPipe, DecimalPipe, CommonModule, AppChartComponent],
})
export class Tab1Page implements OnInit {
  public today = new Date().getDay();
  public clock = signal(new Date())
  public weatherData = signal({} as WeatherData);
  public weatherCode = signal(0);
  public currentTemperature = signal(0);
  public dataPoints = signal([] as ParsedHourlyData[]);
  public destroy$ = new BehaviorSubject<boolean>(false);
  public expanded = signal(0);

  constructor(
    private weatherService: WeatherService,
  ) {
    addIcons({ partlySunnyOutline, sunnyOutline });
  }

  ngOnInit(): void {

    this.weatherService.getWeatherApi$
      .pipe(
        tap((data) => this.weatherData.update(() => data)),
        tap(data => this.weatherCode.update(() => data.current.weatherCode)),
        tap(data => this.currentTemperature.update(() => data.current.temperature2m)),
      ).subscribe()
  }

  expandCard() {
    this.expanded.update(() => this.expanded() === 0 ? 1 : 0);
  }
}
