import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { EncryptionInterceptor } from './core/interceptors/encryption.interceptor';



@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CoreModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(
      {
        positionClass: 'toast-top-right',
        timeOut: 3000,
        closeButton: true,
        progressBar: true,
      }
    ),
  ],
  providers: [
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
