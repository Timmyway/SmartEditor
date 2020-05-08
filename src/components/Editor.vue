<template>
  <div class="container-fluid">
    <splitpanes class="default-theme" style="height: 640px;">      
      <pane v-show="preview.code" size="60">
        <splitpanes horizontal>
          <pane>
            <div :class="[ideViewMode.ide, ideViewMode.toogleView ? ideViewMode.mobile : ideViewMode.fixed]">
              <!-- Toolbar - Pos: Horizontal - Utility: Search & Replace -->
              <div v-if="toolBars.search.visible" class="btn-toolbar fixed-top" role="toolbar" aria-label="Toolbar with button groups">
                <div class="d-flex">
                    <div class="mr-2">
                      <span v-if="foundItems" class="mt-2 badge badge-success badge-pill float-left">{{ foundItems.length }}</span>
                    </div>
                    <div class="mr-2">              
                      <input class="form-control" ref="search-input" type="text" v-model="searchText" placeholder="Search text">
                    </div>
                    <div class="mr-2">
                      <input class="form-control" type="text" v-model="replaceText" placeholder="Replace text">
                    </div>
                    <div class="mr-2 d-flex">
                      <button @click="findAll()" type="button" class="btn"><i class="fab fa-lg fa-searchengin"></i></button>
                      <button @click="replaceAll()" type="button" class="btn"><i class="fas fa-lg fa-retweet"></i></button>
                    </div>
                    
                </div>        
              </div>
              <textarea 
                name="code" ref="code" id="code"
                :v-model="content"
              ></textarea>                   
            </div>
          </pane>
          <pane>
            <div class="scrollableBox">
                <ul class="list-group">
                  <li 
                    v-for="(item,index) in foundItems" :key="index"
                    class="list-group-item list-group-flush truncate found-item-row"
                    @click="scrollIntoView(item.from, item.to)"                    
                  >
                    <span class="badge badge-primary badge-pill float-left">{{ item.from.line + 1 }}</span>
                    {{ item.text }} 
                  </li>
                </ul>
              </div>
          </pane>          
        </splitpanes>
      </pane>
      <pane v-if="preview.crea" :class="preview.overlayMode ? 'overlay-view' : 'normal-view'">
        <PreviewFrame :source="content" />
      </pane>
    </splitpanes>
    

    <!-- Toolbar - Pos: Vertical - Utility: Display command buttons -->
    <div class="btn-toolbar fixed-left mt-5" role="toolbar" aria-label="Toolbar with button groups">
      <div 
        :class="toolBars.commands.opacity"
        @mouseover="toolBars.commands.opacity = 'fully-visible'"
        @mouseleave="toolBars.commands.opacity = 'low-visible'"
      >
        <div class="btn-group-vertical mr-2" role="group" aria-label="First group">          
          <button @click="clear()" type="button" class="btn btn-secondary">
            <i class="fas fa-times" style="color: Tomato;"></i>
          </button>          
          <button @click="selectAll()" type="button" class="btn btn-secondary">Sel</button>
          <button @click="toolBars.search.visible = !toolBars.search.visible" type="button" class="btn btn-secondary">SB</button>
          <button @click="ideViewMode.toogleView = !ideViewMode.toogleView" type="button" class="btn btn-secondary">
            <i class="fas fa-expand-arrows-alt"></i>
          </button>
          <button @click="preview.crea = !preview.crea" type="button" class="btn btn-secondary">
            <i class="far fa-eye" :style="preview.crea ? `color: ${colors.good};` : `color: ${colors.bad}`"></i>
          </button>
          <button @click="hideEditor" type="button" class="btn btn-secondary">
            <i class="fas fa-code" :style="preview.code ? `color: ${colors.good};` : `color: ${colors.bad}`"></i>
          </button>
          <button v-if="preview.crea" @click="preview.overlayMode = !preview.overlayMode" type="button" class="btn btn-secondary">
            <i class="fas fa-mask" :style="preview.overlayMode ? `color: ${colors.good};` : `color: ${colors.bad}`"></i>
          </button>
        </div>
      </div>
    </div>    
  </div>
</template>

<script>
import CodeMirror from 'codemirror/lib/codemirror.js'
import 'codemirror/mode/htmlmixed/htmlmixed.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/search/search.js'
import 'codemirror/addon/search/jump-to-line.js'
import 'codemirror/addon/dialog/dialog.js'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import PreviewFrame from './PreviewFrame.vue'

