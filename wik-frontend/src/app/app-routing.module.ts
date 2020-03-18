import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SettingsComponent} from "./settings/settings.component";
import {HeaderTitles} from "./EnumInternalization";
import {LoginComponent} from "./authentication/login/login.component";
import {AuthGuard} from "./authentication/auth.guard";
import {GeneralLayoutComponent} from "./layout/general-layout/general-layout.component";


const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: GeneralLayoutComponent,
    children: [
      {
        path: 'settings',
        component: SettingsComponent,
        data: {title: HeaderTitles.SETTINGS, hideBack: true},
        canActivate: [AuthGuard],
      },
      {path: '', redirectTo: '/settings', pathMatch: 'full'}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
