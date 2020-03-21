import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {MatSidenavModule} from "@angular/material/sidenav";
import {HeaderComponent} from './navigation/header/header.component';
import {MatToolbarModule} from "@angular/material/toolbar";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {LayoutComponent} from './layout/layout.component';
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {CommonModule, DatePipe, I18nSelectPipe} from "@angular/common";
import {MatTabsModule} from "@angular/material/tabs";
import {SidenavListComponent} from './navigation/sidenav-list/sidenav-list.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDialogModule} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {AreYouSureModalComponent} from './generic-modals/are-you-sure/are-you-sure-modal.component';
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatExpansionModule} from "@angular/material/expansion";
import {MinutePipe} from "./generic-pipes/minute.pipe";
import {MatTableModule} from "@angular/material/table";
import {MatCardModule} from "@angular/material/card";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {registerLocaleData} from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import {I18nSnackBarComponent} from './generic-modals/i18n-snack-bar/i18n-snack-bar.component';
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {ChartsModule} from "ng2-charts";
import {LoginComponent} from './authentication/login/login.component';
import {AngularFireModule} from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AuthInterceptor} from "./authentication/auth.interceptor";
import {GeneralLayoutComponent} from './layout/general-layout/general-layout.component';
import {LottieAnimationViewModule} from "ng-lottie";
import {SpreadComponent} from './spread/spread.component';
import {GameComponent} from './game/game.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {NotLoggedInComponent} from './not-logged-in/not-logged-in.component';
import {LoggedInComponent} from './logged-in/logged-in.component';
import { AddCityComponent } from './addcity/add-city.component';

registerLocaleData(localeHu);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LayoutComponent,
    SidenavListComponent,
    AreYouSureModalComponent,
    MinutePipe,
    I18nSnackBarComponent,
    LoginComponent,
    GeneralLayoutComponent,
    SpreadComponent,
    GameComponent,
    StatisticsComponent,
    NotLoggedInComponent,
    LoggedInComponent,
    AddCityComponent,

  ],
  imports: [
    LottieAnimationViewModule.forRoot(),
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    BrowserModule,
    AppRoutingModule,
    MatMenuModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    CommonModule,
    MatTabsModule,
    MatSidenavModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatRadioModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
    FormsModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatTableModule,
    MatCardModule,
    MatSelectModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    ChartsModule
  ],
  entryComponents: [
    AreYouSureModalComponent,
    I18nSnackBarComponent,
    LoginComponent,
    AddCityComponent
  ],
  providers: [DatePipe, I18nSelectPipe, {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule {
}
