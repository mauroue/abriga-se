import { AfterViewInit, Component, Input, OnInit, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { ParsedHourlyData } from 'src/app/tab1/tab1.page';
import { WeatherService } from 'src/app/weather.service';
import { map } from 'rxjs';

@Component({
    selector: 'app-chart',
    standalone: true,
    imports: [RouterOutlet, CommonModule, CanvasJSAngularChartsModule],
    templateUrl: './chart.component.html',
    styleUrl: './chart.component.css',
})
export class AppChartComponent {
    dataPoints = input<ParsedHourlyData[]>()
    data = this.weatherService.hourlyWeather

    chartOptions = this.data.pipe(
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
                        type: 'column', //change type to bar, line, area, pie, etc
                        yValueFormatString: '$##°C',
                        color: '#01b8aa',
                        dataPoints: data,
                    },
                ],
            };
        })
    )

    constructor(
        private weatherService: WeatherService
    ) { }
}
