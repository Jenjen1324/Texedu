import {markdownitS2Tex} from './markdown-it-s2-tex';
import * as MarkdownIt from 'markdown-it';

export class UpMathEditor {

  private editor;
  private preview;

  constructor() {
    const defaults = {
      html: true,         // Enable HTML tags in source
      xhtmlOut: false,        // Use '/' to close single tags (<br />)
      breaks: false,        // Convert '\n' in paragraphs into <br>
      langPrefix: 'language-',  // CSS language prefix for fenced blocks
      linkify: true,         // autoconvert URL-like texts to links
      typographer: true,         // Enable smartypants and other sweet transforms
      quotes: '""\'\'',

      // option for tex plugin
      _habr: {protocol: ''},    // no protocol for habrahabr markup

      // options below are for demo only
      _highlight: true,
      _strict: false
    };

    this.editor = new MarkdownIt(defaults)
      .use(markdownitS2Tex);

    this.preview = new MarkdownIt(defaults)
      .use(markdownitS2Tex);

    this.editor.renderer.rules.paragraph_open = UpMathEditor.injectLineNumbersAndCentering;
    this.editor.renderer.rules.heading_open = UpMathEditor.injectLineNumbersAndCentering;

    this.preview.renderer.rules.paragraph_open = UpMathEditor.injectCentering;
    this.preview.renderer.rules.heading_open = UpMathEditor.injectCentering;


  }

  public render(markup: String): String {

    return this.preview.render(markup);
  }

  /**
   * Detects if the paragraph contains the only formula.
   * Parser gives the class 'tex-block' to such formulas.
   *
   * @param tokens
   * @param idx
   * @returns {boolean}
   */
  static hasBlockFormula(tokens, idx): boolean {
    if (idx >= 0 && tokens[idx] && tokens[idx].children) {
      for (let i = tokens[idx].children.length; i--;) {
        if (tokens[idx].children[i].tag === 'tex-block') {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Inject line numbers for sync scroll. Notes:
   * - We track only headings and paragraphs on first level. That's enough.
   * - Footnotes content causes jumps. Level limit filter it automatically.
   *
   * @param tokens
   * @param idx
   * @param options
   * @param env
   * @param self
   */
  static injectLineNumbersAndCentering(tokens, idx, options, env, self) {
    let line;
    if (tokens[idx].map && tokens[idx].level === 0) {
      line = tokens[idx].map[0];
      tokens[idx].attrPush(['class', 'line']);
      tokens[idx].attrPush(['data-line', line + '']);
    }

    // Hack (maybe it is better to use block renderers?)
    if (UpMathEditor.hasBlockFormula(tokens, idx + 1)) {
      tokens[idx].attrPush(['align', 'center']);
      tokens[idx].attrPush(['style', 'text-align: center;']);
    }

    return self.renderToken(tokens, idx, options, env, self);
  }

  static injectCentering(tokens, idx, options, env, self) {
    // Hack (maybe it is better to use block renderers?)
    if (UpMathEditor.hasBlockFormula(tokens, idx + 1)) {
      tokens[idx].attrPush(['align', 'center']);
      tokens[idx].attrPush(['style', 'text-align: center;']);
    }
    return self.renderToken(tokens, idx, options, env, self);
  }

}
