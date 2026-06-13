import React, { useState, useEffect } from "react";
import { Board } from "@/api/entities";
import { Item } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Folder, 
  Clock, 
  Users, 
  CheckCircle2,
  BarChart3
} from "lucide-react";

import RecentBoards from "../components/dashboard/RecentBoards";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [boardsData, itemsData, userData] = await Promise.all([
        Board.list("-updated_date", 10),
        Item.list("-updated_date", 20),
        User.me()
      ]);
      
      setBoards(boardsData);
      setItems(itemsData);
      setUser(userData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const handleCreateBoard = async (boardData) => {
    try {
      const newBoard = await Board.create(boardData);
      // Prepend new board to the list to show it immediately
      setBoards(prev => [newBoard, ...prev]);
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const pendingTasks = items.filter(item => !item.data?.status || item.data?.status !== 'done').length;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section - Made more compact */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {getGreeting()}, {user?.full_name?.split(' ')[0] || 'there'}
                </h1>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {pendingTasks} active tasks • {boards.length} boards
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded text-xs font-medium text-green-700">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                System Operational
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <Link to={createPageUrl("Boards")}>
              <Button variant="outline" size="sm" className="text-sm font-medium">
                <Folder className="w-4 h-4 mr-2" />
                Boards
              </Button>
            </Link>
            <Link to={createPageUrl("Analytics")}>
              <Button variant="outline" size="sm" className="text-sm font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link to={createPageUrl("Workload")}>
              <Button variant="outline" size="sm" className="text-sm font-medium">
                <Users className="w-4 h-4 mr-2" />
                Workload
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                <Folder className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">↑ 12%</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">
              {isLoading ? "—" : boards.length}
            </h3>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Active Boards</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">↑ 25%</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">
              {isLoading ? "—" : items.filter(i => i.data?.status === 'Done').length}
            </h3>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Completed Tasks</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-xs text-amber-600 font-medium">Active</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">
              {isLoading ? "—" : pendingTasks}
            </h3>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">In Progress</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500 font-medium">8 Online</span>
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">
              {isLoading ? "—" : "8"}
            </h3>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Team Members</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid xl:grid-cols-4 gap-8">
          {/* Left Column - Boards and Activity */}
          <div className="xl:col-span-3 space-y-8">
            <RecentBoards 
              boards={boards}
              isLoading={isLoading}
              onCreateBoard={handleCreateBoard}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            <QuickActions onCreateBoard={handleCreateBoard} />
            <ActivityFeed 
              items={items.slice(0, 5)}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}