import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PrefixDirective } from './prefix.directive';

@Component({ template: `<div dsPrefix></div>`, imports: [PrefixDirective] })
class TestComponent {}

describe('PrefixDirective', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
