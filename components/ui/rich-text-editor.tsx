"use client";

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import { NodeSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Typography from '@tiptap/extension-typography';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Link as LinkIcon,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Type,
  Palette,
  ImageIcon,
  FileText,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCallback, useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  autoFocus?: boolean;
  minimal?: boolean;
}

// Custom Image extension with resize handles
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {}
          return { width: attributes.width }
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) return {}
          return { height: attributes.height }
        },
      },
    }
  },
  
  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const container = document.createElement('div');
      container.className = 'relative inline-block group';
      
      const img = document.createElement('img');
      Object.assign(img, HTMLAttributes);
      img.className = 'max-w-full h-auto rounded-lg';
      
      // Add resize handles
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity';
      
      let isResizing = false;
      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;
      
      resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.offsetWidth;
        startHeight = img.offsetHeight;
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      });
      
      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const newWidth = startWidth + deltaX;
        const newHeight = startHeight + deltaY;
        
        if (newWidth > 100 && newHeight > 100) {
          img.style.width = `${newWidth}px`;
          img.style.height = `${newHeight}px`;
        }
      };
      
      const handleMouseUp = () => {
        if (!isResizing) return;
        isResizing = false;
        
                 // Update the node attributes
         const pos = getPos();
         if (pos !== undefined) {
           editor.chain()
             .focus()
             .updateAttributes('image', {
               width: img.style.width,
               height: img.style.height,
             })
             .run();
         }
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      container.appendChild(img);
      container.appendChild(resizeHandle);
      
      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          
          // Update image attributes
          Object.assign(img, updatedNode.attrs);
          if (updatedNode.attrs.width) img.style.width = updatedNode.attrs.width;
          if (updatedNode.attrs.height) img.style.height = updatedNode.attrs.height;
          
          return true;
        },
      };
    };
  },
});

