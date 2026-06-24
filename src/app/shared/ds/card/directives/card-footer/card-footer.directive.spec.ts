import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TDsCardSlotAlign } from '../../types/card-slot-align.type';
import { DsCardFooterDirective } from './card-footer.directive';

@Component({
  imports: [DsCardFooterDirective],
  template: `<div dsCardFooter [align]="align()">Подвал</div>`,
})
class HostComponent {
  readonly align = signal<TDsCardSlotAlign>('start');
}

describe('DsCardFooterDirective', () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    const host = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;
    return { detect: () => fixture.detectChanges(), host, footer: () => el.querySelector('[dsCardFooter]') as HTMLElement };
  }

  it('вешает host-класс ds-card-footer', () => {
    const { detect, footer } = setup();
    detect();
    expect(footer().classList).toContain('ds-card-footer');
  });

  it('применяет align из базы', () => {
    const { detect, host, footer } = setup();
    host.align.set('end');
    detect();
    expect(footer().style.textAlign).toBe('end');
  });
});
