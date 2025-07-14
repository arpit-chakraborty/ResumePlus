import { GoogleGenAI, Type } from "@google/genai";

export interface ResumeAnalysisResult {
  score: number;
  improvements: Array<{
    category: string;
    suggestion: string;
  }>;
  strengths: string[];
}

export class ResumeService {
  private static ai: GoogleGenAI;

  /**
   * Initialize the service with an API key
   * @param apiKey Your Gemini API key
   */
  static initialize(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Converts a File/Blob to base64 string
   * @param file The file to convert
   * @returns Promise resolving to base64 string
   */
  private static async fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Analyzes resume PDF using Gemini API
   * @param file The PDF file to analyze
   * @returns Analysis result
   */
  private static async analyzeWithGemini(file: File | Blob): Promise<ResumeAnalysisResult> {
    if (!this.ai) {
      throw new Error('Service not initialized. Call ResumeService.initialize() first.');
    }

    const base64Data = await this.fileToBase64(file);

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash", // or "gemini-2.5-flash" when available
      contents: [
        {
          parts: [
            { text: this.getAnalysisPrompt() },
            { 
              inlineData: {
                mimeType: file.type,
                data: base64Data
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "Overall resume quality score (0-100)"
            },
            improvements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                }
              },
              description: "List of suggested improvements"
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of resume strengths"
            }
          },
          required: ["score", "improvements", "strengths"]
        }
      }
    });

    return this.processResponse(response.text);
  }

  private static getAnalysisPrompt(): string {
    return `
      Analyze this resume PDF and provide detailed feedback in the specified JSON format.
      
      As a professional career coach with 10+ years experience, evaluate:
      
      1. CONTENT QUALITY:
      - Relevance to modern hiring practices
      - Clarity and impact of professional summary
      - Effectiveness of work experience descriptions
      
      2. ACHIEVEMENTS:
      - Use of action verbs and power words
      - Quantifiable results and metrics
      - Demonstrated impact in roles
      
      3. TECHNICAL PRESENTATION:
      - Skills section organization
      - Technical proficiency demonstration
      - Certifications and education
      
      4. DESIGN & FORMATTING:
      - Visual hierarchy and readability
      - Consistency in styling
      - ATS (Applicant Tracking System) compatibility
      
      5. OVERALL EFFECTIVENESS:
      - Strength for target industry/role
      - Competitive edge
      - Areas needing improvement
      
      Provide specific, actionable suggestions.
      Highlight 3-5 key strengths.
      Be professional but constructive.
      
      Return ONLY the JSON object in the specified format.
    `;
  }

  private static processResponse(text: string): ResumeAnalysisResult {
    try {
      // Clean the response (remove markdown code blocks if present)
      const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(jsonString);
      
      // Validate the structure
      if (typeof result?.score !== 'number' || 
          !Array.isArray(result?.improvements) || 
          !Array.isArray(result?.strengths)) {
        throw new Error('Invalid response structure');
      }
      
      return result;
    } catch (e) {
      console.error('Failed to process response:', text);
      throw new Error('Failed to parse analysis results');
    }
  }

  /**
   * Analyzes a resume PDF file
   * @param file The PDF resume file to analyze
   * @returns Promise resolving to analysis result
   */
  static async analyzeResume(file: File): Promise<ResumeAnalysisResult> {
    try {
      // Verify it's a PDF file
      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are supported');
      }

      // Check file size (limit to 4MB for Gemini)
      if (file.size > 4 * 1024 * 1024) {
        throw new Error('File size must be less than 4MB');
      }

      return await this.analyzeWithGemini(file);
    } catch (error) {
      console.error('Resume analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyzes a resume from a URL
   * @param url URL of the PDF resume
   * @returns Promise resolving to analysis result
   */
  static async analyzeResumeFromUrl(url: string): Promise<ResumeAnalysisResult> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);
      
      const blob = await response.blob();
      if (blob.type !== 'application/pdf') {
        throw new Error('URL does not point to a PDF file');
      }
      
      return await this.analyzeWithGemini(blob);
    } catch (error) {
      console.error('URL analysis failed:', error);
      throw error;
    }
  }
}