export function RichTextEditor({
  content = '',
  onChange,
  onBlur,
  onFocus,
  placeholder = 'Start typing...',
  className,
  editable = true,
  autoFocus = false,
  minimal = false
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Typography, // Enables markdown shortcuts
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
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      TextStyle,
      Color,
      ResizableImage.configure({
        inline: false,
        HTMLAttributes: {
          class: 'rounded-lg shadow-sm',
        },
      }),
    ],
    content,
    editable,
    autofocus: autoFocus,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    onBlur: () => {
      onBlur?.();
    },
    onFocus: () => {
      onFocus?.();
    },
    // Enable drag and drop
    editorProps: {
      handleDrop: (view, event, slice, moved) => {
        const files = Array.from(event.dataTransfer?.files || []);
        if (files.length > 0) {
          event.preventDefault();
          handleFileUpload(files);
          return true;
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        const files = Array.from(event.clipboardData?.files || []);
        if (files.length > 0) {
          event.preventDefault();
          handleFileUpload(files);
          return true;
        }
        return false;
      },
    },
  });

  const handleFileUpload = useCallback(async (files: File[]) => {
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        // Handle image upload
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          editor?.chain().focus().setImage({ src }).run();
        };
        reader.readAsDataURL(file);
      } else if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Handle Excel files - for now, we'll add as a link
        // In a real app, you'd upload to storage and potentially render a preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          editor?.chain().focus().insertContent(`
            <div class="border rounded-lg p-4 my-4 bg-gray-50">
              <div class="flex items-center gap-2">
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                </svg>
                <span class="font-medium">${file.name}</span>
                <span class="text-sm text-gray-500">(${(file.size / 1024 / 1024).toFixed(1)} MB)</span>
              </div>
            </div>
          `).run();
        };
        reader.readAsDataURL(file);
      } else {
        // Handle other file types
        editor?.chain().focus().insertContent(`
          <div class="border rounded-lg p-4 my-4 bg-gray-50">
            <div class="flex items-center gap-2">
              <svg class="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z"/>
              </svg>
              <span class="font-medium">${file.name}</span>
              <span class="text-sm text-gray-500">(${(file.size / 1024 / 1024).toFixed(1)} MB)</span>
            </div>
          </div>
        `).run();
      }
    }
    
  }, [editor]);

  const setLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  }, [editor, linkUrl]);

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [editor, content]);

  const colors = [
    '#000000', '#374151', '#6B7280', '#EF4444', '#F59E0B', 
    '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316'
  ];

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.xlsx,.xls,.csv,.pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />
      
              <EditorContent
          editor={editor}
          className={cn(
            "prose prose-sm max-w-none focus:outline-none",
            minimal && "p-0",
            !minimal && "p-4",
            // Custom styling for seamless inline editing
            "[&_.ProseMirror]:outline-none",
            "[&_.ProseMirror]:border-none",
            "[&_.ProseMirror]:shadow-none",
            "[&_.ProseMirror]:bg-transparent",
            "[&_.ProseMirror]:min-h-[1.5rem]",
            "[&_.ProseMirror]:leading-relaxed",
            "[&_.ProseMirror]:focus:outline-none",
            "[&_.ProseMirror]:focus:ring-0",
            "[&_.ProseMirror]:focus:border-none",
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
            "[&_.ProseMirror_ul[data-type='taskList']_li>label]:flex-shrink-0",
            "[&_.ProseMirror_ul[data-type='taskList']_li>label]:mt-0.5",
            "[&_.ProseMirror_ul[data-type='taskList']_li>div]:flex-1",
            // Image styling
            "[&_.ProseMirror_img]:max-w-full",
            "[&_.ProseMirror_img]:h-auto",
            "[&_.ProseMirror_img]:rounded-lg",
            "[&_.ProseMirror_img]:shadow-sm",
            // File attachment styling
            "[&_.ProseMirror_.file-attachment]:border",
            "[&_.ProseMirror_.file-attachment]:rounded-lg",
            "[&_.ProseMirror_.file-attachment]:p-4",
            "[&_.ProseMirror_.file-attachment]:my-4",
            "[&_.ProseMirror_.file-attachment]:bg-gray-50"
          )}
        />

      {/* Bubble Menu - Only shows when text is selected */}
      {editable && (
        <BubbleMenu 
          editor={editor}
          shouldShow={({ editor, state }) => {
            const { selection } = state;
            
            // Hide bubble menu for images using multiple approaches
            if (editor.isActive('image')) {
              return false;
            }
            
            // Additional check: look for image nodes in the selection
            const { $from, $to } = selection;
            let hasImage = false;
            
            state.doc.nodesBetween($from.pos, $to.pos, (node) => {
              if (node.type.name === 'image') {
                hasImage = true;
                return false; // Stop traversal
              }
            });
            
            if (hasImage) {
              return false;
            }
            
            // Also check if the selection is a NodeSelection (typically for images)
            if (selection instanceof NodeSelection) {
              const node = selection.node;
              if (node && node.type.name === 'image') {
                return false;
              }
            }
            
            // Only show for text selections (not empty selections)
            return !selection.empty;
          }}
          tippyOptions={{ 
            duration: 100,
            interactive: true,
            arrow: false,
            placement: 'top'
          }}
          className="flex items-center gap-1 bg-white text-gray-900 p-2 rounded-lg shadow-lg border border-gray-200"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100",
              editor.isActive('bold') && "bg-gray-200"
            )}
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100",
              editor.isActive('italic') && "bg-gray-200"
            )}
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100",
              editor.isActive('strike') && "bg-gray-200"
            )}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100",
              editor.isActive('code') && "bg-gray-200"
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
              "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100",
              editor.isActive('bulletList') && "bg-gray-200"
            )}
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100",
              editor.isActive('orderedList') && "bg-gray-200"
            )}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={cn(
              "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100",
              editor.isActive('taskList') && "bg-gray-200"
            )}
          >
            <CheckSquare className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100",
              editor.isActive('blockquote') && "bg-gray-200"
            )}
          >
            <Quote className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Link Input/Button */}
          {showLinkInput ? (
            <div className="flex items-center gap-2 px-2">
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Enter URL..."
                className="h-8 w-40 text-sm bg-white border-gray-300 text-gray-900"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setLink();
                  } else if (e.key === 'Escape') {
                    setShowLinkInput(false);
                    setLinkUrl('');
                  }
                }}
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={setLink}
                className="h-8 w-8 p-0 text-gray-900 hover:bg-gray-100"
              >
                <CheckSquare className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLinkInput(true)}
              className={cn(
                "h-8 w-8 p-0 text-gray-900 hover:bg-gray-100",
                editor.isActive('link') && "bg-gray-200"
              )}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          )}

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Color Picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-900 hover:bg-gray-100">
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <div className="grid grid-cols-5 gap-1 p-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                  />
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().unsetColor().run()}
              >
                <Type className="h-4 w-4 mr-2" />
                Remove color
              </DropdownMenuItem>
            </DropdownMenuContent>
                      </DropdownMenu>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* File Upload */}
          <Button
            variant="ghost"
            size="sm"
            onClick={triggerFileUpload}
            className="h-8 w-8 p-0 text-gray-900 hover:bg-gray-100"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Divider */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="h-8 w-8 p-0 text-gray-900 hover:bg-gray-100"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}
    </div>
  );
} 