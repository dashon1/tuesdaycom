import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  X, 
  MessageCircle, 
  Clock, 
  ListChecks,
  FileText,
  MoreHorizontal,
  Trash2,
  Copy
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

import SubtaskList from "./SubtaskList";
import CommentSection from "./CommentSection";
import TimeTracker from "./TimeTracker";

export default function ItemDetailModal({ isOpen, onClose, item, board, onUpdate, onDelete }) {
  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.data?.description || '');
  const [subtasks, setSubtasks] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item?.id) {
      setTitle(item.title);
      setDescription(item.data?.description || '');
      loadSubtasks();
    }
  }, [item?.id]);

  const loadSubtasks = async () => {
    const data = await base44.entities.Subtask.filter({ item_id: item.id }, 'order_index');
    setSubtasks(data);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await base44.entities.Item.update(item.id, {
      title,
      data: {
        ...item.data,
        description
      }
    });
    onUpdate?.({ ...item, title, data: { ...item.data, description } });
    setIsSaving(false);
  };

  const handleDelete = async () => {
    await base44.entities.Item.delete(item.id);
    onDelete?.(item.id);
    onClose();
  };

  const getStatusColumn = () => {
    return board?.columns?.find(col => col.type === 'status');
  };

  const getPriorityColumn = () => {
    return board?.columns?.find(col => col.type === 'priority');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'done':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'working on it':
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'stuck':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const subtaskProgress = subtasks.length > 0 
    ? Math.round((subtasks.filter(s => s.completed).length / subtasks.length) * 100)
    : 0;

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-8 rounded"
              style={{ backgroundColor: board?.color || '#0073EA' }}
            />
            <div>
              <p className="text-xs text-gray-500">{board?.title}</p>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                className="text-lg font-semibold border-0 p-0 h-auto shadow-none focus-visible:ring-0 bg-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.id)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-4 px-6 py-3 border-b bg-white">
          {getStatusColumn() && item.data?.[getStatusColumn().id] && (
            <Badge className={getStatusColor(item.data[getStatusColumn().id])}>
              {item.data[getStatusColumn().id]}
            </Badge>
          )}
          {getPriorityColumn() && item.data?.[getPriorityColumn().id] && (
            <Badge variant="outline">
              {item.data[getPriorityColumn().id]} Priority
            </Badge>
          )}
          <span className="text-sm text-gray-500">
            Updated {formatDistanceToNow(new Date(item.updated_date), { addSuffix: true })}
          </span>
          {subtasks.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ListChecks className="w-4 h-4" />
              {subtaskProgress}% complete
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="px-6 pt-4">
              <TabsList className="bg-gray-100">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="subtasks" className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4" />
                  Subtasks
                  {subtasks.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {subtasks.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Comments
                </TabsTrigger>
                <TabsTrigger value="time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Tracking
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="details" className="mt-0 space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleSave}
                    placeholder="Add a description..."
                    className="min-h-[150px] resize-none"
                  />
                </div>

                {/* Column Values */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Properties
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {board?.columns?.map(column => (
                      <div key={column.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">{column.title}</span>
                        <span className="text-sm font-medium">
                          {item.data?.[column.id] || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created by</span>
                      <span>{item.created_by}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created</span>
                      <span>{formatDistanceToNow(new Date(item.created_date), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="subtasks" className="mt-0">
                <SubtaskList
                  itemId={item.id}
                  subtasks={subtasks}
                  onUpdate={setSubtasks}
                />
              </TabsContent>

              <TabsContent value="comments" className="mt-0">
                <CommentSection itemId={item.id} />
              </TabsContent>

              <TabsContent value="time" className="mt-0">
                <TimeTracker itemId={item.id} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}