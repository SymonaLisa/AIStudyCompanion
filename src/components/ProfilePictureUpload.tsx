import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  User, 
  Loader2, 
  X, 
  Check,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface ProfilePictureUploadProps {
  userId: string;
  currentAvatarUrl?: string;
  onAvatarUpdate: (avatarUrl: string) => void;
  darkMode: boolean;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  userId,
  currentAvatarUrl,
  onAvatarUpdate,
  darkMode
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Delete old avatar if it exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop();
        if (oldPath && oldPath !== fileName) {
          await supabase.storage
            .from('profile-pictures')
            .remove([`avatars/${oldPath}`]);
        }
      }

      onAvatarUpdate(avatarUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="space-y-4">
      {/* Current/Preview Avatar */}
      <div className="flex items-center justify-center">
        <div className="relative">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Profile"
              className="w-24 h-24 rounded-3xl object-cover shadow-lg border-4 border-accent-200 dark:border-dark-muted"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-lg">
              <User className="w-12 h-12 text-white" />
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-3xl flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          {success && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center shadow-lg">
              <Check className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer ${
          isUploading
            ? 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20'
            : 'border-accent-300 dark:border-dark-muted hover:border-primary-400 dark:hover:border-primary-500 bg-accent-50 dark:bg-dark-surface hover:bg-primary-50 dark:hover:bg-primary-900/20'
        }`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="space-y-3">
          <div className="flex justify-center">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            ) : (
              <div className="flex space-x-2">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                </div>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-accent-800 dark:text-accent-100 font-medium mb-1">
              {isUploading ? 'Uploading...' : 'Upload Profile Picture'}
            </p>
            <p className="text-accent-600 dark:text-accent-400 text-sm">
              {isUploading 
                ? 'Please wait while we upload your image'
                : 'Click to browse or drag and drop an image'
              }
            </p>
          </div>

          {!isUploading && (
            <p className="text-xs text-accent-500 dark:text-accent-400">
              Supports JPG, PNG, GIF • Max size 5MB
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-highlight-50 dark:bg-highlight-900/20 border-l-4 border-highlight-400 p-4 rounded-r-xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-highlight-600 dark:text-highlight-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-highlight-700 dark:text-highlight-300 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-highlight-500 hover:text-highlight-700 dark:hover:text-highlight-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-secondary-50 dark:bg-secondary-900/20 border-l-4 border-secondary-400 p-4 rounded-r-xl">
          <div className="flex items-center space-x-3">
            <Check className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            <p className="text-secondary-700 dark:text-secondary-300 text-sm font-medium">
              Profile picture updated successfully!
            </p>
          </div>
        </div>
      )}

      {/* Preview Controls */}
      {previewUrl && !isUploading && (
        <div className="flex justify-center">
          <button
            onClick={clearPreview}
            className="px-4 py-2 bg-accent-100 dark:bg-dark-muted text-accent-700 dark:text-accent-300 rounded-xl hover:bg-accent-200 dark:hover:bg-dark-surface transition-all duration-300 text-sm"
          >
            Cancel Preview
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;