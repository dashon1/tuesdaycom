import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, MousePointer2 } from "lucide-react";

// Simulated live presence (in production, use WebSocket/real-time service)
export default function LivePresence({ boardId }) {
  const [activeUsers, setActiveUsers] = useState([
    { id: 1, name: 'Alex Chen', email: 'alex@example.com', avatar: 'AC', color: '#FF6B6B', lastSeen: new Date() },
    { id: 2, name: 'Sarah Miller', email: 'sarah@example.com', avatar: 'SM', color: '#4ECDC4', lastSeen: new Date() }
  ]);

  const [cursors, setCursors] = useState({});

  useEffect(() => {
    // Simulate cursor movement
    const interval = setInterval(() => {
      setCursors({
        1: { x: Math.random() * 100, y: Math.random() * 100 },
        2: { x: Math.random() * 100, y: Math.random() * 100 }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="relative">
      {/* Active Users Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <Eye className="w-4 h-4 text-gray-400" />
        <div className="flex -space-x-2">
          <AnimatePresence>
            {activeUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                className="relative"
              >
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer"
                  style={{ backgroundColor: user.color }}
                  title={`${user.name} is viewing`}
                >
                  {user.avatar}
                  <motion.div
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {activeUsers.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeUsers.length} viewing
          </Badge>
        )}
      </motion.div>

      {/* Live Cursors (overlay on board) */}
      {Object.entries(cursors).map(([userId, pos]) => {
        const user = activeUsers.find(u => u.id === parseInt(userId));
        if (!user) return null;

        return (
          <motion.div
            key={userId}
            className="fixed pointer-events-none z-50"
            animate={{ x: `${pos.x}vw`, y: `${pos.y}vh` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <MousePointer2 
              className="w-5 h-5" 
              style={{ color: user.color }}
              fill={user.color}
            />
            <div 
              className="text-xs font-medium px-2 py-1 rounded shadow-lg ml-4 -mt-1"
              style={{ backgroundColor: user.color, color: 'white' }}
            >
              {user.name}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}