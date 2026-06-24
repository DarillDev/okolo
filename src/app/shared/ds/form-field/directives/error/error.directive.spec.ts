import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ErrorDirective } from './error.directive';

@Component({ template: `<div dsError></div>`, imports: [ErrorDirective] })
class TestComponent {}

describe('ErrorDirective', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
