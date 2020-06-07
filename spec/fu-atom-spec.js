'use babel';

import FuAtom from '../lib/fu-atom';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.
import * as path from 'path';
import {
  // eslint-disable-next-line no-unused-vars
  it, fit, wait, beforeEach, afterEach,
} from 'jasmine-fix';

const { lint } = require('../lib/init.js').provideLinter();

const validPath = path.join(__dirname, 'fixtures', 'valid.html');
const madPath = path.join(__dirname, 'fixtures', 'missing-alert-dismissible.html');
const confErrPath = path.join(__dirname, 'fixtures', 'config-errors.html');

const jqueryText = 'W005 Unable to locate jQuery, which is required for '
  + "Bootstrap's JavaScript plugins to work; however, you might not be "
  + "using Bootstrap's JavaScript";
const W003head = 'W003 `<head>` is missing viewport `<meta>` tag that '
  + 'enables responsiveness';

describe('The bootlint provider for Linter', () => {
  beforeEach(async () => {
    atom.workspace.destroyActivePaneItem();
    await atom.packages.activatePackage('language-html');
    await atom.packages.activatePackage('linter-bootlint');
  });

  it('checks a file with issues', async () => {
    const editor = await atom.workspace.open(madPath);
    const messages = await lint(editor);
    const messageText = 'E033 `.alert` with dismiss button must have '
      + 'class `.alert-dismissible`';

    expect(messages.length).toBe(1);
    expect(messages[0].severity).toBe('error');
    expect(messages[0].excerpt).toBe(messageText);
    expect(messages[0].location.file).toBe(madPath);
    expect(messages[0].location.position).toEqual([[25, 24], [25, 56]]);
  });

  it('finds nothing wrong with a valid file', async () => {
    const editor = await atom.workspace.open(validPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(0);
  });

  it('shows configuration errors', async () => {
    const editor = await atom.workspace.open(confErrPath);
    const messages = await lint(editor);
    const messageText = 'W002 `<head>` is missing X-UA-Compatible `<meta>` '
      + 'tag that disables old IE compatibility modes';

    expect(messages.length).toBe(3);
    expect(messages[0].severity).toBe('error');
    expect(messages[0].excerpt).toBe(messageText);
    expect(messages[0].location.file).toBe(confErrPath);
    expect(messages[0].location.position).toEqual([[0, 0], [0, 15]]);
    expect(messages[1].severity).toBe('error');
    expect(messages[1].excerpt).toBe(W003head);
    expect(messages[1].location.file).toBe(confErrPath);
    expect(messages[1].location.position).toEqual([[0, 0], [0, 15]]);
    expect(messages[2].severity).toBe('error');
    expect(messages[2].excerpt).toBe(jqueryText);
    expect(messages[2].location.file).toBe(confErrPath);
    expect(messages[2].location.position).toEqual([[0, 0], [0, 15]]);
  });

  it('allows disabling of specific errors', async () => {
    atom.config.set('linter-bootlint.flags', ['W002']);
    const editor = await atom.workspace.open(confErrPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(2);
    expect(messages[0].severity).toBe('error');
    expect(messages[0].excerpt).toBe(W003head);
    expect(messages[0].location.file).toBe(confErrPath);
    expect(messages[0].location.position).toEqual([[0, 0], [0, 15]]);
    expect(messages[1].severity).toBe('error');
    expect(messages[1].excerpt).toBe(jqueryText);
    expect(messages[1].location.file).toBe(confErrPath);
    expect(messages[1].location.position).toEqual([[0, 0], [0, 15]]);
  });
});

describe('FuAtom', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('fu-atom');
  });

  describe('when the fu-atom:toggle event is triggered', () => {
    it('hides and shows the modal panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.fu-atom')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'fu-atom:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.fu-atom')).toExist();

        let fuAtomElement = workspaceElement.querySelector('.fu-atom');
        expect(fuAtomElement).toExist();

        let fuAtomPanel = atom.workspace.panelForItem(fuAtomElement);
        expect(fuAtomPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'fu-atom:toggle');
        expect(fuAtomPanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.fu-atom')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'fu-atom:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let fuAtomElement = workspaceElement.querySelector('.fu-atom');
        expect(fuAtomElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'fu-atom:toggle');
        expect(fuAtomElement).not.toBeVisible();
      });
    });
  });
});
