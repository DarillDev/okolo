import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CardComponent, DsCardHeaderDirective } from '@shared/ds';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CardComponent, DsCardHeaderDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly title = signal('okolo');
}
