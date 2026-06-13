import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Paperclip, 
  Upload, 
  File, 
  FileText, 
  Image, 
  Video, 
  Music,
  Download,
  Trash2,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const getFileIcon = (fileType) => {
  if (fileType?.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
  if (fileType?.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
  if (fileType?.startsWith('audio/')) return <Music className="w-5 h-5 text-green-500" />;
  if (fileType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default function AttachmentManager({ itemId }) {
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadAttachments();
  }, [itemId]);

  const loadAttachments = async () => {
    const data = await base44.entities.Attachment.filter({ item_id: itemId }, '-created_date');
    setAttachments(data);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create attachment record
      await base44.entities.Attachment.create({
        item_id: itemId,
        file_name: file.name,
        file_url: file_url,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: (await base44.auth.me()).email
      });

      await loadAttachments();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.Attachment.delete(id);
    await loadAttachments();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <label 
          htmlFor="file-upload" 
          className="cursor-pointer flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
            <Upload className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            Any file up to 50MB
          </p>
        </label>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Uploading...</span>
            <span className="text-sm text-blue-600">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Attachments List */}
      <div className="space-y-2">
        <AnimatePresence>
          {attachments.map((attachment, index) => (
            <motion.div
              key={attachment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(attachment.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.file_name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatFileSize(attachment.file_size)}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(attachment.created_date), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => window.open(attachment.file_url, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = attachment.file_url;
                    a.download = attachment.file_name;
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(attachment.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {attachments.length === 0 && !isUploading && (
          <div className="text-center py-8 text-gray-400">
            <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No attachments yet</p>
          </div>
        )}
      </div>

      {/* Summary */}
      {attachments.length > 0 && (
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{attachments.length} file{attachments.length !== 1 ? 's' : ''}</span>
            <span>
              Total: {formatFileSize(attachments.reduce((sum, att) => sum + (att.file_size || 0), 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}