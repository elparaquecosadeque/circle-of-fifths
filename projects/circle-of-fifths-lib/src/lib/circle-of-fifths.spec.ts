import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleOfFifthsComponent } from './circle-of-fifths';

describe('CircleOfFifthsComponent', () => {
  let component: CircleOfFifthsComponent;
  let fixture: ComponentFixture<CircleOfFifthsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircleOfFifthsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CircleOfFifthsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders Spanish content when requested', async () => {
    fixture.componentRef.setInput('language', 'es');
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Círculo de quintas');
  });
});
