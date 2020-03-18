import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { I18nSnackBarComponent } from './i18n-snack-bar.component';

describe('I18nSnackBarComponent', () => {
  let component: I18nSnackBarComponent;
  let fixture: ComponentFixture<I18nSnackBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ I18nSnackBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(I18nSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
