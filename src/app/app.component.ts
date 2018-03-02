import {Component} from '@angular/core';
import {BackendService} from './backend.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  documentContent: String;

  constructor(private service: BackendService) {
    // this.documentContent = service.getDocuments()[0].content;
    service.getDocuments().subscribe(value => {
      if (value.length > 0) {
        this.documentContent = value[0].content;
      }
    });
  }
}
