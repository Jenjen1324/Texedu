import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {MdDocument} from './document';

@Injectable()
export class BackendService {

  private urlroot = 'http://localhost/api';
  private url_getDocuments = this.urlroot + '/documents';
  private url_saveDocument = this.urlroot + '/document/save';

  constructor(private http: HttpClient) {
  }

  public getDocuments(): Observable<Array<MdDocument>> {
    return this.http.get<Array<MdDocument>>(this.url_getDocuments);
  }

  public saveDocument(doc: MdDocument) {
    return this.http.post(this.url_saveDocument, doc)
      .subscribe(_ => console.log('Content updated'));
  }

}
