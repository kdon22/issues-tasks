"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  List,
  ListOrdered,
  CheckSquare,
  Image as ImageIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRichTextAutoSave } from '@/lib/hooks';
import { KeyboardShortcuts } from '@/lib/extensions/keyboard-shortcuts';
import { ResizableImage, FileNode, createFileUploadHandler } from '@/lib/extensions/media-extensions';

interface IssueDescriptionProps {
  description?: string | null;
  onDescriptionChange?: (newDescription: string) => Promise<void>;
  className?: string;
}



export function IssueDescription({ 
  description, 
  onDescriptionChange, 
  className 
}: IssueDescriptionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dropPosition, setDropPosition] = useState({ x: 0, y: 0 });
  const dragCounterRef = useRef(0);
  
  // Use the DRY auto-save hook
  const { isLoading, error, scheduleSave } = useRichTextAutoSave({
    initialValue: description || '',
    onSave: onDescriptionChange || (() => Promise.resolve()),
    delay: 1000,
    enabled: !!onDescriptionChange
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      Placeholder.configure({
        placeholder: 'Click to add a description...',
        emptyEditorClass: 'is-editor-empty',
      }),
      ResizableImage,
      FileNode,
      KeyboardShortcuts,
    ],
    content: description || '',
    editable: true,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const currentValue = editor.getHTML();
      scheduleSave(currentValue);
    },
  });



  // File upload handler using DRY utility
  const handleFileUpload = useCallback(createFileUploadHandler(editor), [editor]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
      setDropPosition({ x: 0, y: 0 });
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Update drop position indicator
    if (editor) {
      const view = editor.view;
      const editorRect = view.dom.getBoundingClientRect();
      const coords = {
        left: e.clientX - editorRect.left,
        top: e.clientY - editorRect.top
      };
      
      const pos = view.posAtCoords(coords);
      if (pos) {
        setDropPosition({
          x: e.clientX - editorRect.left,
          y: e.clientY - editorRect.top
        });
      }
    }
  }, [editor]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDropPosition({ x: 0, y: 0 });
    dragCounterRef.current = 0;

    if (!editor) return;

    // Calculate exact drop position
    const view = editor.view;
    const editorRect = view.dom.getBoundingClientRect();
    const coords = {
      left: e.clientX - editorRect.left,
      top: e.clientY - editorRect.top
    };

    // Get the position in the document where the drop occurred
    const pos = view.posAtCoords(coords);
    if (pos) {
      // Set cursor to drop position
      editor.chain().focus().setTextSelection(pos.pos).run();
    }

    const files = Array.from(e.dataTransfer.files);
    files.forEach(handleFileUpload);
  }, [handleFileUpload, editor]);

  // Update editor content when description prop changes
  useEffect(() => {
    if (editor && description !== editor.getHTML()) {
      editor.commands.setContent(description || '');
    }
  }, [editor, description]);

  const hasContent = description && description.trim() !== '' && description !== '<p></p>';

  return (
    <div className={cn('w-full', className)}>
      {/* Header with status indicator */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Description</h3>
        {(isLoading || error) && (
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
            {error && <span title={error}><AlertCircle className="h-4 w-4 text-red-500" /></span>}
          </div>
        )}
      </div>
      
      {/* Editor with drag and drop */}
      <div 
        className="relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drop indicator - shows exact drop position */}
        {isDragging && (
          <div 
            className="absolute pointer-events-none z-20"
            style={{
              left: `${dropPosition.x}px`,
              top: `${dropPosition.y}px`,
              transform: 'translateX(-1px)'
            }}
          >
            <div className="w-0.5 h-6 bg-blue-500 animate-pulse" />
          </div>
        )}

        <div
          data-tiptap-editor
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          className={cn(
            "prose prose-sm max-w-none min-h-[120px] outline-none transition-colors",
            !hasContent && "flex items-center justify-center text-gray-500",
            "hover:bg-gray-50/30 rounded-md cursor-text px-3 py-3",
            "focus-within:bg-gray-50/50",
            "focus:outline-none focus-visible:outline-none",
            "focus-within:outline-none",
            "focus:ring-0 focus-visible:ring-0 focus-within:ring-0",
            "focus:border-none focus-visible:border-none focus-within:border-none",
            "focus:shadow-none focus-visible:shadow-none focus-within:shadow-none"
          )}
          onClick={() => editor?.commands.focus()}
        >
          {!hasContent && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none">
              <p className="text-sm">Click to add a description...</p>
            </div>
          )}

          <EditorContent
            editor={editor}
            data-tiptap-editor
            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            className={cn(
              "outline-none focus:outline-none focus-visible:outline-none",
              "border-none focus:border-none focus-visible:border-none",
              "ring-0 focus:ring-0 focus-visible:ring-0",
              "shadow-none focus:shadow-none focus-visible:shadow-none",
              "[&_.ProseMirror]:outline-none",
              "[&_.ProseMirror]:border-none",
              "[&_.ProseMirror]:shadow-none",
              "[&_.ProseMirror]:bg-transparent",
              "[&_.ProseMirror]:min-h-[120px]",
              "[&_.ProseMirror]:leading-relaxed",
              "[&_.ProseMirror]:p-0",
              "[&_.ProseMirror]:focus:outline-none",
              "[&_.ProseMirror]:focus-visible:outline-none",
              "[&_.ProseMirror]:focus:ring-0",
              "[&_.ProseMirror]:focus-visible:ring-0",
              "[&_.ProseMirror]:focus:border-none",
              "[&_.ProseMirror]:focus-visible:border-none",
              "[&_.ProseMirror]:focus:shadow-none",
              "[&_.ProseMirror]:focus-visible:shadow-none",
              // All child elements
              "[&_*]:outline-none",
              "[&_*]:focus:outline-none", 
              "[&_*]:focus-visible:outline-none",
              "[&_*]:ring-0",
              "[&_*]:focus:ring-0",
              "[&_*]:focus-visible:ring-0",
              // Placeholder styling
              "[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
              "[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400",
              "[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none",
              "[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left",
              "[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0",
              // Task list styling
              "[&_.ProseMirror_ul[data-type='taskList']]:list-none",
              "[&_.ProseMirror_ul[data-type='taskList']_li]:flex",
              "[&_.ProseMirror_ul[data-type='taskList']_li]:items-start",
              "[&_.ProseMirror_ul[data-type='taskList']_li]:gap-2",
            )}
          />

          {/* Bubble Menu */}
          {editor && (
            <BubbleMenu 
              editor={editor}
              className="flex items-center gap-1 bg-white text-gray-900 p-2 rounded-lg shadow-xl border border-gray-200 z-50 opacity-100"
              shouldShow={({ editor, state }) => {
                // Only show when there's text selected, not when media is selected
                const { from, to } = state.selection;
                
                // Don't show if no text is selected
                if (from === to || !editor.isFocused) {
                  return false;
                }
                
                // Don't show if a media node is selected
                const selectedNode = state.doc.nodeAt(from);
                if (selectedNode && (selectedNode.type.name === 'resizableImage' || selectedNode.type.name === 'file')) {
                  return false;
                }
                
                return true;
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100 transition-colors",
                  editor.isActive('bold') && "bg-gray-900 text-white"
                )}
              >
                <Bold className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100 transition-colors",
                  editor.isActive('italic') && "bg-gray-900 text-white"
                )}
              >
                <Italic className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(
                  "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100 transition-colors",
                  editor.isActive('strike') && "bg-gray-900 text-white"
                )}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn(
                  "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100 transition-colors",
                  editor.isActive('code') && "bg-gray-900 text-white"
                )}
              >
                <Code className="h-4 w-4" />
              </Button>

              <div className="w-px h-6 bg-gray-300 mx-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                  "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100 transition-colors",
                  editor.isActive('bulletList') && "bg-gray-900 text-white"
                )}
              >
                <List className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                  "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100 transition-colors",
                  editor.isActive('orderedList') && "bg-gray-900 text-white"
                )}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={cn(
                  "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100 transition-colors",
                  editor.isActive('taskList') && "bg-gray-900 text-white"
                )}
              >
                <CheckSquare className="h-4 w-4" />
              </Button>
            </BubbleMenu>
          )}
        </div>
      </div>
    </div>
  );
}
