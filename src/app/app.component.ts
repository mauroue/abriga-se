import { Component, LOCALE_ID } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
})
export class AppComponent {
  constructor() {}
}
