import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss'],
    standalone: true,
    imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab2Page implements AfterViewInit {
    @ViewChild('map')
    mapRef: ElementRef<HTMLElement>;
    apiKey = environment.apiKey;
    newMap: GoogleMap
    currentLocation = signal({ lat: -23.76, lng: -45.4097 });


    ngAfterViewInit() {
        this.createMap().then();
    }

    async createMap() {
        this.newMap = await GoogleMap.create({
            id: 'my-map', // Unique identifier for this map instance
            element: this.mapRef.nativeElement, // reference to the capacitor-google-map element
            apiKey: this.apiKey, // Your Google Maps API Key
            config: {
                center: {
                    // The initial position to be rendered by the map
                    lat: this.currentLocation().lat,
                    lng: this.currentLocation().lng
                },
                zoom: 16, // The initial zoom level to be rendered by the map
            },
        })
    }

    constructor() { }

}
