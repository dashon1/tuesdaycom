import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  Activity,
  Target,
  Calendar,
  CheckCircle2,
  PieChart,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";

const widgetTemplates = [
  {
    id: 'tasks-by-status',
    name: 'Tasks by Status',
    description: 'Visualize task distribution across statuses',
    icon: PieChart,
    type: 'chart',
    color: '#0073EA',
    chartType: 'pie',
    w: 2,
    h: 2
  },
  {
    id: 'completion-trend',
    name: 'Completion Trend',
    description: 'Track completion rate over time',
    icon: TrendingUp,
    type: 'chart',
    color: '#00C875',
    chartType: 'line',
    w: 3,
    h: 2
  },
  {
    id: 'upcoming-deadlines',
    name: 'Upcoming Deadlines',
    description: 'See tasks due in the next 7 days',
    icon: Calendar,
    type: 'upcoming',
    color: '#FFCB00',
    w: 2,
    h: 2
  },
  {
    id: 'team-workload',
    name: 'Team Workload',
    description: 'Current task distribution by team member',
    icon: Users,
    type: 'workload',
    color: '#A25DDC',
    w: 2,
    h: 2
  },
  {
    id: 'total-tasks',
    name: 'Total Tasks',
    description: 'Count of all tasks across boards',
    icon: Target,
    type: 'stat',
    color: '#FF6B6B',
    w: 1,
    h: 1
  },
  {
    id: 'completion-rate',
    name: 'Completion Rate',
    description: 'Percentage of completed tasks',
    icon: CheckCircle2,
    type: 'stat',
    color: '#00C875',
    w: 1,
    h: 1
  },
  {
    id: 'recent-activity',
    name: 'Recent Activity',
    description: 'Latest updates and changes',
    icon: Activity,
    type: 'activity',
    color: '#4ECDC4',
    w: 2,
    h: 3
  },
  {
    id: 'time-logged',
    name: 'Time Logged',
    description: 'Total hours tracked this week',
    icon: Clock,
    type: 'stat',
    color: '#FF9F1C',
    w: 1,
    h: 1
  },
  {
    id: 'priority-breakdown',
    name: 'Priority Breakdown',
    description: 'Tasks grouped by priority level',
    icon: BarChart3,
    type: 'chart',
    color: '#E2445C',
    chartType: 'bar',
    w: 2,
    h: 2
  }
];

export default function WidgetGallery({ isOpen, onClose, onAddWidget }) {
  const handleSelectWidget = (widget) => {
    onAddWidget({
      widget_type: widget.type,
      title: widget.name,
      config: {
        chart_type: widget.chartType,
        metric: widget.id
      },
      position: {
        x: 0,
        y: 0,
        w: widget.w,
        h: widget.h
      }
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Widget Gallery</DialogTitle>
          <DialogDescription>
            Add widgets to customize your dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {widgetTemplates.map((widget, index) => (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => handleSelectWidget(widget)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                        style={{ backgroundColor: `${widget.color}20` }}
                      >
                        <widget.icon 
                          className="w-6 h-6" 
                          style={{ color: widget.color }}
                        />
                      </div>
                      <Button 
                        size="sm"
                        className="h-7 px-2"
                        style={{ backgroundColor: widget.color }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    <CardTitle className="text-base mt-3">{widget.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-gray-500">{widget.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-400">
                        {widget.w}x{widget.h} grid
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}