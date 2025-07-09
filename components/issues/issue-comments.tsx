"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { MessageSquare, Reply, Edit2, Trash2, Smile } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { 
  useCreateComment, 
  useUpdateComment, 
  useDeleteComment, 
  useListComments, 
  useCreateReaction, 
  useDeleteReaction 
} from '@/lib/hooks';
import { Comment, Reaction } from '@/lib/api/action-client';

interface User {
  id: string;
  name: string | null;
  email: string;
  avatarColor?: string | null;
  avatarType?: string | null;
}

interface IssueCommentsProps {
  comments: Comment[] | undefined;
  issueId: string;
  workspaceUrl: string;
  currentUserId: string;
  onCommentsChange?: (comments: Comment[]) => void;
}

// Quick reaction component for the hover menu
function QuickReactions({ 
  onReactionAdd,
  className 
}: {
  onReactionAdd: (emoji: string) => void;
  className?: string;
}) {
  const quickEmojis = ['👍', '❤️', '😂', '😮', '🎉', '🔥'];
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {quickEmojis.map((emoji) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          onClick={() => onReactionAdd(emoji)}
          className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full transition-all hover:scale-110"
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
}

// Emoji reaction bar component
function EmojiReactionBar({ 
  reactions, 
  onReactionAdd,
  onReactionRemove,
  className 
}: {
  reactions: Reaction[];
  onReactionAdd: (emoji: string) => void;
  onReactionRemove: (emoji: string) => void;
  className?: string;
}) {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const handleReactionClick = (reaction: Reaction) => {
    if (reaction.hasReacted) {
      onReactionRemove(reaction.emoji);
    } else {
      onReactionAdd(reaction.emoji);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onReactionAdd(emoji);
    setIsEmojiPickerOpen(false);
  };

  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {reactions.map((reaction, index) => (
        <Button
          key={`${reaction.emoji}-${index}`}
          variant="ghost"
          size="sm"
          onClick={() => handleReactionClick(reaction)}
          className={cn(
            "h-6 px-2 py-1 text-xs rounded-full border transition-all hover:scale-105",
            reaction.hasReacted 
              ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" 
              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
          )}
          title={`${(reaction.users || []).map(u => u.name || u.email).join(', ')}`}
        >
          <span className="mr-1">{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </Button>
      ))}
      
      <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full hover:bg-gray-100"
          >
            <Smile className="h-3 w-3 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            className="border-0 shadow-none"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function IssueComments({ 
  comments, 
  issueId, 
  workspaceUrl, 
  currentUserId,
  onCommentsChange
}: IssueCommentsProps) {
  const [localComments, setLocalComments] = useState<Comment[]>(comments || []);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const replyFormRef = useRef<HTMLDivElement>(null);
  
  // Use the new action hooks
  const { createComment } = useCreateComment();
  const { updateComment } = useUpdateComment();
  const { deleteComment } = useDeleteComment();
  const { data: commentsData, refetch: refetchComments, isLoading } = useListComments(issueId);
  const { createReaction } = useCreateReaction();
  const { deleteReaction } = useDeleteReaction();
  
  // Update local comments when prop changes or when data is refetched
  useEffect(() => {
    if (commentsData && Array.isArray(commentsData)) {
      setLocalComments(commentsData);
      onCommentsChange?.(commentsData);
    } else if (comments && Array.isArray(comments)) {
      setLocalComments(comments);
    } else {
      // Ensure localComments is always an array
      setLocalComments([]);
    }
  }, [comments, commentsData, onCommentsChange]);

  // Scroll to reply form when it opens
  useEffect(() => {
    if (replyTo && replyFormRef.current) {
      // Small delay to ensure the form is rendered
      setTimeout(() => {
        replyFormRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }, 100);
    }
  }, [replyTo]);

  const refreshComments = async () => {
    try {
      await refetchComments();
    } catch (error) {
      console.error('Error refreshing comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createComment(issueId, { content: newComment });
      setNewComment('');
      await refreshComments();
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createComment(issueId, { 
        content: replyContent,
        parentId: commentId
      });
      setReplyTo(null);
      setReplyContent('');
      await refreshComments();
      toast.success('Reply added successfully');
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await updateComment(commentId, { content: editContent });
      setEditingComment(null);
      setEditContent('');
      await refreshComments();
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await deleteComment(commentId);
      await refreshComments();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleReactionAdd = async (commentId: string, emoji: string) => {
    try {
      await createReaction(commentId, emoji);
      await refreshComments();
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  // DRY helper function to update comment reactions (keeping for optimistic updates)
  const updateCommentReactions = (commentId: string, reactions: Reaction[]) => {
    setLocalComments(prevComments => 
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, reactions };
        }
        // Check replies too
        return {
          ...comment,
          replies: comment.replies?.map(reply => 
            reply.id === commentId 
              ? { ...reply, reactions }
              : reply
          ) || []
        };
      })
    );
  };

  const handleReactionRemove = async (commentId: string, emoji: string) => {
    try {
      // Find the reaction to delete
      const comment = localComments.find(c => c.id === commentId) || 
        localComments.flatMap(c => c.replies || []).find(r => r.id === commentId);
      
      const reaction = comment?.reactions?.find(r => r.emoji === emoji && r.hasReacted);
      if (reaction) {
        await deleteReaction(reaction.id);
        await refreshComments();
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast.error('Failed to remove reaction');
    }
  };

  const renderComment = (comment: Comment, level = 0) => {
    // Ensure reactions are always defined
    const safeComment = {
      ...comment,
      reactions: comment.reactions || [],
      replies: comment.replies?.map(reply => ({
        ...reply,
        reactions: reply.reactions || []
      })) || []
    };

    return (
      <div key={safeComment.id} className={cn("space-y-3", level > 0 && "relative")}>
        {/* Dotted connection line for replies */}
        {level > 0 && (
          <div className="absolute left-[-20px] top-[20px] w-6 h-0.5 border-t-2 border-dotted border-gray-300" />
        )}
        
        <div className="group relative hover:bg-gray-50/50 rounded-lg p-3 -m-3 transition-colors">
          {/* Hover Menu - Beautiful Linear-style floating menu positioned at top of comment */}
          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
              {/* Quick reactions */}
              <QuickReactions 
                onReactionAdd={(emoji) => handleReactionAdd(safeComment.id, emoji)}
              />
              
              <div className="w-px h-6 bg-gray-200 mx-1" />
              
              {/* Reply button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(replyTo === safeComment.id ? null : safeComment.id)}
                className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full"
                title="Reply"
              >
                <Reply className="h-3 w-3" />
              </Button>
              
              {/* More actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {safeComment.user.id === currentUserId && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleEditComment(safeComment)}
                        className="flex items-center gap-2"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit comment
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteComment(safeComment.id)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete comment
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarFallback 
                className="text-xs"
                style={{ backgroundColor: '#6B7280' }}
              >
                                      {(safeComment.user.name || safeComment.user.email).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {safeComment.user.name || safeComment.user.email}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistance(new Date(safeComment.createdAt), new Date(), { addSuffix: true })}
                </span>
                {safeComment.updatedAt !== safeComment.createdAt && (
                  <span className="text-xs text-gray-400">(edited)</span>
                )}
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                {editingComment === safeComment.id ? (
                  <div className="space-y-3">
                    <RichTextEditor
                      content={editContent}
                      onChange={setEditContent}
                      placeholder="Edit your comment..."
                      className="min-h-[80px]"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(safeComment.id)}
                        disabled={!editContent.trim() || isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: safeComment.content }}
                  />
                )}
              </div>
              
              {/* Reactions */}
              {safeComment.reactions.length > 0 && (
                <div className="mt-2">
                  <EmojiReactionBar
                    reactions={safeComment.reactions}
                    onReactionAdd={(emoji) => handleReactionAdd(safeComment.id, emoji)}
                    onReactionRemove={(emoji) => handleReactionRemove(safeComment.id, emoji)}
                  />
                </div>
              )}
              
              {/* Reply form */}
              {replyTo === safeComment.id && (
                <div 
                  ref={replyFormRef}
                  className="mt-3 p-3 bg-gray-50/50 border border-gray-200 rounded-lg space-y-3"
                >
                  <RichTextEditor
                    content={replyContent}
                    onChange={setReplyContent}
                    placeholder="Write a reply..."
                    className="min-h-[80px]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(safeComment.id)}
                      disabled={!replyContent.trim() || isSubmitting}
                    >
                      {isSubmitting ? 'Replying...' : 'Reply'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Nested replies */}
        {safeComment.replies.length > 0 && (
          <div className="space-y-3 ml-8">
            {safeComment.replies.map((reply) => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* New comment form */}
      <div className="p-3 bg-gray-50/50 border border-gray-200 rounded-lg space-y-3">
        <RichTextEditor
          content={newComment}
          onChange={setNewComment}
          placeholder="Leave a comment..."
          className="min-h-[100px]"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Comment'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNewComment('')}
            disabled={!newComment.trim()}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-6">
        {!localComments || !Array.isArray(localComments) || localComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          localComments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
} 