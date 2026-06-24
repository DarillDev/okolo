import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LabelDirective } from './label.directive';

@Component({ template: `<div dsLabel></div>`, imports: [LabelDirective] })
class TestComponent {}

describe('LabelDirective', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
