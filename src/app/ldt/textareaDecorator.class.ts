export class TextareaDecorator {
  private input;
  private output;
  private label;
  private textarea;

  constructor(textarea: any,
              private parser: any) {

    const parent = document.createElement('div');
    const output = document.createElement('pre');
    parent.appendChild(output);
    const label = document.createElement('label');
    parent.appendChild(label);
    // replace the textarea with RTA DOM and reattach on label
    textarea.parentNode.replaceChild(parent, textarea);
    label.appendChild(textarea);
    // transfer the CSS styles to our editor
    parent.className = 'ldt ' + textarea.className;
    textarea.className = '';
    // turn off built-in spellchecking in firefox
    textarea.spellcheck = false;
    // turn off word wrap
    textarea.wrap = 'hard';

    this.input = textarea;
    this.output = output;

    // detect all changes to the textarea,
    // including keyboard input, cut/copy/paste, drag & drop, etc
    if (textarea.addEventListener) {
      // standards browsers: oninput event
      textarea.addEventListener('input', this.update.bind(this), false);
    } else {
      // MSIE: detect changes to the 'value' property
      textarea.attachEvent('onpropertychange',
        function (e) {
          if (e.propertyName.toLowerCase() === 'value') {
            this.update();
          }
        }
      );
    }
    // initial highlighting
    this.textarea = textarea;
    this.update();
  }

  static color(input, output, parser) {
    const oldTokens = output.childNodes;
    const newTokens = parser.tokenize(input);
    let firstDiff, lastDiffNew, lastDiffOld;
    // find the first difference
    for (firstDiff = 0; firstDiff < newTokens.length && firstDiff < oldTokens.length; firstDiff++) {
      if (newTokens[firstDiff] !== oldTokens[firstDiff].textContent) {
        break;
      }
    }
    // trim the length of output nodes to the size of the input
    while (newTokens.length < oldTokens.length) {
      output.removeChild(oldTokens[firstDiff]);
    }
    // find the last difference
    for (lastDiffNew = newTokens.length - 1, lastDiffOld = oldTokens.length - 1; firstDiff < lastDiffOld; lastDiffNew--, lastDiffOld--) {
      if (newTokens[lastDiffNew] !== oldTokens[lastDiffOld].textContent) {
        break;
      }
    }
    // update modified spans
    for (; firstDiff <= lastDiffOld; firstDiff++) {
      oldTokens[firstDiff].className = parser.identify(newTokens[firstDiff]);
      oldTokens[firstDiff].textContent = oldTokens[firstDiff].innerText = newTokens[firstDiff].token;
    }
// add in modified spans
    for (const insertionPt = oldTokens[firstDiff] || null; firstDiff <= lastDiffNew; firstDiff++) {
      const span = document.createElement('span');
      span.className = parser.identify(newTokens[firstDiff]);
      console.log(newTokens[firstDiff]);
      span.textContent = span.innerText = newTokens[firstDiff].token;
      output.insertBefore(span, insertionPt);
    }
  }

  update() {
    const input = this.textarea.value;
    if (input) {
      TextareaDecorator.color(input, this.output, this.parser);
      // determine the best size for the textarea
      const lines = input.split('\n');
      // find the number of columns
      let maxlen = 0, curlen;
      for (let i = 0; i < lines.length; i++) {
        // calculate the width of each tab
        let tabLength = 0, offset = -1;
        while ((offset = lines[i].indexOf('\t', offset + 1)) > -1) {
          tabLength += 7 - (tabLength + offset) % 8;
        }
        curlen = lines[i].length + tabLength;
        // store the greatest line length thus far
        maxlen = maxlen > curlen ? maxlen : curlen;
      }
      this.textarea.cols = maxlen + 1;
      this.textarea.rows = lines.length + 1;
    } else {
      // clear the display
      this.output.innerHTML = '';
      // reset textarea rows/cols
      this.textarea.cols = this.textarea.rows = 1;
    }
  }


}


export class Parser {

  private i;
  private parseRE;
  private ruleSrc: any;
  private ruleMap: Object;

  constructor(rules, i) {

    // variables used internally
    this.i = i ? 'i' : '';
    this.parseRE = null;
    this.ruleSrc = [];
    this.ruleMap = {};

    this.add(rules);
  }

  add(rules) {
    for (const rule in rules) {
      const s = rules[rule].source;
      this.ruleSrc.push(s);
      this.ruleMap[rule] = new RegExp('^(' + s + ')$', this.i);
    }
    this.parseRE = new RegExp(this.ruleSrc.join('|'), 'g' + this.i);
  }

  tokenize(input) {
    return input.match(this.parseRE);
  }

  identify(token) {
    for (const rule in this.ruleMap) {
      if (this.ruleMap[rule].test(token)) {
        return rule;
      }
    }
  }
}

/**
 * Markdown parser with latex extension
 *
 * (c) Roman Parpalak, 2015
 * Based on code by Colin Kuebler, 2012
 */

function substrCount(substr, str) {
  var count = -1,
    index = -2;

  while (index != -1) {
    count++;
    index = str.indexOf(substr, index + 1);
  }

  return count;
}

