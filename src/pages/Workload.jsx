import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, RefreshCw } from "lucide-react";
import WorkloadView from "../components/workload/WorkloadView";

export default function WorkloadPage() {
  const [items, setItems] = useState([]);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredItems = selectedBoard === 'all' 
    ? items 
    : items.filter(item => item.board_id === selectedBoard);

  const filteredBoards = selectedBoard === 'all'
    ? boards
    : boards.filter(b => b.id === selectedBoard);

  return (
    <div className="p-6 bg-[#F5F6F8] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#323338]">Team Workload</h1>
              <p className="text-[#676879] text-sm">View and manage team capacity</p>
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
            
            <Button variant="outline" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Workload View */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <WorkloadView items={filteredItems} boards={filteredBoards} />
        )}
      </div>
    </div>
  );
}