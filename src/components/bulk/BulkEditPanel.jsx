import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  CheckSquare, 
  X, 
  Edit3, 
  Trash2, 
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BulkEditPanel({ 
  selectedItems = [], 
  board,
  onClearSelection, 
  onBulkUpdate,
  onBulkDelete,
  onBulkDuplicate,
  onBulkMove
}) {
  const [showActions, setShowActions] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);
  const [bulkValue, setBulkValue] = useState('');

  const selectedCount = selectedItems.length;

  if (selectedCount === 0) return null;

  const handleApplyBulk = async () => {
    if (!bulkAction || !bulkValue) return;

    const updates = {};
    updates[bulkAction] = bulkValue;
    
    await onBulkUpdate(selectedItems, updates);
    setBulkAction(null);
    setBulkValue('');
    setShowActions(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl border border-blue-400 overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Selection Info */}
              <div className="flex items-center gap-3 text-white">
                <CheckSquare className="w-5 h-5" />
                <div>
                  <p className="font-bold text-lg">{selectedCount} Selected</p>
                  <p className="text-xs text-blue-100">Bulk actions available</p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-12 w-px bg-white/30" />

              {/* Quick Actions */}
              {!showActions ? (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20"
                    onClick={() => setShowActions(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20"
                    onClick={() => onBulkDuplicate(selectedItems)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20"
                    onClick={() => onBulkDelete(selectedItems)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-40 bg-white">
                      <SelectValue placeholder="Select field..." />
                    </SelectTrigger>
                    <SelectContent>
                      {board?.columns?.map(col => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {bulkAction && (
                    <Input
                      placeholder="New value..."
                      value={bulkValue}
                      onChange={(e) => setBulkValue(e.target.value)}
                      className="w-48 bg-white"
                    />
                  )}

                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={handleApplyBulk}
                    disabled={!bulkAction || !bulkValue}
                  >
                    Apply
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => setShowActions(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {/* Clear Selection */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onClearSelection}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Progress Indicator */}
          <motion.div 
            className="h-1 bg-gradient-to-r from-green-400 to-blue-400"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}