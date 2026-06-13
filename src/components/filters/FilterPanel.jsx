import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Filter, 
  X, 
  Save, 
  Trash2, 
  Star,
  User
} from "lucide-react";

const statusOptions = ['Not Started', 'Working on it', 'Stuck', 'Done'];
const priorityOptions = ['Critical', 'High', 'Medium', 'Low'];

export default function FilterPanel({ 
  boardId, 
  filters, 
  onFilterChange, 
  columns = [],
  assignees = [] 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [localFilters, setLocalFilters] = useState({
    status: [],
    priority: [],
    assignee: [],
    dateRange: null,
    ...filters
  });

  useEffect(() => {
    loadSavedFilters();
  }, [boardId]);

  const loadSavedFilters = async () => {
    if (boardId) {
      const data = await base44.entities.SavedFilter.filter({ board_id: boardId });
      setSavedFilters(data);
    }
  };

  const handleFilterToggle = (category, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const cleared = {
      status: [],
      priority: [],
      assignee: [],
      dateRange: null
    };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  const saveFilter = async () => {
    if (!filterName.trim()) return;

    const savedFilter = await base44.entities.SavedFilter.create({
      name: filterName,
      board_id: boardId,
      filters: localFilters
    });

    setSavedFilters([...savedFilters, savedFilter]);
    setFilterName('');
  };

  const loadSavedFilter = (filter) => {
    setLocalFilters(filter.filters);
    onFilterChange(filter.filters);
  };

  const deleteSavedFilter = async (filterId) => {
    await base44.entities.SavedFilter.delete(filterId);
    setSavedFilters(savedFilters.filter(f => f.id !== filterId));
  };

  const activeFilterCount = Object.values(localFilters).reduce((count, val) => {
    if (Array.isArray(val)) return count + val.length;
    if (val) return count + 1;
    return count;
  }, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filter
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-blue-600">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Saved Filters
              </h4>
              <div className="space-y-2">
                {savedFilters.map(filter => (
                  <div 
                    key={filter.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group"
                  >
                    <button
                      onClick={() => loadSavedFilter(filter)}
                      className="text-sm font-medium text-gray-700 hover:text-blue-600"
                    >
                      {filter.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => deleteSavedFilter(filter.id)}
                    >
                      <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Accordion type="multiple" defaultValue={['status', 'priority']} className="space-y-2">
            {/* Status Filter */}
            <AccordionItem value="status" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2">
                  Status
                  {localFilters.status.length > 0 && (
                    <Badge variant="secondary" className="h-5">
                      {localFilters.status.length}
                    </Badge>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pb-2">
                  {statusOptions.map(status => (
                    <div key={status} className="flex items-center gap-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={localFilters.status.includes(status)}
                        onCheckedChange={() => handleFilterToggle('status', status)}
                      />
                      <Label htmlFor={`status-${status}`} className="text-sm cursor-pointer">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Priority Filter */}
            <AccordionItem value="priority" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2">
                  Priority
                  {localFilters.priority.length > 0 && (
                    <Badge variant="secondary" className="h-5">
                      {localFilters.priority.length}
                    </Badge>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pb-2">
                  {priorityOptions.map(priority => (
                    <div key={priority} className="flex items-center gap-2">
                      <Checkbox
                        id={`priority-${priority}`}
                        checked={localFilters.priority.includes(priority)}
                        onCheckedChange={() => handleFilterToggle('priority', priority)}
                      />
                      <Label htmlFor={`priority-${priority}`} className="text-sm cursor-pointer">
                        {priority}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Assignee Filter */}
            {assignees.length > 0 && (
              <AccordionItem value="assignee" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Assignee
                    {localFilters.assignee.length > 0 && (
                      <Badge variant="secondary" className="h-5">
                        {localFilters.assignee.length}
                      </Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pb-2">
                    {assignees.map(assignee => (
                      <div key={assignee} className="flex items-center gap-2">
                        <Checkbox
                          id={`assignee-${assignee}`}
                          checked={localFilters.assignee.includes(assignee)}
                          onCheckedChange={() => handleFilterToggle('assignee', assignee)}
                        />
                        <Label htmlFor={`assignee-${assignee}`} className="text-sm cursor-pointer">
                          {assignee}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {/* Save Filter */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Save Current Filter</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Filter name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
              <Button onClick={saveFilter} disabled={!filterName.trim()}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}