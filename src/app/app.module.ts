import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation.component';
import { EditorComponent } from './editor/editor.component';
import { LdtComponent } from './ldt/ldt.component';


@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    EditorComponent,
    LdtComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
