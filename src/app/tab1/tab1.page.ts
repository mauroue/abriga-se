import { Component, ElementRef, LOCALE_ID, NgModule, OnInit, ViewChildren, signal } from '@angular/core';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { BehaviorSubject, map, tap, timer } from 'rxjs';
import { AsyncPipe, CommonModule, DATE_PIPE_DEFAULT_OPTIONS, DatePipe, DecimalPipe, NgStyle, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { WeatherService } from '../weather.service';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { sunnyOutline, partlySunnyOutline } from 'ionicons/icons';

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
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { locale: 'pt-BR' } }
  ],
  imports: [IonicModule, ExploreContainerComponent, DatePipe, AsyncPipe, DecimalPipe, CommonModule],
})
export class Tab1Page implements OnInit {
  public today = new Date().getDay();
  public clock = signal(new Date())
  public weatherData = signal({} as WeatherData);
  public weatherCode = signal(0);
  public currentTemperature = signal(0);
  public destroy$ = new BehaviorSubject<boolean>(false);
  public expanded = signal(0);

  constructor(
    private weatherService: WeatherService,
  ) {
    addIcons({ partlySunnyOutline, sunnyOutline });
  }


  ngOnInit(): void {
    timer(0, 1000)
      .pipe(
        map(() => new Date()),
        tap(date => this.clock.update(() => date)),
      )

    this.weatherService.getWeatherApi$
      .pipe(
        tap((data) => this.weatherData.update(() => data)),
        tap(data => {
          const hourlyWeather = data.hourly.time
            .filter((time) => {
              if (time < this.clock()) return false
              return true
            })
            .map((time, index) => {
              return {
                "time": time,
                "rain": data.hourly.rain[index],
                "temperature": data.hourly.temperature2m[index],
                "precipitation": data.hourly.precipitation[index],
                "relativeHumidity": data.hourly.relativeHumidity2m[index]
              }
            })
          console.log(hourlyWeather)
        }),
        tap(data => this.weatherCode.update(() => data.current.weatherCode)),
        tap(data => this.currentTemperature.update(() => data.current.temperature2m)),
      ).subscribe()
  }

  expandCard() {
    this.expanded.update(() => this.expanded() === 0 ? 1 : 0);
  }
}
