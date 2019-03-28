'use babel';

import FuAtomView from './fu-atom-view';
import { CompositeDisposable } from 'atom';

export default {

  fuAtomView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.fuAtomView = new FuAtomView(state.fuAtomViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.fuAtomView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'fu-atom:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.fuAtomView.destroy();
  },

  serialize() {
    return {
      fuAtomViewState: this.fuAtomView.serialize()
    };
  },

  toggle() {
    console.log('FuAtom was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
