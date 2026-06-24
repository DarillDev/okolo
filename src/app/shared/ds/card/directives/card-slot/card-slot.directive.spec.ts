import { Component, Directive, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TDsCardSlotAlign } from '../../types/card-slot-align.type';
import { DS_CARD_SLOT_HOST, DsCardSlotDirective } from './card-slot.directive';

// Конкретная директива поверх базы — для проверки общих инпутов и host-биндингов.
@Directive({
  selector: '[dsTestSlot]',
  host: { ...DS_CARD_SLOT_HOST },
})
class TestSlotDirective extends DsCardSlotDirective {}

@Component({
  imports: [TestSlotDirective],
  template: `<span dsTestSlot [align]="align()">x</span>`,
})
class HostComponent {
  readonly align = signal<TDsCardSlotAlign>('start');
}

describe('DsCardSlotDirective (база)', () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    const host = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;
    return { detect: () => fixture.detectChanges(), host, slot: () => el.querySelector('[dsTestSlot]') as HTMLElement };
  }

  it('дефолт align=start', () => {
    const { detect, slot } = setup();
    detect();
    expect(slot().style.textAlign).toBe('start');
  });

  it('применяет align', () => {
    const { detect, host, slot } = setup();
    host.align.set('end');
    detect();
    expect(slot().style.textAlign).toBe('end');
  });
});
