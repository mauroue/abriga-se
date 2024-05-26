import { Injectable, signal } from '@angular/core';
import { fetchWeatherApi } from 'openmeteo';
import { Observable, combineLatest, defer, filter, forkJoin, from, map, tap, timer } from 'rxjs';
import { WeatherApiResponse } from '@openmeteo/sdk/weather-api-response';
import { ParsedHourlyData } from './tab1/tab1.page';


@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  constructor() {
    this.clockHandler().pipe(
      tap((time) => this.clock.update(() => time))
    ).subscribe()

    this.hourlyWeather$.pipe(
      tap((data) => this.hourlyWeather.update(() => data)),
    ).subscribe()
  }
  private url = "https://api.open-meteo.com/v1/forecast";
  private params = signal({
    "latitude": -23.76,
    "longitude": -45.4097,
    "current": ["temperature_2m", "precipitation", "weather_code"],
    "hourly": ["temperature_2m", "precipitation_probability", "precipitation", "weather_code"],
    "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min", "sunrise", "sunset", "uv_index_max", "precipitation_hours", "wind_speed_10m_max", "wind_direction_10m_dominant"],
    "timezone": "America/Sao_Paulo"
  });
  public getWeatherApi$ = defer(() => from(fetchWeatherApi(this.url, this.params())))
    .pipe(
      map((response) => this.processWeatherResponse(response[0])),
    );
  public clock = signal(new Date())
  public hourlyWeather = signal([] as ParsedHourlyData[])
  public highRain = signal(false)
  private hourlyWeather$: Observable<ParsedHourlyData[]> = this.getWeatherApi$.pipe(
    map(data => {
      const parsed = data.hourly.time
        .filter((time) => {
          if (time < this.clock()) return false
          return true
        })
        .map((time, index) => {
          if (data.hourly.rain[index] > 150) {
            this.highRain.set(true)
          }
          return {
            "time": time,
            "rain": data.hourly.rain[index],
            "temperature2m": data.hourly.temperature2m[index],
            "precipitation": data.hourly.precipitation[index],
            "relativeHumidity2m": data.hourly.relativeHumidity2m[index]
          }
        })
      return parsed
    }),
  )

  private clockHandler() {
    return timer(0, 1000)
      .pipe(
        map(() => new Date()),
      )
  }

  private processWeatherResponse(response: WeatherApiResponse) {
    const range = (start: number, stop: number, step: number) =>
      Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const latitude = response.latitude();
    const longitude = response.longitude();

    const current = response.current()!;
    const hourly = response.hourly()!;

    const weatherData = {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        temperature2m: current.variables(0)!.value(),
        apparentTemperature: current.variables(1)!.value(),
        precipitation: current.variables(2)!.value(),
        rain: current.variables(3)!.value(),
        weatherCode: current.variables(4)!.value(),
      },
      hourly: {
        time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
          (t) => new Date((t + utcOffsetSeconds) * 1000)
        ),
        temperature2m: hourly.variables(0)!.valuesArray()!,
        relativeHumidity2m: hourly.variables(1)!.valuesArray()!,
        precipitation: hourly.variables(2)!.valuesArray()!,
        rain: hourly.variables(3)!.valuesArray()!,
      },

    };
    return weatherData
  }

}
