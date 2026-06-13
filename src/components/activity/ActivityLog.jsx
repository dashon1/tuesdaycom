import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  MessageCircle, 
  ArrowRight,
  Clock,
  CheckCircle2,
  UserPlus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function ActivityLog({ boardId, itemId, limit = 20 }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [boardId, itemId]);

  const loadActivities = async () => {
    setIsLoading(true);
    const filters = {};
    if (boardId) filters.board_id = boardId;
    if (itemId) filters.item_id = itemId;
    
    const data = await base44.entities.Activity.filter(filters, '-created_date', limit);
    setActivities(data);
    setIsLoading(false);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'created':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'updated':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'commented':
        return <MessageCircle className="w-4 h-4 text-purple-500" />;
      case 'status_changed':
        return <ArrowRight className="w-4 h-4 text-orange-500" />;
      case 'assigned':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'time_logged':
        return <Clock className="w-4 h-4 text-indigo-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'created':
        return 'bg-green-50 border-green-200';
      case 'updated':
        return 'bg-blue-50 border-blue-200';
      case 'deleted':
        return 'bg-red-50 border-red-200';
      case 'commented':
        return 'bg-purple-50 border-purple-200';
      case 'status_changed':
        return 'bg-orange-50 border-orange-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-blue-500" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gray-200" />
            
            <AnimatePresence>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex gap-4 pl-2"
                  >
                    {/* Timeline dot */}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${getActivityColor(activity.action_type)}`}>
                      {getActivityIcon(activity.action_type)}
                    </div>
                    
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-gray-200">
                            {getInitials(activity.user_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm text-gray-900">
                          {activity.user_name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                      {activity.metadata && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activity.metadata.old_value && activity.metadata.new_value && (
                            <>
                              <Badge variant="outline" className="text-xs">
                                {activity.metadata.old_value}
                              </Badge>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <Badge className="text-xs bg-blue-100 text-blue-800">
                                {activity.metadata.new_value}
                              </Badge>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {activities.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No activity yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}