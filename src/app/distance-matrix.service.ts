import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

const DISTANCE_MATRIX_URL = `https://maps.googleapis.com/maps/api/distancematrix/json?`;

export interface DistanceMatrixRequestInterface {
  destinations: google.maps.LatLngLiteral[];
  origins: google.maps.LatLngLiteral[];
}

@Injectable({
  providedIn: 'root',
})
export class DistanceMatrixService {
  api_key = environment.apiKey;
  matrixService = new google.maps.DistanceMatrixService();

  constructor(private http: HttpClient) {}

  sendMatrixRequest(
    origins: google.maps.LatLngLiteral[],
    destinations: google.maps.LatLngLiteral[],
  ) {
    const request = {
      origins: origins,
      destinations: destinations,
      travelMode: google.maps.TravelMode.WALKING,
    } as google.maps.DistanceMatrixRequest;
    this.matrixService.getDistanceMatrix(request, (response) => {
      console.log(response);
    });
  }
}
