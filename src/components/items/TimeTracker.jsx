import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, Plus, Trash2, Timer } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function TimeTracker({ itemId }) {
  const [timeLogs, setTimeLogs] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualHours, setManualHours] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadTimeLogs();
    loadUser();
  }, [itemId]);

  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadTimeLogs = async () => {
    const data = await base44.entities.TimeLog.filter({ item_id: itemId }, '-created_date');
    setTimeLogs(data);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTotalTime = () => {
    return timeLogs.reduce((acc, log) => acc + (log.duration_minutes || 0), 0);
  };

  const handleStartStop = async () => {
    if (isTracking) {
      // Stop tracking and save
      const durationMinutes = Math.ceil(elapsedSeconds / 60);
      if (durationMinutes > 0) {
        const timeLog = await base44.entities.TimeLog.create({
          item_id: itemId,
          duration_minutes: durationMinutes,
          description: 'Time tracked',
          logged_date: new Date().toISOString().split('T')[0],
          user_email: currentUser?.email
        });
        setTimeLogs([timeLog, ...timeLogs]);
      }
      setElapsedSeconds(0);
    }
    setIsTracking(!isTracking);
  };

  const handleAddManual = async () => {
    const hours = parseInt(manualHours) || 0;
    const minutes = parseInt(manualMinutes) || 0;
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes <= 0) return;

    const timeLog = await base44.entities.TimeLog.create({
      item_id: itemId,
      duration_minutes: totalMinutes,
      description: manualDescription || 'Manually logged time',
      logged_date: new Date().toISOString().split('T')[0],
      user_email: currentUser?.email
    });

    setTimeLogs([timeLog, ...timeLogs]);
    setManualHours('');
    setManualMinutes('');
    setManualDescription('');
    setShowAddManual(false);
  };

  const handleDeleteLog = async (logId) => {
    await base44.entities.TimeLog.delete(logId);
    setTimeLogs(timeLogs.filter(l => l.id !== logId));
  };

  return (
    <div className="space-y-4">
      {/* Timer Controls */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-gray-900">
                  {formatTime(elapsedSeconds)}
                </p>
                <p className="text-sm text-gray-500">
                  {isTracking ? 'Tracking time...' : 'Ready to track'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleStartStop}
                className={isTracking 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-green-500 hover:bg-green-600"
                }
              >
                {isTracking ? (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddManual(!showAddManual)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Log Time
              </Button>
            </div>
          </div>

          {/* Manual Time Entry */}
          <AnimatePresence>
            {showAddManual && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-blue-200"
              >
                <div className="flex gap-3 items-end">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Hours</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={manualHours}
                      onChange={(e) => setManualHours(e.target.value)}
                      className="w-20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Minutes</label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="0"
                      value={manualMinutes}
                      onChange={(e) => setManualMinutes(e.target.value)}
                      className="w-20"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Description</label>
                    <Input
                      placeholder="What did you work on?"
                      value={manualDescription}
                      onChange={(e) => setManualDescription(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddManual} className="bg-blue-600 hover:bg-blue-700">
                    Add
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Total Time */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-600">Total Time Logged</span>
        <Badge variant="secondary" className="text-lg font-mono">
          {formatDuration(getTotalTime())}
        </Badge>
      </div>

      {/* Time Logs List */}
      <div className="space-y-2">
        <AnimatePresence>
          {timeLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-blue-200 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium text-sm">{formatDuration(log.duration_minutes)}</p>
                  <p className="text-xs text-gray-500">{log.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {log.logged_date && format(new Date(log.logged_date), 'MMM d, yyyy')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                  onClick={() => handleDeleteLog(log.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {timeLogs.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-4">
            No time logged yet. Start the timer or add time manually.
          </p>
        )}
      </div>
    </div>
  );
}