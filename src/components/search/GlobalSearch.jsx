import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  Search, 
  FileText, 
  Folder, 
  Clock, 
  ArrowRight,
  Command,
  Hash
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ boards: [], items: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      loadRecentSearches();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length >= 2) {
      performSearch();
    } else {
      setResults({ boards: [], items: [] });
    }
  }, [query]);

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  };

  const saveRecentSearch = (searchQuery) => {
    const saved = localStorage.getItem('recentSearches');
    let recent = saved ? JSON.parse(saved) : [];
    recent = [searchQuery, ...recent.filter(s => s !== searchQuery)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
  };

  const performSearch = async () => {
    setIsSearching(true);
    
    const [boards, items] = await Promise.all([
      base44.entities.Board.list(),
      base44.entities.Item.list()
    ]);

    const lowercaseQuery = query.toLowerCase();
    
    const filteredBoards = boards.filter(board =>
      board.title.toLowerCase().includes(lowercaseQuery) ||
      board.description?.toLowerCase().includes(lowercaseQuery)
    ).slice(0, 5);

    const filteredItems = items.filter(item =>
      item.title.toLowerCase().includes(lowercaseQuery)
    ).slice(0, 10);

    setResults({
      boards: filteredBoards,
      items: filteredItems
    });
    
    setIsSearching(false);
  };

  const handleResultClick = (type, item) => {
    saveRecentSearch(query);
    onClose();
  };

  const totalResults = results.boards.length + results.items.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            ref={inputRef}
            placeholder="Search boards, items, and more..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 text-lg"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded">
            <Command className="w-3 h-3" />K
          </kbd>
        </div>

        <ScrollArea className="max-h-[60vh]">
          {/* Recent Searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-4">
              <p className="text-xs font-medium text-gray-500 uppercase mb-3">Recent Searches</p>
              <div className="space-y-1">
                {recentSearches.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(search)}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {query.length >= 2 && (
            <div className="p-4">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : totalResults > 0 ? (
                <div className="space-y-6">
                  {/* Boards */}
                  {results.boards.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-3">
                        Boards ({results.boards.length})
                      </p>
                      <div className="space-y-1">
                        {results.boards.map((board) => (
                          <Link
                            key={board.id}
                            to={createPageUrl(`BoardView?id=${board.id}`)}
                            onClick={() => handleResultClick('board', board)}
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group"
                            >
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${board.color}20` }}
                              >
                                <Folder className="w-5 h-5" style={{ color: board.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{board.title}</p>
                                {board.description && (
                                  <p className="text-sm text-gray-500 truncate">{board.description}</p>
                                )}
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  {results.items.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-3">
                        Items ({results.items.length})
                      </p>
                      <div className="space-y-1">
                        {results.items.map((item) => (
                          <Link
                            key={item.id}
                            to={createPageUrl(`BoardView?id=${item.board_id}&item=${item.id}`)}
                            onClick={() => handleResultClick('item', item)}
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group"
                            >
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-gray-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{item.title}</p>
                                <p className="text-sm text-gray-500">
                                  Updated {formatDistanceToNow(new Date(item.updated_date), { addSuffix: true })}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Search className="w-12 h-12 mb-3 opacity-30" />
                  <p className="font-medium">No results found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {query.length < 2 && (
            <div className="p-4 border-t">
              <p className="text-xs font-medium text-gray-500 uppercase mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <Link to={createPageUrl("Boards")} onClick={onClose}>
                  <Button variant="outline" className="w-full justify-start">
                    <Folder className="w-4 h-4 mr-2" />
                    View All Boards
                  </Button>
                </Link>
                <Link to={createPageUrl("Analytics")} onClick={onClose}>
                  <Button variant="outline" className="w-full justify-start">
                    <Hash className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border rounded">Enter</kbd>
              Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border rounded">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}