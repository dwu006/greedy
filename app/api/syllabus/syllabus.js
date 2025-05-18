import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { createClass } from '../class/class';
import { getRandomColor } from '../../utils/helpers';
import { extractTextFromBuffer } from '../../lib/pdfText';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Gemini API with your API key (Next.js handles env loading)
const API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Verify API keys are available and log warning if not
if (!API_KEY) {
  console.error('⚠️ GEMINI_API_KEY not found in environment variables!');
  console.error('Please add GEMINI_API_KEY to your .env.local file');
}

if (!OPENAI_API_KEY) {
  console.warn('⚠️ OPENAI_API_KEY not found - will not be able to use fallback AI');
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Parse a syllabus PDF and extract text content
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text content
 */
async function parseSyllabusPDF(fileBuffer) {
  try {
    console.log('Starting PDF parsing process');
    console.log(`Input PDF buffer size: ${fileBuffer.length} bytes`);
    
    // Use our pdf-lib implementation to extract text
    // This is more reliable than our previous methods
    console.log('Parsing PDF using pdf-lib extraction');
    const text = await extractTextFromBuffer(fileBuffer);
    
    if (text && text.trim().length > 0) {
      // Log a preview of the extracted text for debugging
      const textPreview = text.substring(0, 500) + (text.length > 500 ? '...' : '');
      console.log('PDF text extraction successful. Preview:');
      console.log('-----BEGIN TEXT PREVIEW-----');
      console.log(textPreview);
      console.log('-----END TEXT PREVIEW-----');
      console.log(`Total text length: ${text.length} characters`);
      
      // Count actual words to verify content quality
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      console.log(`Word count: ${wordCount} words`);
      
      return text;
    } else {
      throw new Error('No text content extracted from PDF. The PDF might be image-based or text extraction failed.');
    }
  } catch (error) {
    console.error('Error parsing PDF:', error);
    
    // Check if the error is the specific ENOENT error we're trying to avoid
    if (error.message && (error.message.includes('ENOENT') || error.message.includes('no such file or directory'))) {
      console.error("PDF parsing still resulted in a file system error (ENOENT). This likely means pdf-parse (or its dependency pdf.js) is trying to access local files despite being given a buffer. This could be due to its internal handling of standard fonts, worker scripts, or other assets if not properly isolated in the server environment.");
      throw new Error('Server configuration issue with PDF parser: an attempt was made to access a non-existent local file. This is not an issue with your PDF. Please contact support.');
    }
    
    // For other errors, rethrow a more generic message or the original error.
    throw new Error(`Failed to parse PDF syllabus: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Configure and get a Gemini model with appropriate settings
 * @returns {Promise<GenerativeModel>} Configured Gemini model
 */
async function getGeminiModel() {
  // Initialize the model with safety settings
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Using flash model which has higher quota limits
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ]
  });
  
  return model;
}

/**
 * Fallback method to generate class info when Gemini API is unavailable
 * @param {string} syllabusText - Text content from the syllabus
 * @returns {Object} Basic class information
 */
function generateBasicClassInfo(syllabusText) {
  console.log("Using local fallback for class extraction");
  
  // Extract potential class name (first capitalized phrase or something that looks like a course code)
  let className = "New Class";
  const courseCodeMatch = syllabusText.match(/([A-Z]{2,4}\s?\d{3}[A-Z]?|[A-Z][a-z]+\s+[A-Z][a-z]+\s+(?:to|for|in|\&)\s+[A-Z][a-z]+)/);
  if (courseCodeMatch) {
    className = courseCodeMatch[0].trim();
  }
  
  // Generate some generic topics based on common words in the text
  const words = syllabusText.match(/\b[A-Za-z]{4,}\b/g) || [];
  const wordFreq = {};
  for (const word of words) {
    const lcWord = word.toLowerCase();
    if (!wordFreq[lcWord]) wordFreq[lcWord] = 0;
    wordFreq[lcWord]++;
  }
  
  // Filter out common words
  const commonWords = ['this', 'that', 'there', 'these', 'those', 'class', 'course', 'syllabus', 'assignment', 'student', 'professor'];
  const sortedWords = Object.entries(wordFreq)
    .filter(([word]) => !commonWords.includes(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(entry => entry[0]);
  
  // Generate 5 topics using the most frequent words
  const topics = [
    `Introduction to ${className}`,
    `${sortedWords[0] || 'Fundamental'} Concepts`,
    `${sortedWords[1] || 'Advanced'} Techniques`,
    `${sortedWords[2] || 'Practical'} Applications`,
    `${sortedWords[3] || 'Final'} Projects`
  ];
  
  // Generate generic assignments
  const assignments = [
    {
      name: "Midterm Assignment",
      dueDate: "Week 5",
      description: `Complete a comprehensive assignment covering the first half of the ${className} material.`
    },
    {
      name: "Group Project",
      dueDate: "Week 8",
      description: "Work in teams to apply course concepts to a real-world problem."
    },
    {
      name: "Final Paper",
      dueDate: "Week 10",
      description: "Write an in-depth paper analyzing key topics covered throughout the course."
    }
  ];
  
  return {
    className,
    description: `This course covers essential topics in ${className}. Students will learn theoretical foundations and practical applications.`,
    schedule: "To be announced",
    topics,
    assignments
  };
}

/**
 * Use Gemini AI to extract class information from syllabus text with fallback options
 * @param {string} syllabusText - Text content from the syllabus
 * @returns {Promise<Object>} - Extracted class information
 */
async function extractClassInfo(syllabusText) {
  try {
    // Try to get the Gemini model
    const model = await getGeminiModel();
    
    const prompt = `
      Extract the following information from this syllabus text and return it in JSON format:
      - className: The name of the course/class
      - description: A 2-3 sentence summary of the course
      - schedule: When the class meets (days and times)
      - topics: A list of 5-8 main topics covered in the course
      - assignments: Generate 3-5 potential assignments based on the syllabus content. For each assignment include name, dueDate (relative to start of course like "Week 3"), and a brief description
      
      Only return a valid JSON object with these fields, and nothing else. Make reasonable assumptions if specific information is missing.
      
      Syllabus text:
      ${syllabusText.substring(0, 4000)} // Reduced text size to stay within token limits
    `;

    console.log("Sending syllabus text to Gemini AI");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    // Log the raw response from Gemini for debugging
    console.log("Raw Gemini response (first 500 chars):", textResponse.substring(0, 500) + (textResponse.length > 500 ? '...' : ''));
    
    // Process the text response to extract valid JSON
    const jsonStr = textResponse.replace(/```json\s*|```\s*/g, '');
    try {
      const classInfo = JSON.parse(jsonStr);
      console.log("Successfully extracted class info with Gemini:", JSON.stringify(classInfo, null, 2));
      return classInfo;
    } catch (jsonError) {
      console.error("Error parsing JSON from Gemini response:", jsonError);
      console.log("Raw response:", textResponse.substring(0, 200) + "...");
      throw new Error("Failed to parse class information from AI response");
    }
  } catch (error) {
    console.error('Error extracting class info with Gemini:', error);
    
    // Check if this is a rate limit error
    if (error.message && (error.message.includes('429') || 
        error.message.includes('quota') || 
        error.message.includes('rate limit'))) {
      console.log("Gemini API rate limit reached, using fallback extraction");
      return generateBasicClassInfo(syllabusText);
    }
    
    // For other errors, also use the fallback
    console.log("Using fallback extraction due to error:", error.message);
    return generateBasicClassInfo(syllabusText);
  }
}

/**
 * Convert relative dates in assignments to actual dates
 * @param {Array} assignments - Assignments with relative dates
 * @returns {Array} - Assignments with actual dates in YYYY-MM-DD format
 */
function processAssignmentDates(assignments) {
  const currentDate = new Date();
  const weekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
  
  return assignments.map(assignment => {
    let dueDate = assignment.dueDate;
    let dueDateObj = new Date(currentDate.getTime());
    
    // Process relative dates
    if (dueDate.toLowerCase().includes('week')) {
      const weekMatch = dueDate.match(/week\s*(\d+)/i);
      if (weekMatch && weekMatch[1]) {
        const weeks = parseInt(weekMatch[1]);
        dueDateObj = new Date(currentDate.getTime() + (weeks * weekInMilliseconds));
      }
    } else if (dueDate.toLowerCase().includes('month')) {
      const monthMatch = dueDate.match(/month\s*(\d+)/i);
      if (monthMatch && monthMatch[1]) {
        const months = parseInt(monthMatch[1]);
        dueDateObj.setMonth(dueDateObj.getMonth() + months);
      }
    }
    
    // Format date as YYYY-MM-DD
    const formattedDate = dueDateObj.toISOString().split('T')[0];
    
    return {
      ...assignment,
      dueDate: formattedDate
    };
  });
}

/**
 * Create a class from syllabus PDF content
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {Promise<Object>} - Created class details
 */
/**
 * Store a class in localStorage for persistence
 * @param {Object} classData - The class data to store
 */
function storeClassInLocalStorage(classData) {
  // This function will run on the client side via the browser
  try {
    // Get existing classes or initialize empty array
    let existingClasses = [];
    if (typeof window !== 'undefined') {
      const storedClasses = localStorage.getItem('greedy_classes');
      if (storedClasses) {
        existingClasses = JSON.parse(storedClasses);
      }
      
      // Add the new class
      existingClasses.push(classData);
      
      // Store back in localStorage
      localStorage.setItem('greedy_classes', JSON.stringify(existingClasses));
      console.log('Class stored in localStorage successfully');
      
      // Also store as most recent class for easy access
      localStorage.setItem('most_recent_class', JSON.stringify(classData));
    }
  } catch (error) {
    console.error('Error storing class in localStorage:', error);
  }
}

/**
 * Create a class from the syllabus PDF content
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {Promise<Object>} - Created class details
 */
async function createClassFromSyllabus(fileBuffer) {
  try {
    // Parse PDF to extract text
    const syllabusText = await parseSyllabusPDF(fileBuffer);
    
    // Extract class information using Gemini
    const classInfo = await extractClassInfo(syllabusText);
    
    // Process assignments to convert relative dates to actual dates
    const processedAssignments = processAssignmentDates(classInfo.assignments || []);
    
    // Prepare the class data
    const classData = {
      name: classInfo.className,
      description: classInfo.description,
      schedule: classInfo.schedule,
      color: getRandomColor(),
      topics: classInfo.topics,
      assignments: processedAssignments,
      createdAt: new Date().toISOString()
    };
    
    console.log('Creating class with the following details:', JSON.stringify(classData, null, 2));
    
    // Create the class in our database
    const newClass = createClass(classData);
    
    // The class storage in localStorage will happen on the client side
    // after the response is returned
    
    return {
      success: true,
      class: newClass,
      assignments: processedAssignments,
      storeLocally: true // Flag for the client to store in localStorage
    };
  } catch (error) {
    console.error('Error creating class from syllabus:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export {
  parseSyllabusPDF,
  extractClassInfo,
  createClassFromSyllabus
};
