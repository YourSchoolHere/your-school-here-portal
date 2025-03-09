import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CodeModel } from '@ngstack/code-editor';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent {
  @Input() codeLanguage = "js";
  @Input() code = "";
  @Input() isStudentMode = false;
  @Output() notifyLangChange = new EventEmitter<string>();
  @Output() codeUpdate = new EventEmitter<any>();
  model: CodeModel = {
    language: "javascript",
    uri: "main.js",
    value: ""
  };
  modelOpts!: { [k: string]: CodeModel };
  languages!: { name: string, value: string }[];
  constructor(public user: UserService) {
    (async() => {
      let res = await fetch("./codeModelOptions.json");
      let data = await res.json();
      this.modelOpts = data["editor-configs"];
      this.languages = data["supported-languages"];
      this.updateEditor();
    })();
  }

  updateEditor() {
    let model = {...this.modelOpts[this.codeLanguage], value: this.code};
    this.model = JSON.parse(JSON.stringify(model));
  }

  options = {
    contextmenu: false,
    minimap: {
      enabled: false,
    },
    quickSuggestions: false,
    inlineSuggest: {
      enabled: false
    },
    screenReaderAnnounceInlineSuggestion: false,
    snippetSuggestions: "none",
    hover: {
      enabled: false
    },
    overviewRulerLanes: 0,
    scrollbar: {
      vertical: "hidden",
      horizontal: "hidden"
    }
  };

  getLangName() {
    return this.languages.length ? this.languages.filter(obj => obj.value == this.codeLanguage)[0].name : "";
  }

  langChanged(ev: any) {
    this.notifyLangChange.emit(ev.target.value);
  }

  onCodeChanged(value:any) {
    this.codeUpdate.emit(value);
  }
}
