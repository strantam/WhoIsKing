import {ApplicationRef, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {select, Store} from "@ngrx/store";
import {State} from "../reducers";
import {HttpHandlerService} from "../http-service/http-handler.service";
import {Level} from "../../../../wik-backend/src/openApi/model/level";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {AnimationOptions} from "ngx-lottie";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-level-change',
  templateUrl: './level-change.component.html',
  styleUrls: ['./level-change.component.css']
})
export class LevelChangeComponent implements OnInit, OnDestroy {
  public userLevel: number;
  public selectedLevel: Level;
  public loopCompleted: boolean = false;

  public lottieConfig: AnimationOptions = {
    path: '/assets/animations/fireworks.json',
    renderer: 'canvas',
    autoplay: true,
    loop: false
  };

  private $unsubscribe: Subject<void> = new Subject<void>();
  private levels: Array<Level>;

  constructor(
    private store: Store<State>, private httpHandlerService: HttpHandlerService,
    private changeDetectorRef: ChangeDetectorRef,
    private applicationRef: ApplicationRef,
    private dialogRef: MatDialogRef<LevelChangeComponent>
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.levels = await this.httpHandlerService.getLevels();
    this.store.pipe(select('user'), takeUntil(this.$unsubscribe)).subscribe(user => {
      if (!user) {
        return;
      }
      this.userLevel = user.currentLevel;
      this.selectedLevel = this.levels.find(level => level.index === this.userLevel);
    })
  }

  public loopComplete() {
    this.loopCompleted = true;
    this.changeDetectorRef.detectChanges();
  }

  public close() {
    this.dialogRef.close();
    this.applicationRef.tick();
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

}
