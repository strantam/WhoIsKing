import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HeaderTitles} from "./EnumInternalization";
import {AuthGuard} from "./authentication/auth.guard";
import {GeneralLayoutComponent} from "./layout/general-layout/general-layout.component";
import {GameComponent} from "./game/game.component";
import {StatisticsPageComponent} from "./statistics-page/statistics-page.component";
import {SpreadComponent} from "./spread/spread.component";
import {LoggedInComponent} from "./logged-in/logged-in.component";
import {NotLoggedInComponent} from "./not-logged-in/not-logged-in.component";
import {SettingsComponent} from "./settings/settings.component";


const routes: Routes = [
  {
    path: '',
    component: GeneralLayoutComponent,
    children: [
      {
        path: 'game',
        component: GameComponent,
        data: {title: HeaderTitles.GAME, hideBack: true},
      },
      {
        path: 'statistics',
        component: StatisticsPageComponent,
        data: {title: HeaderTitles.STATISTICS, hideBack: true},
      },
      {
        path: 'spread',
        component: SpreadComponent,
        data: {title: HeaderTitles.SPREAD, hideBack: true},
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: {title: HeaderTitles.SETTINGS, hideBack: true},
        canActivate: [AuthGuard]
      },
      {path: '', redirectTo: '/game', pathMatch: 'full'}
    ]
  },
  {
    path: 'loggedin',
    component: LoggedInComponent,
    canActivate: [AuthGuard],
    outlet: 'footerinfo'
  },
  {
    path: 'loggedout',
    component: NotLoggedInComponent,
    outlet: 'footerinfo'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
