import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLicense } from "@syncfusion/ej2-base";

import { AppModule } from './app/app.module';

registerLicense("Ngo9BigBOggjHTQxAR8/V1NMaF5cXmBCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXxednVcR2NZVEF3Xks=");

platformBrowserDynamic().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true
})
  .catch(err => console.error(err));
