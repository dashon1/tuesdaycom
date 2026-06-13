import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Paperclip, MoreHorizontal, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CommentSection({ itemId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadComments();
    loadUser();
  }, [itemId]);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadComments = async () => {
    setIsLoading(true);
    const data = await base44.entities.Comment.filter({ item_id: itemId }, '-created_date');
    setComments(data);
    setIsLoading(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment = await base44.entities.Comment.create({
      item_id: itemId,
      content: newComment,
      author_name: currentUser?.full_name || 'Anonymous'
    });

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleDeleteComment = async (commentId) => {
    await base44.entities.Comment.delete(commentId);
    setComments(comments.filter(c => c.id !== commentId));
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
            {getInitials(currentUser?.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Paperclip className="w-4 h-4 mr-1" />
              Attach
            </Button>
            <Button 
              size="sm" 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-1" />
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4 pt-4 border-t">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3 group"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-500 text-white text-xs">
                  {getInitials(comment.author_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900">
                    {comment.author_name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && !isLoading && (
          <p className="text-center text-gray-400 text-sm py-4">
            No comments yet. Start the conversation!
          </p>
        )}
      </div>
    </div>
  );
}