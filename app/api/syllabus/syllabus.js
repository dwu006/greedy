import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClass } from '../class/class';
import { getRandomColor } from '../../utils/helpers';

// Initialize the Gemini API with your API key (Next.js handles env loading)
const API_KEY = process.env.GEMINI_API_KEY;

// Verify API key is available and log warning if not
if (!API_KEY) {
  console.error('⚠️ GEMINI_API_KEY not found in environment variables!');
  console.error('Please add GEMINI_API_KEY to your .env.local file');
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
    // Dynamically import pdf-parse only when this function is called
    // This prevents it from being loaded during build time
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(fileBuffer);
    return pdfData.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF syllabus: ' + error.message);
  }
}

/**
 * Use Gemini AI to extract class information from syllabus text
 * @param {string} syllabusText - Text content from the syllabus
 * @returns {Promise<Object>} - Extracted class information
 */
async function extractClassInfo(syllabusText) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });
    
    const prompt = `
      Extract the following information from this syllabus text and return it in JSON format:
      - className: The name of the course/class
      - description: A 2-3 sentence summary of the course
      - schedule: When the class meets (days and times)
      - topics: A list of 5-8 main topics covered in the course
      - assignments: Generate 3-5 potential assignments based on the syllabus content. For each assignment include name, dueDate (relative to start of course like "Week 3"), and a brief description
      
      Only return a valid JSON object with these fields, and nothing else. Make reasonable assumptions if specific information is missing.
      
      Syllabus text:
      ${syllabusText.substring(0, 8000)} // Limit text size to avoid token limits
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    // Process the text response to extract valid JSON
    const jsonStr = textResponse.replace(/```json\s*|```\s*/g, '');
    const classInfo = JSON.parse(jsonStr);
    
    return classInfo;
  } catch (error) {
    console.error('Error extracting class info with Gemini:', error);
    throw new Error('Failed to extract class information from syllabus');
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
async function createClassFromSyllabus(fileBuffer) {
  try {
    // Parse PDF to extract text
    const syllabusText = await parseSyllabusPDF(fileBuffer);
    
    // Extract class information using Gemini
    const classInfo = await extractClassInfo(syllabusText);
    
    // Process assignments to convert relative dates to actual dates
    const processedAssignments = processAssignmentDates(classInfo.assignments || []);
    
    // Create the class in our database
    const newClass = createClass({
      name: classInfo.className,
      description: classInfo.description,
      schedule: classInfo.schedule,
      color: getRandomColor(),
      topics: classInfo.topics,
      assignments: processedAssignments
    });
    
    return {
      success: true,
      class: newClass,
      assignments: processedAssignments
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
