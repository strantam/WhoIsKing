// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  dev: false,
  googleMapsAPIKey: 'AIzaSyBCCxb_1EVuqM6I1m6Y4RflazFRIdYLdB4',
  apiUrl: "http://localhost:9090/api/",
  firebaseConfig: {
    apiKey: "AIzaSyCYHbnfzyMG9nWIuUoqO-fMEmnGf8SZnzg",
    authDomain: "who-is-king.firebaseapp.com",
    databaseURL: "https://who-is-king.firebaseio.com",
    projectId: "who-is-king",
    storageBucket: "who-is-king.appspot.com",
    messagingSenderId: "908395210041",
    appId: "1:908395210041:web:203fff607a097206a5b4e8"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
