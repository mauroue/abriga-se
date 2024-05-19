import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
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
import { from, map, of, tap } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { AsyncPipe } from '@angular/common';

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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Tab2Page {
  mapWidth = MAP_WIDTH;
  mapHeight = MAP_HEIGHT;
  center: google.maps.LatLngLiteral = { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
  zoom = 8;
  options = {
    disableDefaultUI: true,
  } as google.maps.MapOptions;
  display: google.maps.LatLngLiteral;
  markerPosition: google.maps.LatLngLiteral;
  listOfSafePoints: Set<google.maps.LatLngLiteral> = new Set();
  currentLocation = from(Geolocation.getCurrentPosition()).pipe(
    tap((data) => console.log(data)),
  );
  permission = from(Geolocation.checkPermissions()).pipe(
    tap((data) => console.log(data)),
  );

  constructor() {
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

  // calculateRoute(directionService: google.maps.DirectionsService) {
  //   directionService.route({
  //     origin: {
  //       query: document.getElementById('start') as HTMLInputElement,
  //     },
  //   });
  // }
}
