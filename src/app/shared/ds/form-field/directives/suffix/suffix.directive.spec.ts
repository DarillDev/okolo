import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SuffixDirective } from './suffix.directive';

@Component({ template: `<div dsSuffix></div>`, imports: [SuffixDirective] })
class TestComponent {}

describe('SuffixDirective', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
