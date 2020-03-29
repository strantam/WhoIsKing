import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CityStatisticsComponent } from './city-statistics.component';

describe('CityStatisticsComponent', () => {
  let component: CityStatisticsComponent;
  let fixture: ComponentFixture<CityStatisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CityStatisticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
