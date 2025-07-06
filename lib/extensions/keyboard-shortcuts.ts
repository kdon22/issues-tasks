import { Extension } from '@tiptap/core';

export interface KeyboardShortcutsOptions {
  // Allow customization of which shortcuts to enable
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strike?: boolean;
  bulletList?: boolean;
  orderedList?: boolean;
  taskList?: boolean;
  blockquote?: boolean;
  headings?: boolean;
}

export const KeyboardShortcuts = Extension.create<KeyboardShortcutsOptions>({
  name: 'keyboardShortcuts',
  
  addOptions() {
    return {
      bold: true,
      italic: true,
      code: true,
      strike: true,
      bulletList: true,
      orderedList: true,
      taskList: true,
      blockquote: true,
      headings: true,
    };
  },
  
  addKeyboardShortcuts() {
    const shortcuts: Record<string, () => boolean> = {};
    
    if (this.options.bold) {
      shortcuts['Mod-b'] = () => this.editor.chain().focus().toggleBold().run();
    }
    
    if (this.options.italic) {
      shortcuts['Mod-i'] = () => this.editor.chain().focus().toggleItalic().run();
    }
    
    if (this.options.code) {
      shortcuts['Mod-`'] = () => this.editor.chain().focus().toggleCode().run();
    }
    
    if (this.options.strike) {
      shortcuts['Mod-Shift-s'] = () => this.editor.chain().focus().toggleStrike().run();
    }
    
    if (this.options.bulletList) {
      shortcuts['Mod-Shift-8'] = () => this.editor.chain().focus().toggleBulletList().run();
    }
    
    if (this.options.orderedList) {
      shortcuts['Mod-Shift-7'] = () => this.editor.chain().focus().toggleOrderedList().run();
    }
    
    if (this.options.taskList) {
      shortcuts['Mod-Shift-9'] = () => this.editor.chain().focus().toggleTaskList().run();
    }
    
    if (this.options.blockquote) {
      shortcuts['Mod-Shift-.'] = () => this.editor.chain().focus().toggleBlockquote().run();
    }
    
    if (this.options.headings) {
      shortcuts['Mod-1'] = () => this.editor.chain().focus().toggleHeading({ level: 1 }).run();
      shortcuts['Mod-2'] = () => this.editor.chain().focus().toggleHeading({ level: 2 }).run();
      shortcuts['Mod-3'] = () => this.editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
    
    return shortcuts;
  },
}); 