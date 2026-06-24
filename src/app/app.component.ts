import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  FormFieldComponent,
  LabelDirective,
  PrefixDirective,
  SuffixDirective,
  HintDirective,
  ErrorDirective,
  TFormFieldAppearance,
  TFormFieldShape,
} from '@shared/ds/form-field';
import { InputDirective } from '@shared/ds/input';
import { TDsSize } from '@shared/models/types/ds-size.type';

interface IDemoVariant {
  readonly appearance: TFormFieldAppearance;
  readonly shape: TFormFieldShape;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FormFieldComponent,
    LabelDirective,
    PrefixDirective,
    SuffixDirective,
    HintDirective,
    ErrorDirective,
    InputDirective,
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly title = signal('okolo');

  protected readonly appearances: readonly TFormFieldAppearance[] = [
    'outline',
    'glass',
    'filled',
    'ghost',
  ];
  protected readonly shapes: readonly TFormFieldShape[] = ['box', 'pill'];
  protected readonly sizes: readonly TDsSize[] = ['S', 'M', 'L', 'XL'];

  protected readonly matrix: readonly IDemoVariant[] = this.appearances.flatMap((appearance) =>
    this.shapes.map((shape) => ({ appearance, shape })),
  );
}
