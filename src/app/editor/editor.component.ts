import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UpMathEditor} from './editor.class';
import {BackendService} from '../backend.service';
import {MdDocument} from '../document';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  @Input() content: String;
  @Output() previewUpdated = new EventEmitter<String>();

  preview: String = '';

  private typingTimer;
  private typingInterval = 500;
  private markup: String = '';
  private editor: UpMathEditor;

  private doc: MdDocument;


  constructor(private backend: BackendService) {
    this.editor = new UpMathEditor();
    this.doc = new MdDocument();
    this.doc.name = 'Test';
  }

  editorChanged(text: String): void {
    this.doc.content = text;
    this.markup = text;
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      console.log('Updating..');
      this.preview = this.editor.render(text);
      this.backend.saveDocument(this.doc);
    }, this.typingInterval);
  }

  editorChangedActual(text: String): void {
  }

  ngOnInit() {
  }

}