export default {
  name: 'Editor',
  components: { Splitpanes, Pane, PreviewFrame },
  data: function() {
    return {
      editor: '',
      editorConfig: {
        lineNumbers: true,
        mode: 'htmlmixed',        
        autoCloseTags: true,
        lineWrapping: true,
        extraKeys: {
          "Ctrl-F": () => {
            this.toolBars.search.visible = true;
            this.searchText = this.editor.getSelection();
            this.$refs['search-input'].focus();
          }
        }
      },
      preview: {
        code: true,
        crea: true,
        overlayMode: false,        
      },
      colors: {
        good: 'rgb(80, 223, 126)',
        bad: 'rgb(192, 53, 57)'
      },
      content: '',
      searchText: '',
      replaceText: '',
      foundItems: [],
      viewMode: 'normal',
      ideViewMode: {
        ide: 'ide',        
        mobile: 'mobile',
        fixed: 'fixed-top',
        toogleView: true
      },
      toolBars: {
        search: {opacity: 'low-visible', visible: true},
        commands: {opacity: 'low-visible', visible: true}
      }
    }
  },
  created() {
    console.log('Started')
    this.initEditor();    
  },
  mounted() {
    setTimeout(() => {
      this.editor.on('change', () => this.updateValue())
    }, 100); 
  },
  methods: {
    hideEditor() {
      this.preview.code = !this.preview.code
      this.editor.refresh();
    },
    initEditor() {
      setTimeout(() => {
        const code = this.$refs.code;
        this.editor = CodeMirror.fromTextArea(code, this.editorConfig);        
      }, 0);      
    },
    selectAll() {
      CodeMirror.commands["selectAll"](this.editor);
    },
    setSize(w=640, h=480) {
      this.editor.setSize(w, h)
    },
    updateValue() {
      console.log('Update value')
      this.content = this.editor.getValue();
      if (!this.content) {
        this.foundItems.length = 0;
      }
    },
    clear() {
      console.log('Clear');      
      this.content = '';
      this.editor.setValue('')
    },
    findAll() {
      this.foundItems.length = 0;
      const markerClassName = 'hl';      
      const cursor = this.editor.getSearchCursor(this.searchText);
      var first, from, to;
      while (cursor.findNext()) {
          from = cursor.from();
          to = cursor.to();
          this.editor.markText(from, to, {
              className: markerClassName
          });
          var dest = {line: to.line, ch: to.ch + 75, sticky: null}          
          this.editor.setSelection(from, dest)
          console.log(from, to)
          this.foundItems.push({from: from, to: to, text: this.editor.getSelection()});
          if (first === undefined) {
              first = from;
          }
      }
      if (first) {
          this.editor.scrollIntoView(first);
      }
    },
    scrollIntoView(from, to) {
      this.editor.markText(from, to, {
        className: 'found-text'
      });
      this.editor.scrollIntoView(from.line);
    },
    replaceAll() {
      this.foundItems.length = 0;      
      const cursor = this.editor.getSearchCursor(this.searchText);
      var first, from, to;
      while (cursor.findNext()) {
          from = cursor.from();
          to = cursor.to();                              
          this.editor.replaceRange(this.replaceText, from, to);
          if (first === undefined) {
              first = from;
          }
      }
      if (first) {
          this.editor.scrollIntoView(first);
      }
    }
  },
  // watch: {
  //   content(val) {
  //     console.log('Content has changed... I have to update editor')
  //     this.editor.setValue(val);
  //   }
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .ide {
    margin-left: 2.6rem;
    margin-top: 0;
  }

  .mobile {
    position: block;
    margin-left: 2.6rem;
  }

  .normal-view {
    position: block;        
  }
  .overlay-view {
    position: absolute;
    top: 0; right: 0; left: 0; right: 0;
    background: rgba(0, 0, 0, 0.8);
    width: 100% !important; height: 100%!important;
    z-index: 10;
  }

  .fixed-top {
    position: fixed;
    top: 0;
    z-index: 2;
  }

  .fixed-left {
    position: fixed;
    top: 0;
    left: 0; 
    z-index: 999;   
  }

  .s-micro {max-width: 25px; background: red;}

  .low-visible {opacity: .2;}
  .semi-visible {opacity: .5;}
  .fully-visible {opacity: 1;}

  .hl {
    background: rgb(247, 206, 4);
  }
  .found-text {
    background: rgb(71, 218, 98);
  }

  .truncate {
  width: 1000;
  display: block;
  text-align: left;  
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scrollableBox {
  background: #D7D2D4;  
  max-height: 320px;
  padding: 0.4rem;
  overflow-y: auto;   
  display: flex;
  flex-direction: column;
}

  .CodeMirror {
    text-align: left;    
    height: 320px !important;
    background: #DCD3EA;    
    text-align: left;
  }
  .CodeMirror-selected { background: rgb(67, 174, 190, 0.3) !important; }

  .splitpanes__pane {
    justify-content: center;
    align-items: center;    
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2) inset;
  }
  .splitpanes__pane > span, 
  .splitpanes__pane > div,
  .splitpanes__pane > p {    
    color: royalblue;    
  }

  .found-item-row {
    cursor: pointer;
  }
  .found-item-row:hover {
    background: rgb(67, 174, 190, 0.3);
  }
</style>
