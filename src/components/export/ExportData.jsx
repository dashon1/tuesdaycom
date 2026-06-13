import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Download, 
  FileSpreadsheet, 
  FileText,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

export default function ExportData({ isOpen, onClose, items = [], board, columns = [] }) {
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedColumns, setSelectedColumns] = useState(
    columns.map(col => col.id)
  );
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const toggleColumn = (columnId) => {
    setSelectedColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const exportToCSV = () => {
    const headers = ['Title'];
    if (includeMetadata) {
      headers.push('Created Date', 'Updated Date', 'Created By');
    }
    columns.filter(col => selectedColumns.includes(col.id)).forEach(col => {
      headers.push(col.title);
    });

    const rows = items.map(item => {
      const row = [item.title];
      if (includeMetadata) {
        row.push(
          format(new Date(item.created_date), 'yyyy-MM-dd HH:mm'),
          format(new Date(item.updated_date), 'yyyy-MM-dd HH:mm'),
          item.created_by
        );
      }
      columns.filter(col => selectedColumns.includes(col.id)).forEach(col => {
        row.push(item.data?.[col.id] || '');
      });
      return row;
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    downloadFile(csvContent, `${board?.title || 'export'}.csv`, 'text/csv');
  };

  const exportToJSON = () => {
    const data = items.map(item => {
      const obj = { title: item.title };
      if (includeMetadata) {
        obj.created_date = item.created_date;
        obj.updated_date = item.updated_date;
        obj.created_by = item.created_by;
      }
      columns.filter(col => selectedColumns.includes(col.id)).forEach(col => {
        obj[col.title] = item.data?.[col.id] || null;
      });
      return obj;
    });

    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${board?.title || 'export'}.json`, 'application/json');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (exportFormat === 'csv') {
      exportToCSV();
    } else if (exportFormat === 'json') {
      exportToJSON();
    }
    
    setIsExporting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-500" />
            Export Data
          </DialogTitle>
          <DialogDescription>
            Export {items.length} items from {board?.title || 'this board'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Export Format</Label>
            <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
              <div className="grid grid-cols-2 gap-3">
                <label 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportFormat === 'csv' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <RadioGroupItem value="csv" id="csv" />
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">CSV</p>
                    <p className="text-xs text-gray-500">Excel compatible</p>
                  </div>
                </label>
                <label 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportFormat === 'json' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <RadioGroupItem value="json" id="json" />
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">JSON</p>
                    <p className="text-xs text-gray-500">For developers</p>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Column Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Columns to Include</Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {columns.map(col => (
                <div key={col.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`col-${col.id}`}
                    checked={selectedColumns.includes(col.id)}
                    onCheckedChange={() => toggleColumn(col.id)}
                  />
                  <Label htmlFor={`col-${col.id}`} className="text-sm cursor-pointer">
                    {col.title}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="metadata"
              checked={includeMetadata}
              onCheckedChange={setIncludeMetadata}
            />
            <Label htmlFor="metadata" className="text-sm cursor-pointer">
              Include metadata (dates, created by)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || selectedColumns.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {items.length} Items
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}