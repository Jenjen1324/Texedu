import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LdtComponent } from './ldt.component';

describe('LdtComponent', () => {
  let component: LdtComponent;
  let fixture: ComponentFixture<LdtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LdtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LdtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
