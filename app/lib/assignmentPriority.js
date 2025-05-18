/**
 * Utility for analyzing PDF attachments to determine assignment priority
 */
import { extractTextFromBuffer } from './pdfText';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Analyzes PDF content to determine assignment priority
 * @param {File|Buffer} pdfFile - PDF file or buffer to analyze
 * @returns {Promise<{priority: string, reason: string}>} - Priority (low, medium, high) and reasoning
 */
export async function analyzePdfForPriority(pdfFile) {
  try {
    // Default result in case of errors
    let defaultResult = { 
      priority: "medium", 
      reason: "Unable to analyze PDF content. Setting default priority."
    };
    
    // Convert File to buffer if needed
    let pdfBuffer;
    if (pdfFile instanceof File) {
      const arrayBuffer = await pdfFile.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
    } else {
      pdfBuffer = pdfFile;
    }
    
    // Extract text from PDF
    const pdfText = await extractTextFromBuffer(pdfBuffer);
    if (!pdfText || pdfText.trim().length === 0) {
      console.log("No text extracted from PDF");
      return defaultResult;
    }
    
    // Use a shorter sample of the text for analysis (to avoid token limits)
    const textForAnalysis = pdfText.substring(0, 4000);
    
    // Use Gemini to analyze the content
    const result = await analyzeContentWithGemini(textForAnalysis);
    return result;
  } catch (error) {
    console.error("Error analyzing PDF for priority:", error);
    return { 
      priority: "medium", 
      reason: "Error analyzing content. Setting default priority."
    };
  }
}

/**
 * Uses Gemini API to analyze text content and determine priority
 * @param {string} content - Text content to analyze
 * @returns {Promise<{priority: string, reason: string}>} - Priority assessment
 */
async function analyzeContentWithGemini(content) {
  try {
    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!apiKey) {
      console.error("No Gemini API key found");
      return { 
        priority: "medium", 
        reason: "API key not available. Setting default priority." 
      };
    }
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for analysis
    const prompt = `
      You are an AI specialized in analyzing academic assignments. 
      Based on the content provided, determine the priority level this assignment should have.
      
      Consider these factors:
      - Complexity of the material
      - Amount of work required
      - Technical difficulty
      - Importance of concepts covered
      
      Analyze this assignment content and classify it as "low", "medium", or "high" priority.
      
      Provide your response in the following JSON format only:
      {
        "priority": "low|medium|high",
        "reason": "A brief 1-2 sentence explanation for this priority level"
      }
      
      Assignment Content:
      ${content}
    `;
    
    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse JSON from response
    try {
      // Extract JSON from possible text wrapper
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonResponse = JSON.parse(jsonMatch[0]);
        // Validate and normalize the priority
        const priority = normalizePriority(jsonResponse.priority);
        return {
          priority,
          reason: jsonResponse.reason || `The assignment appears to be ${priority} priority.`
        };
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
    }
    
    // Fallback if parsing fails
    return { 
      priority: "medium", 
      reason: "Unable to determine precise priority. Setting default priority."
    };
  } catch (error) {
    console.error("Error analyzing content with Gemini:", error);
    return { 
      priority: "medium", 
      reason: "Error during AI analysis. Setting default priority."
    };
  }
}

/**
 * Normalize priority value to ensure it's one of the expected values
 * @param {string} priority - Priority value from analysis
 * @returns {string} - Normalized priority (low, medium, or high)
 */
function normalizePriority(priority) {
  if (!priority || typeof priority !== 'string') {
    return "medium";
  }
  
  const lowerPriority = priority.toLowerCase().trim();
  
  if (lowerPriority.includes("low")) {
    return "low";
  } else if (lowerPriority.includes("high")) {
    return "high";
  } else {
    return "medium";
  }
}

/**
 * Client-side function to analyze a PDF file and get priority
 * This version works in the browser environment
 * @param {File} pdfFile - PDF file to analyze
 * @returns {Promise<{priority: string, reason: string}>} - Priority assessment
 */
export async function analyzeClientPdfForPriority(pdfFile) {
  try {
    // For client-side usage, we need to send the file to a server endpoint
    // that can use Gemini to analyze it
    if (!pdfFile) {
      return { 
        priority: "medium",
        reason: "No file provided for analysis. Setting default priority."
      };
    }
    
    // Check if it's a PDF
    if (!pdfFile.type.includes('pdf')) {
      return { 
        priority: "medium",
        reason: "File is not a PDF. Setting default priority."
      };
    }
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', pdfFile);
    
    // Call API endpoint to analyze PDF
    const response = await fetch('/api/assignment/analyze-priority', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error analyzing PDF on client:", error);
    // Fallback to medium priority if anything goes wrong
    return {
      priority: "medium",
      reason: "Error during analysis. Setting default priority."
    };
  }
}
