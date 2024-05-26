import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  signal,
  ViewChild,
  WritableSignal,
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
  IonIcon,
  IonInput,
  IonItem,
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
import { addIcons } from 'ionicons';
import { trashSharp } from 'ionicons/icons';

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
    IonIcon,
    IonItem,
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
  listOfSafePoints: WritableSignal<Set<SafePlace>> = signal(new Set());
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
    addIcons({ trashSharp });
    if (this.localStorageService.length() > 0) {
      for (let i = 0; i < this.localStorageService.length(); i++) {
        const item = this.localStorageService.getItem(i.toString());
        if (item !== null) {
          this.listOfSafePoints.update((set) => set.add(JSON.parse(item)));
        } else {
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
      this.listOfSafePoints.update((item) => {
        item.add(this.markerPosition);
        return item;
      });
      this.saveToStorage();
    }
  }

  removeSafePoint(safe: SafePlace) {
    this.listOfSafePoints.update((item) => {
      item.delete(safe);
      return item;
    });
    this.saveToStorage();
  }

  saveToStorage() {
    this.localStorageService.clear();
    const array = Array.from(this.listOfSafePoints());
    for (let i = 0; i < array.length; i++) {
      this.localStorageService.setItem(`${i}`, JSON.stringify(array[i]));
    }
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
