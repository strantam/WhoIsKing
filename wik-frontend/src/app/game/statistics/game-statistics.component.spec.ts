import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameStatisticsComponent } from './game-statistics.component';

describe('StatisticsComponent', () => {
  let component: GameStatisticsComponent;
  let fixture: ComponentFixture<GameStatisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameStatisticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
