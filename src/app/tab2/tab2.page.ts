import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  signal,
  ViewChild,
} from '@angular/core';
import {
  IonBackButton,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonList,
  IonLoading,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import {
  GoogleMap,
  MapAdvancedMarker,
  MapDirectionsRenderer,
  MapDirectionsService,
} from '@angular/google-maps';
import { OverlayEventDetail } from '@ionic/core/components';

import { environment } from 'src/environments/environment';
import { Loader } from '@googlemaps/js-api-loader';
import { BehaviorSubject, from, map, switchMap, tap } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { AsyncPipe, DecimalPipe, JsonPipe } from '@angular/common';
import { LocalStorageService } from '../local-storage.service';
import { FormsModule } from '@angular/forms';

const loader = new Loader({
  apiKey: environment.apiKey,
  version: 'weekly',
});

const DEFAULT_LAT = -23.76;
const DEFAULT_LNG = -45.4097;
const MAP_WIDTH = '340px';
const MAP_HEIGHT = '500px';

export interface SafePlace {
  location: google.maps.LatLngLiteral;
  name: string;
}

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
    DecimalPipe,
    IonModal,
    IonInput,
    FormsModule,
    IonBackButton,
    IonList,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Tab2Page {
  @ViewChild(IonModal) modal: IonModal;
  nameInput = '';
  mapWidth = MAP_WIDTH;
  mapHeight = MAP_HEIGHT;
  center: google.maps.LatLngLiteral = { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
  zoom = 14;
  options = {
    disableDefaultUI: true,
  } as google.maps.MapOptions;
  markerPosition: SafePlace;
  listOfSafePoints: Set<SafePlace> = new Set();
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

  constructor(
    private mapService: MapDirectionsService,
    private localStorageService: LocalStorageService,
  ) {
    loader.importLibrary('maps').then(() => {});
    loader.importLibrary('marker').then(() => {});
    loader.importLibrary('routes').then(() => {});
    if (this.localStorageService.getItem('saved')) {
      let i = 0;
      while (true) {
        i++;
        let item = this.localStorageService.getItem(i.toString());
        console.log('item', i);
        if (item !== null) {
          this.listOfSafePoints.add(JSON.parse(item));
        } else {
          console.log('breaking');
          break;
        }
      }
    }
  }

  addMarker(event: google.maps.MapMouseEvent) {
    if (event.latLng !== null) {
      const location = event.latLng.toJSON();
      this.markerPosition = {
        location: location,
        name: 'temp',
      };
    }
  }

  addSafePoint(name: string) {
    if (this.markerPosition) {
      this.markerPosition.name = name;
      console.log(`Added ${this.markerPosition.name}, to safe point.`);
      this.listOfSafePoints.add(this.markerPosition);
      this.saveToStorage();
    }
  }

  saveToStorage() {
    if (!this.localStorageService.getItem('saved')) {
      this.localStorageService.setItem('saved', 'true');
    }
    let i = 0;
    this.listOfSafePoints.forEach((item) => {
      this.localStorageService.setItem(
        (i + 1).toString(),
        JSON.stringify(item),
      );
    });
  }

  getRoute(dest: SafePlace) {
    const origin = this.currentLocation();
    const requestDirection = {
      destination: dest.location,
      origin:
        origin /* { lat: data.coords.latitude, lng: data.coords.longitude }, */,
      travelMode: google.maps.TravelMode.WALKING,
    };
    this.directionRequest$.next(requestDirection);
  }

  confirm() {
    this.modal.dismiss(this.nameInput, 'confirm');
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.addSafePoint(this.nameInput);
    }
  }
}
