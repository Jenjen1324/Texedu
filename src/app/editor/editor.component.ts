import {Component, OnInit} from '@angular/core';
import {UpMathEditor} from './editor.class';
import {TextareaDecorator} from 'ldt';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  preview: String = '';

  private typingTimer;
  private typingInterval = 500;
  private markup: String = '';
  private editor: UpMathEditor;

  constructor() {
    this.editor = new UpMathEditor();
    let a = new TextareaDecorator();

  }

  editorChanged(text: String): void {
    this.markup = text;
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => { this.preview = this.editor.render(text); }, this.typingInterval);
  }

  private updatePreview(text: String): void {



  }

  ngOnInit() {
  }

}
