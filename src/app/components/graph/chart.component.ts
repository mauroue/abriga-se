import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { WeatherService } from 'src/app/weather.service';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [RouterOutlet, CommonModule, CanvasJSAngularChartsModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class AppChartComponent {
  rawWeatherData = this.weatherService.hourlyWeather()
  parsedData = this.rawWeatherData
    .map((data) => {
      return { label: data.time.getHours().toString() + 'h', y: Math.round(data.temperature2m * 100) / 100 }
    })
  options = {
    theme: 'dark2',
    backgroundColor: "#1e1e1e",
    animationEnabled: true,
    exportEnabled: false,
    axisY: {
      includeZero: true,
      valueFormatString: '##°C',
    },
    data: [
      {
        type: 'column',
        yValueFormatString: '##°C',
        color: '#01b8aa',
        dataPoints: this.parsedData,
      },
    ],
  };

  constructor(
    private weatherService: WeatherService
  ) {
  }
}
