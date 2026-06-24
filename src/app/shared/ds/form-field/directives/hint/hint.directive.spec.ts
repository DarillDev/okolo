import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HintDirective } from './hint.directive';

@Component({ template: `<div dsHint></div>`, imports: [HintDirective] })
class TestComponent {}

describe('HintDirective', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
