import { Component, LOCALE_ID, OnInit, signal } from '@angular/core';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { from, map, tap, timer } from 'rxjs';
import { AsyncPipe, DATE_PIPE_DEFAULT_OPTIONS, DatePipe, DecimalPipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { WeatherService } from '../weather.service';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { sunnyOutline, partlySunnyOutline } from 'ionicons/icons';

registerLocaleData(localePt);

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { locale: 'pt-BR' } }
  ],
  imports: [IonicModule, ExploreContainerComponent, DatePipe, AsyncPipe, DecimalPipe],
})
export class Tab1Page implements OnInit {
  public today = new Date().getDay();
  public clock = signal(new Date())
  public weatherData = signal({});
  public weatherCode = signal(0);
  public currentTemperature = signal(0);


  constructor(
    private weatherService: WeatherService
  ) {
    addIcons({ partlySunnyOutline, sunnyOutline });
  }

  ngOnInit(): void {
    timer(0, 1000)
      .pipe(
        map(() => new Date()),
        tap(date => this.clock.update(() => date))
      )

    this.weatherService.getWeatherApi$
      .pipe(
        tap(data => this.weatherData.update(() => data)),
        tap(data => console.log(data)),
        tap(data => this.weatherCode.update(() => data.current.weatherCode)),
        tap(data => this.currentTemperature.update(() => data.current.temperature2m)),
      ).subscribe()
  }
}
