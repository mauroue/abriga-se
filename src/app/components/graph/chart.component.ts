import { Component, OnInit, input, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { ParsedHourlyData } from 'src/app/tab1/tab1.page';
import { WeatherService } from 'src/app/weather.service';
import { catchError, map, of, tap } from 'rxjs';

@Component({
    selector: 'app-chart',
    standalone: true,
    imports: [RouterOutlet, CommonModule, CanvasJSAngularChartsModule],
    templateUrl: './chart.component.html',
    styleUrl: './chart.component.css',
})
export class AppChartComponent implements OnInit {
    dataPoints = input<ParsedHourlyData[]>()
    hourlyWeather$ = this.weatherService.hourlyWeather$
    chartOptions = signal({})

    constructor(
        private weatherService: WeatherService
    ) { }

    ngOnInit(): void {
        this.hourlyWeather$.pipe(
            tap(data => console.log(data)),
            map((data) => {
                return {
                    title: {
                        text: 'Próximos Horas',
                    },
                    theme: 'dark2',
                    animationEnabled: true,
                    exportEnabled: false,
                    axisY: {
                        includeZero: true,
                        valueFormatString: '$##°C',
                    },
                    data: [
                        {
                            type: 'column',
                            yValueFormatString: '$##°C',
                            color: '#01b8aa',
                            dataPoints: data,
                        },
                    ],
                };
            }),
            tap((data) => this.chartOptions.update(() => data)),
            catchError(err => of(console.log(err)))
        ).subscribe()
    }

}
