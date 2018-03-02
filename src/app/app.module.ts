import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import {NavigationComponent} from './navigation/navigation.component';
import {EditorComponent} from './editor/editor.component';
import {LdtComponent} from './ldt/ldt.component';
import {BackendService} from './backend.service';
import {HttpClientModule} from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    EditorComponent,
    LdtComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [BackendService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
