import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MarkdownParser, TextareaDecorator} from './textareaDecorator.class';

@Component({
  selector: 'app-ldt',
  templateUrl: './ldt.component.html',
  styleUrls: ['./ldt.component.scss']
})
export class LdtComponent implements OnInit {

  @Input() editorContent: String;
  @Output() editorChanged = new EventEmitter<String>();

  constructor() {
  }

  onKeyUp(text: String) {
    this.editorChanged.emit(text);
  }

  ngOnInit() {
    // Markdown syntax parser
    const mdParser = new MarkdownParser(undefined);
    mdParser
      .addBlockRules({
        latexBlock: /[ \t]*\$\$\n?(?:[^\n]+\n)*(?:[^\n]*[^\\\n])?\$\$(?:[ \t]*\([ \t]*\S+[ \t]*\))?[ \t]*(?:\n|$)/,
        empty: /(?:[ \t]*\n)+/,
        fence: /```[\s\S]*?(?:$|```(?:\n|$))/,
        reference: /\[[^\]]+\]\:[^\n]*(?:\n|$)/,
        header: /#{1,6} [^\n]*(?:\n|$)/,
        header2: /[^\n]+\n[ \t]*[=-]{2,}(?:\n|$)/,
        rule: /(?:[\*]{3,}|[\-]{3,}|[\_]{3,})(?:\n|$)/,
        list: /[ ]{0,3}(?:[+\-\*]|\d+\.)[ \t]+[^\n]*(?:\n[ \t]*[^\n\t ]+[ \t]*)*(?:\n|$)/,
        quote: /[ ]{0,3}>[^\n]*(?:\n|$)/,
        paragraph: /[\s\S]*?(?:\n|$)/
      })
      .addInlineRules({
        latex: /\$\$(?:[\s\S]*?[^\\])?\$\$/,
        link: /\[.+?\][\(\[].*?[\)\]]/,
        bold: /(?:\s|^)__[\s\S]*?\S__|\*\*[\s\S]*?\S\*\*/,
        italic: /(?:\s|^)_[\s\S]*?[^\\\s]_|\*[^\\\s]\*|\*\S[\s\S]*?[^\\\s]\*/,
        strike: /~~.+?~~/,
        sup: /\^.+?\^/,
        sub: /~.+?~/,
        code: /``.+?``|`.*?[^`\\]`(?!`)/
      })
      .addSubRules({
        fence: null,
        rule: null,
        latexBlock: {
          comment: /%[^\n]*?(?=\$\$)|%[^\n]*/,
          reference: /[ \t]*\([ \t]*\S+[ \t]*\)[ \t\n]*$/,
          index: /(?:\^|_)(?:\\[a-zA-Zа-яА-я]+[\*]?(?:\{.*?\})|\{[a-zA-Zа-яА-я0-9]*?\}|[a-zA-Zа-яА-я0-9])/,
          bracket: /(?:(?:\\left|\\right)?[\{\}\[\]\(\)\|])/,
          keyword: /\\[a-zA-Zа-яА-я]+[\*]?/,
          keyword2: /\\[^a-zA-Zа-яА-я0-9]/,
          keyword3: /&/,
          delimeter: /\$\$/
        }
      })
      .addRunIn({
        paragraph: {
          allowedBlocks: ['paragraph', 'quote', 'list']
        }
      })
      .addMarkers({
        list: /^([ ]{0,3}(?:[+\-\*]|\d+\.)[ \t]+)([\s\S]*)$/,
        quote: /^([ ]{0,3}(?:>[ \t]*)+)([\s\S]*)$/
      });

    const decorator = new TextareaDecorator(
      document.getElementById('editor_textarea'),
      mdParser);

    this.onKeyUp(this.editorContent);
    decorator.update();
  }

}
