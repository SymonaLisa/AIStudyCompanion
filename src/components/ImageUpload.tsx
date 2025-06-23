import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  X,
  Eye
} from 'lucide-react';
import { visionService, VisionResponse } from '../services/visionService';

interface ImageUploadProps {
  onTextExtracted: (text: string, documentType: string) => void;
  darkMode: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onTextExtracted, darkMode }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, etc.)');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      // Analyze image with Vision API
      const result = await visionService.analyzeImage(file);
      setAnalysisResult(result);

      if (result.extractedText) {
        onTextExtracted(result.extractedText, result.documentType || 'Document');
      } else {
        setError('No text was detected in the image. Please try a clearer image.');
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
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

  const clearResults = () => {
    setAnalysisResult(null);
    setError(null);
    setUploadedImage(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 ${
          isAnalyzing
            ? 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20'
            : 'border-accent-300 dark:border-dark-muted hover:border-primary-400 dark:hover:border-primary-500 bg-accent-50 dark:bg-dark-surface hover:bg-primary-50 dark:hover:bg-primary-900/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isAnalyzing}
        />

        {isAnalyzing ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-primary-500 mx-auto animate-spin" />
            <div>
              <h3 className="text-lg font-semibold text-accent-800 dark:text-accent-100 mb-2">
                Analyzing Image...
              </h3>
              <p className="text-accent-600 dark:text-accent-400">
                Extracting text and analyzing content with Google Vision AI
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900/30 rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-accent-800 dark:text-accent-100 mb-2">
                Upload Study Materials
              </h3>
              <p className="text-accent-600 dark:text-accent-400 mb-4">
                Take a photo or upload images of notes, textbooks, handwritten work, or documents
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-3 px-6 py-3 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Upload className="w-5 h-5" />
                <span>Choose Image</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-3 px-6 py-3 bg-accent-100 dark:bg-dark-muted text-accent-700 dark:text-accent-300 rounded-2xl hover:bg-accent-200 dark:hover:bg-dark-surface transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Camera className="w-5 h-5" />
                <span>Take Photo</span>
              </button>
            </div>

            <p className="text-xs text-accent-500 dark:text-accent-400">
              Supports JPG, PNG, and other image formats • Powered by Google Vision AI
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-highlight-50 dark:bg-highlight-900/20 border-l-4 border-highlight-400 p-6 rounded-r-2xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-highlight-600 dark:text-highlight-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-highlight-800 dark:text-highlight-200 font-medium mb-1">
                Analysis Error
              </h4>
              <p className="text-highlight-700 dark:text-highlight-300 text-sm">{error}</p>
            </div>
            <button
              onClick={clearResults}
              className="text-highlight-500 hover:text-highlight-700 dark:hover:text-highlight-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Success Result */}
      {analysisResult && analysisResult.extractedText && (
        <div className="bg-secondary-50 dark:bg-secondary-900/20 border-l-4 border-secondary-400 dark:border-secondary-500 p-6 rounded-r-2xl">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-secondary-600 dark:text-secondary-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-secondary-800 dark:text-secondary-200 font-medium">
                  Text Successfully Extracted
                </h4>
                <div className="flex items-center space-x-3">
                  {uploadedImage && (
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center space-x-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{showPreview ? 'Hide' : 'Show'} Image</span>
                    </button>
                  )}
                  <button
                    onClick={clearResults}
                    className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium text-secondary-700 dark:text-secondary-300">Document Type:</span>
                  <p className="text-secondary-800 dark:text-secondary-200">{analysisResult.documentType}</p>
                </div>
                <div>
                  <span className="font-medium text-secondary-700 dark:text-secondary-300">Confidence:</span>
                  <p className="text-secondary-800 dark:text-secondary-200">{Math.round(analysisResult.confidence * 100)}%</p>
                </div>
              </div>

              {showPreview && uploadedImage && (
                <div className="mb-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded document"
                    className="max-w-full h-auto max-h-64 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-lg"
                  />
                </div>
              )}

              <div className="bg-accent-50 dark:bg-dark-surface rounded-xl p-4 max-h-48 overflow-y-auto">
                <h5 className="font-medium text-accent-800 dark:text-accent-100 mb-2">Extracted Text:</h5>
                <p className="text-accent-700 dark:text-accent-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {analysisResult.extractedText}
                </p>
              </div>

              <p className="text-secondary-600 dark:text-secondary-400 text-sm mt-3">
                The extracted text has been added to your study session. You can now ask questions about this content!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;