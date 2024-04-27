import {
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  OnInit,
  Signal,
  ViewChild,
  signal,
} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment';
import {
  Geolocation,
  PermissionStatus,
  Position,
} from '@capacitor/geolocation';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Tab2Page implements OnInit {
  @ViewChild('map')
  mapRef: ElementRef<HTMLElement>;
  apiKey = environment.apiKey;
  newMap: GoogleMap | any;
  currentLocation: BehaviorSubject<Position | GeolocationPosition | any> =
    new BehaviorSubject({});
  actualPermission: PermissionStatus;

  constructor() {}

  ngOnInit(): void {
    this.checkPermissions().then(() => {
      if (this.actualPermission.location == 'granted') {
        this.watchCurrentLocation().then();
      } else {
        this.checkPermissions().then();
      }
    });
  }

  async createMap(position: GeolocationPosition): Promise<any> {
    if (!this.newMap) {
      this.newMap = await GoogleMap.create({
        id: 'my-map',
        element: this.mapRef.nativeElement,
        apiKey: this.apiKey,
        config: {
          center: {
            lat: position?.coords?.latitude,
            lng: position?.coords?.longitude,
          },
          zoom: 16,
        },
      }).then();
    } else {
      this.newMap.setCamera({
        center: {
          lat: position?.coords?.latitude,
          lng: position?.coords?.longitude,
        },
        zoom: 16,
      });
    }
  }

  async createPin(position: GeolocationPosition) {
    await this.newMap.addMarker({
      coordinate: {
        lat: position?.coords?.latitude,
        lng: position?.coords?.longitude,
      },
    });
  }

  async checkPermissions() {
    this.actualPermission = await Geolocation.checkPermissions();

    if (this.actualPermission.location == 'denied') {
      await Geolocation.requestPermissions();
    }
  }

  // async getCurrentLocation(): Promise<any> {
  //   try {
  //     const position: Position = await Geolocation.getCurrentPosition({
  //       enableHighAccuracy: true,
  //       timeout: 3000,
  //     });
  //     return position?.coords;
  //   } catch (err) {
  //     console.error(err);
  //     return null;
  //   }
  // }

  async watchCurrentLocation(): Promise<any> {
    try {
      await Geolocation.watchPosition(
        {
          timeout: 5000,
          enableHighAccuracy: true,
          maximumAge: 0,
        },
        (position) => {
          this.currentLocation.next(position);
          this.createMap(this.currentLocation.getValue()).then(() => {
            this.createPin(this.currentLocation.getValue()).then();
          });
        }
      );
    } catch (err) {
      if (!this.currentLocation.getValue()) {
        this.watchCurrentLocation();
      }
      console.error(err);
      return null;
    }
  }
}
