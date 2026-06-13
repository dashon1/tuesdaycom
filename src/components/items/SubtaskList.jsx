import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus, X, GripVertical, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SubtaskList({ itemId, subtasks = [], onUpdate }) {
  const [newSubtask, setNewSubtask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = subtasks.filter(s => s.completed).length;
  const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;
    
    const subtask = await base44.entities.Subtask.create({
      item_id: itemId,
      title: newSubtask,
      completed: false,
      order_index: subtasks.length
    });
    
    onUpdate([...subtasks, subtask]);
    setNewSubtask('');
    setIsAdding(false);
  };

  const handleToggleComplete = async (subtask) => {
    await base44.entities.Subtask.update(subtask.id, { completed: !subtask.completed });
    onUpdate(subtasks.map(s => s.id === subtask.id ? { ...s, completed: !s.completed } : s));
  };

  const handleDeleteSubtask = async (subtaskId) => {
    await base44.entities.Subtask.delete(subtaskId);
    onUpdate(subtasks.filter(s => s.id !== subtaskId));
  };

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      {subtasks.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtasks Progress</span>
            <span>{completedCount}/{subtasks.length} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Subtask List */}
      <div className="space-y-2">
        <AnimatePresence>
          {subtasks.map((subtask, index) => (
            <motion.div
              key={subtask.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group"
            >
              <GripVertical className="w-4 h-4 text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={() => handleToggleComplete(subtask)}
              />
              <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {subtask.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                onClick={() => handleDeleteSubtask(subtask.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Subtask */}
      {isAdding ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter subtask..."
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
            autoFocus
            className="flex-1 h-8 text-sm"
          />
          <Button size="sm" onClick={handleAddSubtask} className="h-8">
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="text-gray-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Subtask
        </Button>
      )}
    </div>
  );
}