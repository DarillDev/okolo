import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TDsCardSlotAlign } from '../../types/card-slot-align.type';
import { DsCardHeaderDirective } from './card-header.directive';

@Component({
  imports: [DsCardHeaderDirective],
  template: `<h3 dsCardHeader [align]="align()">Заголовок</h3>`,
})
class HostComponent {
  readonly align = signal<TDsCardSlotAlign>('start');
}

describe('DsCardHeaderDirective', () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    const host = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;
    return { detect: () => fixture.detectChanges(), host, header: () => el.querySelector('[dsCardHeader]') as HTMLElement };
  }

  it('вешает host-класс ds-card-header', () => {
    const { detect, header } = setup();
    detect();
    expect(header().classList).toContain('ds-card-header');
  });

  it('применяет align из базы', () => {
    const { detect, host, header } = setup();
    host.align.set('end');
    detect();
    expect(header().style.textAlign).toBe('end');
  });
});
