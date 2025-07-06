import { useState, useRef } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { FileText, File, Image as ImageIcon, Copy, Trash2, Download, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Resizable Image Component
const ResizableImageComponent = ({ node, updateAttributes, selected, deleteNode }: any) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: node.attrs.width || 400,
    height: node.attrs.height || 300
  });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = parseInt(dimensions.width as string) || 400;
    const aspectRatio = parseInt(dimensions.height as string) / startWidth;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(150, Math.min(800, startWidth + deltaX));
      const newHeight = newWidth * aspectRatio;
      
      setDimensions({
        width: newWidth,
        height: newHeight
      });
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      updateAttributes({
        width: dimensions.width,
        height: dimensions.height
      });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleCopy = () => {
    if (imageRef.current) {
      // Copy image URL to clipboard
      navigator.clipboard.writeText(node.attrs.src);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = node.attrs.src;
    link.download = node.attrs.alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = () => {
    deleteNode();
  };

  return (
    <NodeViewWrapper>
      <div 
        className={cn(
          "relative inline-block group transition-all duration-200",
          selected && "ring-2 ring-blue-500/60 ring-offset-2 rounded-lg",
          isResizing && "select-none"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            maxWidth: '100%',
            objectFit: 'contain'
          }}
          className={cn(
            "rounded-lg shadow-sm transition-all duration-200",
            selected && "ring-1 ring-gray-300",
            isResizing && "cursor-col-resize"
          )}
          draggable={false}
        />
        
        {/* Linear-style resize handle - right side vertical bar */}
        {selected && (
          <div
            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize group/handle flex items-center justify-center"
            onMouseDown={handleMouseDown}
          >
            <div className="w-1 h-8 bg-blue-500 rounded-full opacity-60 hover:opacity-100 transition-opacity group-hover/handle:opacity-100" />
          </div>
        )}

        {/* Hover menu */}
        {(isHovered || selected) && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 hover:bg-white"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy image URL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download image
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Selection indicator */}
        {selected && (
          <div className="absolute -inset-0.5 border-2 border-blue-500 rounded-lg pointer-events-none opacity-60" />
        )}
      </div>
    </NodeViewWrapper>
  );
};

// File Component
const FileComponent = ({ node, selected, deleteNode }: any) => {
  const { src, name, type, size } = node.attrs;
  const [isHovered, setIsHovered] = useState(false);
  
  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="h-8 w-8" />;
    if (type.includes('excel') || type.includes('spreadsheet')) return <FileText className="h-8 w-8 text-green-600" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="h-8 w-8 text-blue-600" />;
    return <File className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = () => {
    deleteNode();
  };

  return (
    <NodeViewWrapper>
      <div 
        className={cn(
          "relative inline-flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer max-w-sm group",
          selected && "ring-2 ring-blue-500/60 ring-offset-2 bg-blue-50 border-blue-300"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex-shrink-0">
          {getFileIcon(type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500">{formatFileSize(size)}</p>
        </div>

        {/* Hover menu */}
        {(isHovered || selected) && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 hover:bg-white"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download file
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove file
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Selection indicator */}
        {selected && (
          <div className="absolute -inset-0.5 border-2 border-blue-500 rounded-lg pointer-events-none opacity-60" />
        )}
      </div>
    </NodeViewWrapper>
  );
};

// Resizable Image Extension
export const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'block',
  atom: true,
  draggable: true,
  
  addAttributes() {
    return {
      src: { 
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => ({ src: attributes.src }),
      },
      alt: { 
        default: null,
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => ({ alt: attributes.alt }),
      },
      width: { 
        default: 400,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => ({ width: attributes.width }),
      },
      height: { 
        default: 300,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => ({ height: attributes.height }),
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: element => ({
          src: element.getAttribute('src'),
          alt: element.getAttribute('alt'),
          width: element.getAttribute('width') || 400,
          height: element.getAttribute('height') || 300,
        }),
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

// File Extension
export const FileNode = Node.create({
  name: 'file',
  group: 'block',
  atom: true,
  draggable: true,
  
  addAttributes() {
    return {
      src: { 
        default: null,
        parseHTML: element => element.getAttribute('data-src'),
        renderHTML: attributes => ({ 'data-src': attributes.src }),
      },
      name: { 
        default: null,
        parseHTML: element => element.getAttribute('data-name'),
        renderHTML: attributes => ({ 'data-name': attributes.name }),
      },
      type: { 
        default: null,
        parseHTML: element => element.getAttribute('data-file-type'),
        renderHTML: attributes => ({ 'data-file-type': attributes.type }),
      },
      size: { 
        default: 0,
        parseHTML: element => parseInt(element.getAttribute('data-size') || '0'),
        renderHTML: attributes => ({ 'data-size': attributes.size }),
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-type="file"]',
        getAttrs: element => ({
          src: element.getAttribute('data-src'),
          name: element.getAttribute('data-name'),
          type: element.getAttribute('data-file-type'),
          size: parseInt(element.getAttribute('data-size') || '0'),
        }),
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'file' })];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(FileComponent);
  },
});

// Utility function for handling file uploads
export const createFileUploadHandler = (editor: any) => {
  return async (file: File) => {
    if (!editor) return;

    // Create a temporary URL for the file
    const url = URL.createObjectURL(file);
    
    try {
      if (file.type.startsWith('image/')) {
        // Create an image to get natural dimensions
        const img = new Image();
        img.onload = () => {
          const maxWidth = 600;
          const aspectRatio = img.height / img.width;
          const width = Math.min(img.width, maxWidth);
          const height = width * aspectRatio;

          // Insert as resizable image with proper dimensions
          editor.chain().insertContent({
            type: 'resizableImage',
            attrs: {
              src: url,
              alt: file.name,
              width: Math.round(width),
              height: Math.round(height),
            },
          }).run();
        };
        img.src = url;
      } else {
        // Insert as file
        editor.chain().insertContent({
          type: 'file',
          attrs: {
            src: url,
            name: file.name,
            type: file.type,
            size: file.size,
          },
        }).run();
      }
    } catch (error) {
      console.error('Error inserting file:', error);
    }
  };
}; 