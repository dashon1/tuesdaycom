import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  List,
  Grid3X3
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState([]);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [viewMode, setViewMode] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [boardsData, itemsData] = await Promise.all([
      base44.entities.Board.list(),
      base44.entities.Item.list()
    ]);
    setBoards(boardsData);
    setItems(itemsData);
    setIsLoading(false);
  };

  const getItemsWithDueDate = () => {
    return items.filter(item => {
      const board = boards.find(b => b.id === item.board_id);
      const dueDateColumn = board?.columns?.find(col => col.type === 'date');
      const dueDate = item.data?.[dueDateColumn?.id];
      
      if (selectedBoard !== 'all' && item.board_id !== selectedBoard) {
        return false;
      }
      
      return !!dueDate;
    }).map(item => {
      const board = boards.find(b => b.id === item.board_id);
      const dueDateColumn = board?.columns?.find(col => col.type === 'date');
      const statusColumn = board?.columns?.find(col => col.type === 'status');
      
      return {
        ...item,
        dueDate: new Date(item.data?.[dueDateColumn?.id]),
        status: item.data?.[statusColumn?.id],
        boardTitle: board?.title,
        boardColor: board?.color
      };
    });
  };

  const getItemsForDay = (day) => {
    return getItemsWithDueDate().filter(item => 
      isSameDay(item.dueDate, day)
    );
  };

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'done':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'working on it':
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'stuck':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6 bg-[#F5F6F8] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#323338]">Calendar</h1>
              <p className="text-[#676879] text-sm">View all your deadlines and tasks</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Boards</SelectItem>
                {boards.map(board => (
                  <SelectItem key={board.id} value={board.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: board.color }}
                      />
                      {board.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calendar Navigation */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-bold text-gray-900 min-w-[200px] text-center">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentDate(new Date())}
                  className="text-blue-600"
                >
                  Today
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className={viewMode === 'month' ? 'bg-blue-600' : ''}
                >
                  <Grid3X3 className="w-4 h-4 mr-1" />
                  Month
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-blue-600' : ''}
                >
                  <List className="w-4 h-4 mr-1" />
                  List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        {viewMode === 'month' ? (
          <Card>
            <CardContent className="p-4">
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div 
                    key={day}
                    className="text-center py-2 text-sm font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayItems = getItemsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = selectedDay && isSameDay(day, selectedDay);
                  
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className={`min-h-[100px] p-2 rounded-lg border cursor-pointer transition-colors ${
                        isToday(day) 
                          ? 'bg-blue-50 border-blue-200' 
                          : isSelected
                            ? 'bg-gray-100 border-gray-300'
                            : isCurrentMonth 
                              ? 'bg-white border-gray-100 hover:border-gray-200' 
                              : 'bg-gray-50 border-gray-50'
                      }`}
                      onClick={() => setSelectedDay(day)}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isToday(day) 
                          ? 'text-blue-600' 
                          : isCurrentMonth 
                            ? 'text-gray-900' 
                            : 'text-gray-400'
                      }`}>
                        {format(day, 'd')}
                      </div>
                      
                      <div className="space-y-1">
                        {dayItems.slice(0, 3).map((item, i) => (
                          <div
                            key={item.id}
                            className={`text-xs p-1 rounded truncate border ${getStatusColor(item.status)}`}
                            style={{ borderLeftColor: item.boardColor, borderLeftWidth: 3 }}
                          >
                            {item.title}
                          </div>
                        ))}
                        {dayItems.length > 3 && (
                          <div className="text-xs text-gray-500 font-medium">
                            +{dayItems.length - 3} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* List View */
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {getItemsWithDueDate()
                  .sort((a, b) => a.dueDate - b.dueDate)
                  .map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
                    >
                      <div 
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: item.boardColor }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.boardTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          isToday(item.dueDate) ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                          {format(item.dueDate, 'MMM d, yyyy')}
                        </p>
                        <Badge className={`${getStatusColor(item.status)} mt-1`}>
                          {item.status || 'Not Started'}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}

                {getItemsWithDueDate().length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No items with due dates</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Day Details */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900">
                      {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDay(null)}
                    >
                      Close
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {getItemsForDay(selectedDay).map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: item.boardColor }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.boardTitle}</p>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status || 'Not Started'}
                        </Badge>
                      </div>
                    ))}
                    
                    {getItemsForDay(selectedDay).length === 0 && (
                      <p className="text-center text-gray-400 py-4">
                        No tasks due on this day
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}