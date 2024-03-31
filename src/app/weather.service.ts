import { Injectable, signal } from '@angular/core';
import { fetchWeatherApi } from 'openmeteo';
import { Observable, defer, from, map, tap } from 'rxjs';
import { WeatherApiResponse } from '@openmeteo/sdk/weather-api-response';


@Injectable({
    providedIn: 'root'
})
export class WeatherService {
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
            tap((res) => console.log(res)),
        );

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

        // Note: The order of weather variables in the URL query and the indices below need to match!
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

        // `weatherData` now contains a simple structure with arrays for datetime and weather data
        // for (let i = 0; i < weatherData.hourly.time.length; i++) {
        //     console.log(
        //         weatherData.hourly.time[i].toISOString(),
        //         weatherData.hourly.temperature2m[i],
        //         weatherData.hourly.relativeHumidity2m[i],
        //         weatherData.hourly.precipitation[i],
        //         weatherData.hourly.rain[i]
        //     );
        // }
        return weatherData

    }

}
