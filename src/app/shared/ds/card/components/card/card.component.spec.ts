import { TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  function setup() {
    const fixture = TestBed.createComponent(CardComponent);
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('создаётся', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('по умолчанию — панель без своего размерного класса', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(el.classList).toContain('panel');
    expect(['S', 'M', 'L', 'XL'].some((s) => el.classList.contains(s))).toBe(false);
  });

  it('переключается на стеклянную поверхность', () => {
    const { fixture, el } = setup();
    fixture.componentRef.setInput('appearance', 'glass');
    fixture.detectChanges();
    expect(el.classList).toContain('glass');
    expect(el.classList).not.toContain('panel');
  });

  it('явный размер ставит размерный класс на хост', () => {
    const { fixture, el } = setup();
    fixture.componentRef.setInput('size', 'XL');
    fixture.detectChanges();
    expect(el.classList).toContain('XL');
  });

  it('интерактивная карточка получает role=button и tabindex', () => {
    const { fixture, el } = setup();
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    expect(el.classList).toContain('interactive');
    expect(el.getAttribute('role')).toBe('button');
    expect(el.getAttribute('tabindex')).toBe('0');
  });

  it('неинтерактивная карточка не выставляет role/tabindex', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(el.getAttribute('role')).toBeNull();
    expect(el.getAttribute('tabindex')).toBeNull();
  });

  it('включает входную анимацию по флагу reveal', () => {
    const { fixture, el } = setup();
    fixture.componentRef.setInput('reveal', true);
    fixture.detectChanges();
    expect(el.classList).toContain('reveal');
  });
});
