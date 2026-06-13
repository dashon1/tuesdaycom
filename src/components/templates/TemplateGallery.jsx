import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  LayoutTemplate, 
  Briefcase, 
  Target, 
  Calendar, 
  Users, 
  Code,
  Megaphone,
  GraduationCap,
  Home,
  Search,
  Sparkles,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

const defaultTemplates = [
  {
    id: 'project-management',
    name: 'Project Management',
    description: 'Track projects, tasks, and deadlines with ease',
    icon: 'Briefcase',
    color: '#0073EA',
    columns: [
      { id: 'status', title: 'Status', type: 'status' },
      { id: 'priority', title: 'Priority', type: 'priority' },
      { id: 'owner', title: 'Owner', type: 'people' },
      { id: 'due_date', title: 'Due Date', type: 'date' },
      { id: 'budget', title: 'Budget', type: 'budget' }
    ],
    groups: [
      { id: 'planning', title: 'Planning', color: '#0073EA' },
      { id: 'in-progress', title: 'In Progress', color: '#FFCB00' },
      { id: 'completed', title: 'Completed', color: '#00C875' }
    ]
  },
  {
    id: 'sprint-planning',
    name: 'Sprint Planning',
    description: 'Agile sprint management for dev teams',
    icon: 'Code',
    color: '#6366F1',
    columns: [
      { id: 'status', title: 'Status', type: 'status' },
      { id: 'priority', title: 'Priority', type: 'priority' },
      { id: 'assignee', title: 'Assignee', type: 'people' },
      { id: 'story_points', title: 'Story Points', type: 'number' }
    ],
    groups: [
      { id: 'backlog', title: 'Backlog', color: '#787D80' },
      { id: 'sprint', title: 'Current Sprint', color: '#0073EA' },
      { id: 'done', title: 'Done', color: '#00C875' }
    ]
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Plan and execute marketing initiatives',
    icon: 'Megaphone',
    color: '#EC4899',
    columns: [
      { id: 'status', title: 'Status', type: 'status' },
      { id: 'channel', title: 'Channel', type: 'dropdown' },
      { id: 'owner', title: 'Owner', type: 'people' },
      { id: 'launch_date', title: 'Launch Date', type: 'date' },
      { id: 'budget', title: 'Budget', type: 'budget' }
    ],
    groups: [
      { id: 'ideation', title: 'Ideation', color: '#9333EA' },
      { id: 'production', title: 'Production', color: '#FFCB00' },
      { id: 'live', title: 'Live', color: '#00C875' }
    ]
  },
  {
    id: 'okr-tracking',
    name: 'OKR Tracking',
    description: 'Set and track objectives and key results',
    icon: 'Target',
    color: '#10B981',
    columns: [
      { id: 'progress', title: 'Progress', type: 'number' },
      { id: 'owner', title: 'Owner', type: 'people' },
      { id: 'quarter', title: 'Quarter', type: 'dropdown' },
      { id: 'status', title: 'Status', type: 'status' }
    ],
    groups: [
      { id: 'company', title: 'Company OKRs', color: '#0073EA' },
      { id: 'team', title: 'Team OKRs', color: '#00C875' },
      { id: 'personal', title: 'Personal OKRs', color: '#9333EA' }
    ]
  },
  {
    id: 'event-planning',
    name: 'Event Planning',
    description: 'Organize events from start to finish',
    icon: 'Calendar',
    color: '#F59E0B',
    columns: [
      { id: 'status', title: 'Status', type: 'status' },
      { id: 'responsible', title: 'Responsible', type: 'people' },
      { id: 'deadline', title: 'Deadline', type: 'date' },
      { id: 'budget', title: 'Budget', type: 'budget' }
    ],
    groups: [
      { id: 'venue', title: 'Venue & Logistics', color: '#0073EA' },
      { id: 'content', title: 'Content & Speakers', color: '#9333EA' },
      { id: 'marketing', title: 'Marketing', color: '#EC4899' }
    ]
  },
  {
    id: 'team-tasks',
    name: 'Team Tasks',
    description: 'Simple task management for teams',
    icon: 'Users',
    color: '#8B5CF6',
    columns: [
      { id: 'status', title: 'Status', type: 'status' },
      { id: 'priority', title: 'Priority', type: 'priority' },
      { id: 'assignee', title: 'Assignee', type: 'people' },
      { id: 'due_date', title: 'Due Date', type: 'date' }
    ],
    groups: [
      { id: 'todo', title: 'To Do', color: '#787D80' },
      { id: 'doing', title: 'Doing', color: '#FFCB00' },
      { id: 'done', title: 'Done', color: '#00C875' }
    ]
  }
];

const iconMap = {
  Briefcase,
  Target,
  Calendar,
  Users,
  Code,
  Megaphone,
  GraduationCap,
  Home
};

export default function TemplateGallery({ isOpen, onClose, onSelectTemplate }) {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
    }
  };

  const IconComponent = (iconName) => {
    return iconMap[iconName] || LayoutTemplate;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Choose a Template
          </DialogTitle>
          <DialogDescription>
            Start with a pre-built template or create from scratch
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Blank Template */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all border-2 h-full ${
                  selectedTemplate?.id === 'blank' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-dashed border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedTemplate({ id: 'blank', name: 'Blank Board' })}
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <LayoutTemplate className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="font-medium text-gray-900">Blank Board</h4>
                  <p className="text-xs text-gray-500 mt-1">Start from scratch</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Template Cards */}
            {filteredTemplates.map((template, index) => {
              const Icon = IconComponent(template.icon);
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all border-2 h-full ${
                      selectedTemplate?.id === template.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-transparent hover:border-gray-200'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent className="pt-6">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${template.color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: template.color }} />
                      </div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {template.groups?.slice(0, 3).map(group => (
                          <Badge 
                            key={group.id}
                            variant="secondary"
                            className="text-xs"
                            style={{ backgroundColor: `${group.color}20`, color: group.color }}
                          >
                            {group.title}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUseTemplate}
            disabled={!selectedTemplate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Use Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}