export function MarkdownParser(i) {
  /* INIT */
  var api = this;

  // variables used internally
  i = i ? 'i' : '';
  var parseInlineRE = null,
    parseBlockRE = null,
    ruleMap = {},
    ruleBlockMap = {},
    ruleInlineMap = {},
    runInBlocks = {},
    markers = {};

  var subRules,
    subRulesMap = {},
    subRulesRE = {};

  function addBlockRule(s, rule) {
    var re = new RegExp('^(' + s + ')$', i);
    ruleMap[rule] = re;
    ruleBlockMap[rule] = re;
  }

  function addInlineRule(s, rule) {
    var re = new RegExp('^(' + s + ')$', i);
    ruleMap[rule] = re;
    ruleInlineMap[rule] = re;
  }

  function addSubruleMap(s, rule, block) {
    if (!subRulesMap[block]) {
      subRulesMap[block] = {};
    }
    subRulesMap[block][rule] = new RegExp('^(' + s + ')$', i);
  }

  api.addInlineRules = function (rules) {
    var ruleSrc = [];

    for (var rule in rules) {
      if (rules.hasOwnProperty(rule)) {
        var s = rules[rule].source;
        ruleSrc.push(s);
        addInlineRule(s, rule);
      }
    }

    parseInlineRE = new RegExp('(' + ruleSrc.join('|') + ')', i);

    return this;
  };
  api.addSubRules = function (rules) {
    subRules = rules;

    for (var block in rules) {
      if (rules.hasOwnProperty(block)) {
        var rules2 = rules[block],
          p = [];
        for (var rule in rules2) {
          if (rules2.hasOwnProperty(rule)) {
            var s = rules2[rule].source;
            addSubruleMap(s, rule, block);
            p.push(s);
          }
        }

        subRulesRE[block] = new RegExp('(' + p.join('|') + ')', i);
      }
    }

    return this;
  };
  api.addBlockRules = function (rules) {
    var ruleArray = [];

    for (var rule in rules) {
      if (rules.hasOwnProperty(rule)) {
        var s = rules[rule].source;
        ruleArray.push(s);
        addBlockRule(s, rule);
      }
    }
    parseBlockRE = new RegExp('(' + ruleArray.join('|') + ')', i);

    return this;
  };
  api.addRunIn = function (rules) {
    runInBlocks = rules;

    return this;
  };
  api.addMarkers = function (m) {
    markers = m;

    return this;
  };

  function tokenizeBlock(block, className, lineNum, result) {
    var re = parseInlineRE;

    // Process specific rules for the given block type className
    if (className in subRules) {
      if (subRules[className] === null) {
        result.push({
          token: block,
          block: className,
          line: lineNum
        });

        return;
      }
      else {
        re = subRulesRE[className];
      }
    }

    // Token for a block marker
    if (typeof markers[className] !== 'undefined') {
      var matches = block.match(markers[className]);
      if (matches[2]) {
        result.push({
          token: matches[1],
          block: className + '-mark',
          line: lineNum
        });
        block = matches[2];
        lineNum = 0; // Write block position only once
      }
    }

    var items = block.split(re),
      j = 0, token;

    for (; j < items.length; j++) {
      token = items[j];
      if (token != '') {
        result.push({
          token: token,
          block: className,
          line: lineNum
        });
        lineNum = 0; // Write block position only once
      }
    }
  }

  api.tokenize = function (input) {
    input = input.replace('\r', '');

    var result = [],
      classNames = [],
      blocks = input.split(parseBlockRE),
      blockNum = blocks.length,
      i, prevIndex = 0, prevBlockClass;

    // Merge blocks separated by line breaks
    for (i = 0; i < blockNum; i++) {
      if (blocks[i] === '') {
        continue;
      }

      var className = identify(blocks[i], ruleBlockMap);

      if (prevIndex > 0 && className in runInBlocks) {
        var allowedPrevBlocks = runInBlocks[className].allowedBlocks;
        if (allowedPrevBlocks && allowedPrevBlocks.indexOf(prevBlockClass) >= 0) {
          blocks[prevIndex] += blocks[i];
          blocks[i] = '';
          classNames[i] = '';

          continue;
        }
      }

      classNames[i] = className;

      prevIndex = i;
      prevBlockClass = className;
    }

    var lineBreakCnt = 0;

    for (i = 0; i < blockNum; i++) {
      const block = blocks[i];
      if (block !== '') {
        let lineNum = 0;
        if (classNames[i] !== 'empty') { // TODO move to config
          lineNum = lineBreakCnt;
          lineBreakCnt = 0; // Storing diff between line numbers
        }
        tokenizeBlock(block, classNames[i], lineNum, result);
        lineBreakCnt += substrCount('\n', block);
      }
    }

    return result;
  };
  api.identifyInline = function (tokenObj) {
    const className = tokenObj.block;
    let map = ruleInlineMap;

    if (className in subRules) {
      if (subRules[className] === null) {
        return '';
      } else {
        map = subRulesMap[className];
      }
    }
    return identify(tokenObj.token, map);
  };

  function identify(token, _ruleMap) {
    for (const rule in _ruleMap) {
      if (_ruleMap.hasOwnProperty(rule) && _ruleMap[rule].test(token)) {
        return rule;
      }
    }

    return '';
  }

  api.identify = function (tokenObj) {
    return tokenObj.block;
  };
}
