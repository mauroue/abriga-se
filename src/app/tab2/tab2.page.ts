import { CUSTOM_ELEMENTS_SCHEMA, Component, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonLoading,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import {
  GoogleMap,
  MapAdvancedMarker,
  MapDirectionsService,
  MapDirectionsRenderer,
} from '@angular/google-maps';

import { environment } from 'src/environments/environment';
import { Loader } from '@googlemaps/js-api-loader';
import { BehaviorSubject, from, map, of, switchMap, tap } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { AsyncPipe, JsonPipe } from '@angular/common';

const loader = new Loader({
  apiKey: environment.apiKey,
  version: 'weekly',
});

const DEFAULT_LAT = -23.76;
const DEFAULT_LNG = -45.4097;
const MAP_WIDTH = '340px';
const MAP_HEIGHT = '500px';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
    GoogleMap,
    MapAdvancedMarker,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    MapDirectionsRenderer,
    JsonPipe,
    IonLoading,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Tab2Page {
  mapWidth = MAP_WIDTH;
  mapHeight = MAP_HEIGHT;
  center: google.maps.LatLngLiteral = { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
  zoom = 14;
  options = {
    disableDefaultUI: true,
  } as google.maps.MapOptions;
  display: google.maps.LatLngLiteral;
  markerPosition: google.maps.LatLngLiteral;
  listOfSafePoints: Set<google.maps.LatLngLiteral> = new Set();
  currentLocation = signal({} as google.maps.LatLngLiteral);
  currentLocation$ = from(
    Geolocation.watchPosition({ enableHighAccuracy: true }, (result, err) => {
      if (err) {
        this.loadingGps = true;
      }
      if (result) {
        const location: google.maps.LatLngLiteral = {
          lat: result.coords.latitude,
          lng: result?.coords.longitude,
        };
        this.currentLocation.update(() => location);
        this.loadingGps = false;
      }
    }),
  );
  permission = from(Geolocation.checkPermissions()).pipe(
    tap((data) => console.log(data)),
  );
  loadingGps = true;
  directionRequest$ = new BehaviorSubject({} as google.maps.DirectionsRequest);
  directionResult$ = this.directionRequest$.pipe(
    switchMap((request) =>
      this.mapService.route(request).pipe(tap((data) => console.log(data))),
    ),
    map((request) => request.result),
  );

  constructor(private mapService: MapDirectionsService) {
    loader.importLibrary('maps');
    loader.importLibrary('marker');
    loader.importLibrary('routes');
  }

  addMarker(event: google.maps.MapMouseEvent) {
    if (event.latLng !== null) this.markerPosition = event.latLng.toJSON();
  }

  addSafePoint() {
    console.log(this.markerPosition);
    console.log(this.listOfSafePoints);
    this.listOfSafePoints.add(this.markerPosition);
  }

  getRoute() {
    const requestDirection = {
      destination: { lat: -23.792612154668166, lng: -45.401664982198255 },
      origin: {
        lat: -23.7785534354166,
        lng: -45.40370346097021,
      } /* { lat: data.coords.latitude, lng: data.coords.longitude }, */,
      travelMode: google.maps.TravelMode.WALKING,
    };
    this.directionRequest$.next(requestDirection);
  }
}
