import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Plus,
  ArrowRight,
  Calendar,
  Users,
  Mail,
  Bell,
  Move,
  Edit3,
  Trash2,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const triggerTypes = [
  { value: 'status_changed', label: 'When status changes', icon: Edit3 },
  { value: 'date_arrives', label: 'When date arrives', icon: Calendar },
  { value: 'item_created', label: 'When item is created', icon: Plus },
  { value: 'item_assigned', label: 'When item is assigned', icon: Users },
  { value: 'column_changed', label: 'When column changes', icon: Edit3 }
];

const actionTypes = [
  { value: 'update_column', label: 'Update a column', icon: Edit3 },
  { value: 'send_email', label: 'Send email', icon: Mail },
  { value: 'create_notification', label: 'Create notification', icon: Bell },
  { value: 'move_item', label: 'Move item to group', icon: Move },
  { value: 'assign_to', label: 'Assign to person', icon: Users }
];

export default function AutomationBuilder({ board, onClose, existingAutomation = null }) {
  const [name, setName] = useState(existingAutomation?.name || '');
  const [description, setDescription] = useState(existingAutomation?.description || '');
  const [trigger, setTrigger] = useState(existingAutomation?.trigger || { type: '', column_id: '', value: '' });
  const [actions, setActions] = useState(existingAutomation?.actions || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddAction = () => {
    setActions([...actions, { type: '', config: {} }]);
  };

  const handleRemoveAction = (index) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleUpdateAction = (index, field, value) => {
    const newActions = [...actions];
    if (field === 'type') {
      newActions[index].type = value;
    } else {
      newActions[index].config = { ...newActions[index].config, [field]: value };
    }
    setActions(newActions);
  };

  const handleSave = async () => {
    if (!name || !trigger.type || actions.length === 0) return;

    setIsSaving(true);
    const automationData = {
      board_id: board.id,
      name,
      description,
      trigger,
      actions,
      is_active: true
    };

    if (existingAutomation) {
      await base44.entities.Automation.update(existingAutomation.id, automationData);
    } else {
      await base44.entities.Automation.create(automationData);
    }

    setIsSaving(false);
    onClose();
  };

  const getTriggerIcon = (type) => {
    const trigger = triggerTypes.find(t => t.value === type);
    return trigger ? <trigger.icon className="w-4 h-4" /> : <Zap className="w-4 h-4" />;
  };

  const getActionIcon = (type) => {
    const action = actionTypes.find(a => a.value === type);
    return action ? <action.icon className="w-4 h-4" /> : <Zap className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {existingAutomation ? 'Edit Automation' : 'Create Automation'}
        </h2>
        <p className="text-gray-500">
          Automate repetitive tasks and save time
        </p>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Automation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Auto-assign high priority tasks"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this automation does..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trigger */}
      <Card className="border-2 border-purple-200 bg-purple-50/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            When this happens...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Trigger Type *</Label>
            <Select value={trigger.type} onValueChange={(value) => setTrigger({ ...trigger, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select trigger" />
              </SelectTrigger>
              <SelectContent>
                {triggerTypes.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                      <t.icon className="w-4 h-4" />
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {['status_changed', 'column_changed'].includes(trigger.type) && (
            <>
              <div>
                <Label>Column</Label>
                <Select value={trigger.column_id} onValueChange={(value) => setTrigger({ ...trigger, column_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {board?.columns?.map(col => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>To Value</Label>
                <Input
                  value={trigger.value}
                  onChange={(e) => setTrigger({ ...trigger, value: e.target.value })}
                  placeholder="e.g., Done, High Priority, etc."
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Arrow */}
      <div className="flex items-center justify-center">
        <ArrowRight className="w-8 h-8 text-gray-400" />
      </div>

      {/* Actions */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-600" />
              Do this...
            </CardTitle>
            <Button size="sm" onClick={handleAddAction}>
              <Plus className="w-4 h-4 mr-2" />
              Add Action
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="p-4 bg-white rounded-lg border-2 border-blue-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    Action {index + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500"
                    onClick={() => handleRemoveAction(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <Select 
                    value={action.type} 
                    onValueChange={(value) => handleUpdateAction(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map(a => (
                        <SelectItem key={a.value} value={a.value}>
                          <div className="flex items-center gap-2">
                            <a.icon className="w-4 h-4" />
                            {a.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {action.type === 'update_column' && (
                    <>
                      <Select 
                        value={action.config.column_id} 
                        onValueChange={(value) => handleUpdateAction(index, 'column_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {board?.columns?.map(col => (
                            <SelectItem key={col.id} value={col.id}>
                              {col.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="New value"
                        value={action.config.value || ''}
                        onChange={(e) => handleUpdateAction(index, 'value', e.target.value)}
                      />
                    </>
                  )}

                  {action.type === 'send_email' && (
                    <>
                      <Input
                        placeholder="To (email)"
                        value={action.config.to || ''}
                        onChange={(e) => handleUpdateAction(index, 'to', e.target.value)}
                      />
                      <Input
                        placeholder="Subject"
                        value={action.config.subject || ''}
                        onChange={(e) => handleUpdateAction(index, 'subject', e.target.value)}
                      />
                      <Textarea
                        placeholder="Message"
                        value={action.config.message || ''}
                        onChange={(e) => handleUpdateAction(index, 'message', e.target.value)}
                        rows={3}
                      />
                    </>
                  )}

                  {action.type === 'create_notification' && (
                    <>
                      <Input
                        placeholder="Notification message"
                        value={action.config.message || ''}
                        onChange={(e) => handleUpdateAction(index, 'message', e.target.value)}
                      />
                    </>
                  )}

                  {action.type === 'move_item' && (
                    <Select 
                      value={action.config.group_id} 
                      onValueChange={(value) => handleUpdateAction(index, 'group_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent>
                        {board?.groups?.map(group => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {action.type === 'assign_to' && (
                    <Input
                      placeholder="User email"
                      value={action.config.assignee || ''}
                      onChange={(e) => handleUpdateAction(index, 'assignee', e.target.value)}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {actions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Play className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Add at least one action to complete the automation</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!name || !trigger.type || actions.length === 0 || isSaving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : existingAutomation ? 'Update' : 'Create'} Automation
        </Button>
      </div>
    </div>
  );
}