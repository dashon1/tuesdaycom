import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

export default function WorkloadView({ items = [], boards = [] }) {
  const [teamWorkload, setTeamWorkload] = useState([]);

  useEffect(() => {
    calculateWorkload();
  }, [items, boards]);

  const calculateWorkload = () => {
    const workloadMap = {};

    items.forEach(item => {
      const board = boards.find(b => b.id === item.board_id);
      const peopleColumn = board?.columns?.find(col => col.type === 'people');
      const statusColumn = board?.columns?.find(col => col.type === 'status');
      const priorityColumn = board?.columns?.find(col => col.type === 'priority');
      
      const assignee = item.data?.[peopleColumn?.id];
      const status = item.data?.[statusColumn?.id]?.toLowerCase();
      const priority = item.data?.[priorityColumn?.id]?.toLowerCase();
      
      if (assignee) {
        if (!workloadMap[assignee]) {
          workloadMap[assignee] = {
            name: assignee,
            total: 0,
            completed: 0,
            inProgress: 0,
            overdue: 0,
            highPriority: 0
          };
        }
        
        workloadMap[assignee].total++;
        
        if (status === 'done' || status === 'completed') {
          workloadMap[assignee].completed++;
        } else if (status === 'working on it' || status === 'in progress') {
          workloadMap[assignee].inProgress++;
        }
        
        if (priority === 'high' || priority === 'critical') {
          workloadMap[assignee].highPriority++;
        }

        // Check for overdue
        const dateColumn = board?.columns?.find(col => col.type === 'date');
        const dueDate = item.data?.[dateColumn?.id];
        if (dueDate && new Date(dueDate) < new Date() && status !== 'done' && status !== 'completed') {
          workloadMap[assignee].overdue++;
        }
      }
    });

    // Convert to array and calculate percentages
    const workloadArray = Object.values(workloadMap).map(member => ({
      ...member,
      completionRate: member.total > 0 ? Math.round((member.completed / member.total) * 100) : 0,
      workloadLevel: getWorkloadLevel(member.total - member.completed)
    }));

    // Sort by total tasks
    workloadArray.sort((a, b) => b.total - a.total);
    setTeamWorkload(workloadArray);
  };

  const getWorkloadLevel = (activeTasks) => {
    if (activeTasks >= 10) return { level: 'high', color: 'text-red-500', bg: 'bg-red-100' };
    if (activeTasks >= 5) return { level: 'medium', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { level: 'low', color: 'text-green-500', bg: 'bg-green-100' };
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 
           name?.slice(0, 2).toUpperCase() || 'U';
  };

  const totalTasks = teamWorkload.reduce((acc, m) => acc + m.total, 0);
  const totalCompleted = teamWorkload.reduce((acc, m) => acc + m.completed, 0);
  const totalOverdue = teamWorkload.reduce((acc, m) => acc + m.overdue, 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-2xl font-bold">{teamWorkload.length}</p>
                <p className="text-blue-100 text-sm">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-2xl font-bold">{totalTasks}</p>
                <p className="text-purple-100 text-sm">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-2xl font-bold">{totalCompleted}</p>
                <p className="text-green-100 text-sm">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-2xl font-bold">{totalOverdue}</p>
                <p className="text-red-100 text-sm">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Member Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Team Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamWorkload.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{member.name}</h4>
                    <Badge className={`${member.workloadLevel.bg} ${member.workloadLevel.color} border-0`}>
                      {member.workloadLevel.level} load
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {member.inProgress} in progress
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      {member.completed} done
                    </span>
                    {member.overdue > 0 && (
                      <span className="flex items-center gap-1 text-red-500">
                        <AlertTriangle className="w-3 h-3" />
                        {member.overdue} overdue
                      </span>
                    )}
                    {member.highPriority > 0 && (
                      <span className="flex items-center gap-1 text-orange-500">
                        <TrendingUp className="w-3 h-3" />
                        {member.highPriority} high priority
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right min-w-[100px]">
                  <p className="text-2xl font-bold text-gray-900">{member.total}</p>
                  <p className="text-xs text-gray-500">total tasks</p>
                </div>

                <div className="w-24">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{member.completionRate}%</span>
                  </div>
                  <Progress value={member.completionRate} className="h-2" />
                </div>
              </motion.div>
            ))}

            {teamWorkload.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No assigned tasks found</p>
                <p className="text-sm">Assign tasks to team members to see workload</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}