interface VisionResponse {
  extractedText: string;
  confidence: number;
  detectedLanguage?: string;
  documentType?: string;
}

interface TextAnnotation {
  description: string;
  boundingPoly?: {
    vertices: Array<{ x: number; y: number }>;
  };
}

interface VisionApiResponse {
  responses: Array<{
    textAnnotations?: TextAnnotation[];
    fullTextAnnotation?: {
      text: string;
    };
    error?: {
      code: number;
      message: string;
    };
  }>;
}

export class VisionService {
  private apiKey: string;
  private apiUrl = 'https://vision.googleapis.com/v1/images:annotate';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeImage(imageFile: File): Promise<VisionResponse> {
    if (!this.apiKey) {
      throw new Error('Vision API key is not configured. Please add VITE_VISION_API_KEY to your environment variables.');
    }

    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      // Prepare the request payload
      const requestPayload = {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 50
              },
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 50
              }
            ]
          }
        ]
      };

      // Make API request
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`Vision API request failed: ${response.status} ${response.statusText}`);
      }

      const data: VisionApiResponse = await response.json();
      
      // Check for API errors
      if (data.responses[0]?.error) {
        throw new Error(`Vision API error: ${data.responses[0].error.message}`);
      }

      return this.processVisionResponse(data);
    } catch (error) {
      console.error('Error analyzing image with Vision API:', error);
      throw new Error('Failed to analyze image. Please try again.');
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to convert file to base64'));
      reader.readAsDataURL(file);
    });
  }

  private processVisionResponse(data: VisionApiResponse): VisionResponse {
    const response = data.responses[0];
    
    if (!response) {
      throw new Error('No response from Vision API');
    }

    // Try to get text from document text detection first (better for documents)
    let extractedText = response.fullTextAnnotation?.text || '';
    
    // If no document text, try regular text annotations
    if (!extractedText && response.textAnnotations && response.textAnnotations.length > 0) {
      extractedText = response.textAnnotations[0].description || '';
    }

    // Calculate confidence (simplified - in real implementation you'd analyze all annotations)
    const confidence = extractedText ? 0.85 : 0;

    // Detect document type based on content
    const documentType = this.detectDocumentType(extractedText);

    return {
      extractedText: extractedText.trim(),
      confidence,
      documentType
    };
  }

  private detectDocumentType(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('theorem') || lowerText.includes('proof') || /\d+\s*[+\-*/=]\s*\d+/.test(text)) {
      return 'Mathematics';
    }
    if (lowerText.includes('chapter') || lowerText.includes('essay') || lowerText.includes('literature')) {
      return 'Literature';
    }
    if (lowerText.includes('experiment') || lowerText.includes('hypothesis') || lowerText.includes('molecule')) {
      return 'Science';
    }
    if (lowerText.includes('history') || lowerText.includes('century') || lowerText.includes('war')) {
      return 'History';
    }
    if (lowerText.includes('function') || lowerText.includes('algorithm') || lowerText.includes('code')) {
      return 'Computer Science';
    }
    
    return 'General Document';
  }

  async analyzeHandwriting(imageFile: File): Promise<VisionResponse> {
    if (!this.apiKey) {
      throw new Error('Vision API key is not configured. Please add VITE_VISION_API_KEY to your environment variables.');
    }

    try {
      const base64Image = await this.fileToBase64(imageFile);
      
      const requestPayload = {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 50
              }
            ]
          }
        ]
      };

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`Vision API request failed: ${response.status}`);
      }

      const data: VisionApiResponse = await response.json();
      
      if (data.responses[0]?.error) {
        throw new Error(`Vision API error: ${data.responses[0].error.message}`);
      }

      return this.processVisionResponse(data);
    } catch (error) {
      console.error('Error analyzing handwriting:', error);
      throw new Error('Failed to analyze handwriting. Please try again.');
    }
  }
}

// Create a singleton instance using environment variable
const VISION_API_KEY = import.meta.env.VITE_VISION_API_KEY;
export const visionService = new VisionService(VISION_API_KEY);