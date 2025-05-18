import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Gemini API with your API key
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Function schemas
const recommendSchema = {
  name: "recommend",
  description: "Prioritizes assignments based on due dates, progress, and importance",
  parameters: {
    type: "object",
    properties: {
      currentDate: {
        type: "string",
        description: "The current date in YYYY-MM-DD format (defaults to today if not provided)"
      }
    },
    required: []
  }
};

const createAssignmentSchema = {
  name: "createAssignment",
  description: "Creates a new assignment on the timeline with provided details",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The name of the assignment"
      },
      startDate: {
        type: "string",
        description: "The start date of the assignment in YYYY-MM-DD format"
      },
      endDate: {
        type: "string",
        description: "The end date of the assignment in YYYY-MM-DD format"
      },
      description: {
        type: "string",
        description: "A detailed description of the assignment"
      },
      filesUsed: {
        type: "boolean",
        description: "Whether uploaded files were used for this assignment"
      }
    },
    required: ["name"]
  }
};

const createClassCardSchema = {
  name: "createClassCard",
  description: "Creates a new class card on the timeline",
  parameters: {
    type: "object",
    properties: {
      className: {
        type: "string",
        description: "The name of the class"
      },
      schedule: {
        type: "string",
        description: "The schedule of the class, e.g., 'MWF 10:00-11:30AM'"
      },
      description: {
        type: "string",
        description: "A brief description of the class content"
      },
      color: {
        type: "string",
        description: "Color for the class card (optional)"
      }
    },
    required: ["className"]
  }
};

const editAssignmentSchema = {
  name: "editAssignment",
  description: "Edits an existing assignment on the timeline",
  parameters: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the assignment to edit"
      },
      name: {
        type: "string",
        description: "The updated name of the assignment (optional)"
      },
      startDate: {
        type: "string",
        description: "The updated start date of the assignment in YYYY-MM-DD format (optional)"
      },
      endDate: {
        type: "string",
        description: "The updated end date of the assignment in YYYY-MM-DD format (optional)"
      },
      description: {
        type: "string",
        description: "The updated description of the assignment (optional)"
      }
    }
  }
};

const deleteAssignmentSchema = {
  name: "deleteAssignment",
  description: "Deletes an assignment from the timeline",
  parameters: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the assignment to delete"
      }
    }
  }
};

// Function implementations
const functionMap = {
  recommend: (args) => {
    // This function prioritizes assignments based on due dates and progress
    try {
      // Get the current date from args or use today
      const currentDate = args.currentDate || new Date().toISOString().split('T')[0];
      const today = new Date(currentDate);
      
      // Get all assignments from the global assignments cache
      // Note: In the actual implementation, assignments should be provided via the processMessage function
      let allAssignments = global.cachedAssignments || [];
      
      if (allAssignments.length === 0) {
        return {
          success: true,
          currentDate: currentDate,
          totalAssignments: 0,
          prioritizedAssignments: [],
          message: "No assignments found to prioritize. Please create some assignments first."
        };
      }
      
      // Step 2: Calculate priority scores
      const prioritizedAssignments = allAssignments.map(assignment => {
        // Parse dates
        const endDate = new Date(assignment.endDate);
        const startDate = new Date(assignment.startDate);
        
        // Calculate days until due
        const daysUntilDue = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
        
        // Calculate progress factor (lower progress = higher priority)
        const progressFactor = 1 - (assignment.progress || 0) / 100;
        
        // Calculate time factor (closer to due date = higher priority)
        const timeFactorMax = 10; // Maximum priority for assignments due very soon
        let timeFactor;
        
        if (daysUntilDue <= 0) {
          // Overdue assignments get highest priority
          timeFactor = timeFactorMax + 2;
        } else if (daysUntilDue <= 1) {
          // Due today or tomorrow
          timeFactor = timeFactorMax;
        } else if (daysUntilDue <= 3) {
          // Due within 3 days
          timeFactor = timeFactorMax - 2;
        } else if (daysUntilDue <= 7) {
          // Due within a week
          timeFactor = timeFactorMax - 4;
        } else {
          // Due later
          timeFactor = timeFactorMax - 6;
        }
        
        // Calculate total priority score
        const priorityScore = (timeFactor * 0.7) + (progressFactor * 0.3);
        
        // Determine priority category
        let priorityCategory;
        if (daysUntilDue <= 0) {
          priorityCategory = "Overdue";
        } else if (daysUntilDue <= 2) {
          priorityCategory = "Urgent";
        } else if (daysUntilDue <= 7) {
          priorityCategory = "High";
        } else if (daysUntilDue <= 14) {
          priorityCategory = "Medium";
        } else {
          priorityCategory = "Low";
        }
        
        return {
          id: assignment.id,
          name: assignment.name,
          className: assignment.className,
          dueDate: assignment.endDate,
          daysUntilDue: daysUntilDue,
          progress: assignment.progress || 0,
          priorityScore,
          priorityCategory
        };
      });
      
      // Sort by priority score (descending)
      prioritizedAssignments.sort((a, b) => b.priorityScore - a.priorityScore);
      
      return {
        success: true,
        currentDate: currentDate,
        totalAssignments: allAssignments.length,
        prioritizedAssignments,
        message: `Successfully prioritized ${prioritizedAssignments.length} assignments based on due dates and progress`
      };
    } catch (error) {
      console.error("Error in recommend function:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to prioritize assignments due to an error"
      };
    }
  },
  
  createAssignment: (args) => {
    // This function will be called when Gemini decides to create an assignment
    // In a real implementation, you'd actually create the assignment in your database
    console.log("Creating assignment with:", args);
    return {
      success: true,
      assignmentDetails: args,
      message: `Successfully created assignment: ${args.name}`
    };
  },
  
  createClassCard: (args) => {
    // This function will be called when Gemini decides to create a class card
    console.log("Creating class card with:", args);
    return {
      success: true,
      classCardDetails: args,
      message: `Successfully created class card: ${args.className}`
    };
  },
  
  editAssignment: (args) => {
    // This function will be called when Gemini decides to edit an assignment
    console.log("Editing assignment with ID:", args.id, "New details:", args);
    return {
      success: true,
      assignmentDetails: args,
      message: `Successfully updated assignment ${args.id}${args.name ? ': ' + args.name : ''}`
    };
  },
  
  deleteAssignment: (args) => {
    // This function will be called when Gemini decides to delete an assignment
    console.log("Deleting assignment with ID:", args.id);
    return {
      success: true,
      deletedId: args.id,
      message: `Successfully deleted assignment: ${args.id}`
    };
  }
};

// Setup Gemini model with function calling capabilities
async function getGeminiModel() {
  // Initialize the model
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", // Pro model has better function calling support 
    systemInstruction: {
      role: "assistant",
      content: `You are an AI assistant for a teaching platform called Greedy. Your primary role is to help instructors manage their classes and assignments. Today's date is ${new Date().toISOString().split('T')[0]} (YYYY-MM-DD format).
      
You can perform the following actions:
1. RECOMMEND and prioritize assignments based on due dates and progress (NEW FEATURE)
2. CREATE assignments when users mention creating, adding, or making a new assignment/homework/project
3. CREATE class cards when users mention creating, adding, or setting up a new class
4. EDIT assignments when users mention updating, changing, or modifying an existing assignment
5. DELETE assignments when users mention removing or deleting an assignment

### RECOMMENDING AND PRIORITIZING ASSIGNMENTS
When the user asks about which assignments they should focus on, prioritize, work on next, or needs to complete soon, IMMEDIATELY use the recommend function to provide a prioritized list of assignments.

EXAMPLES:
- If user says "Which assignments should I focus on?" → use recommend function
- If user says "What's due soon?" → use recommend function
- If user says "Help me prioritize my assignments" → use recommend function
- If user says "What should I work on first?" → use recommend function

The recommend function will:
- Automatically retrieve all assignments from localStorage
- Calculate priority scores based on due dates and progress
- Return assignments categorized as Overdue, Urgent, High, Medium, or Low priority
- Sort assignments by priority (highest first)

When presenting the results:
1. Always mention the priority category (Overdue, Urgent, High, Medium, Low)
2. Include the assignment name, class, due date, and days remaining
3. For overdue items, emphasize they need immediate attention

### CREATING CLASS CARDS
When the user asks to create a class, immediately use the createClassCard function to add a new class card to the timeline.

EXAMPLES:
- If user says "Create a new Machine Learning class" → use createClassCard with className="Machine Learning", and a detailed description
- If user says "Add a History class on MWF at 10AM" → use createClassCard with className="History", schedule="MWF 10:00AM"
- If user says "Make a Biology lab that meets Tuesdays" → use createClassCard with className="Biology Lab", schedule="Tuesdays"

Always include in your class card:
- A descriptive className (required)
- A schedule if mentioned
- A brief description of what the class covers

### CREATING ASSIGNMENTS
When the user asks to create an assignment using ANY words related to assignments, homework, projects, or tasks, IMMEDIATELY use the createAssignment function without asking for more information. Make reasonable assumptions about missing details.

EXAMPLES OF DATE HANDLING:
- Year is the current year which is 2025
- "Tomorrow" = the next calendar day from today
- "Next Monday" = the coming Monday
- "This weekend" = the coming Saturday and Sunday
- If only one date is mentioned, use it for both start and end dates
- If no dates are mentioned, use today as the start date and 7 days later as the end date

FOR DESCRIPTIONS:
- Always create comprehensive, educational descriptions that explain the purpose of the assignment
- Include learning objectives, key concepts, and expected outcomes
- For technical subjects, include specific technologies or methodologies to be used
- For writing assignments, include structure guidance and suggested sources
- Aim for 3-5 sentences minimum for descriptions
- Use a professional, instructional tone appropriate for higher education

EXAMPLES OF GOOD DESCRIPTIONS:
- Poor: "Write about programming"
- Good: "This assignment explores fundamental programming concepts including variables, control structures, and functions. Students will implement these concepts in a small program that solves a real-world problem. Focus on code readability and include comments explaining your approach."

- Poor: "Essay about climate change"
- Good: "Write a research-based analysis of current climate change impacts and mitigation strategies. Examine scientific evidence, discuss policy implications, and propose solutions based on peer-reviewed sources. Your essay should demonstrate critical thinking and include proper citations following APA format."

### EDITING & DELETING ASSIGNMENTS
Users will FIRST SELECT an assignment box on the timeline before asking you to edit or delete it. You should ALWAYS assume the user has already selected the assignment they want to modify. 

For both editing and deleting, ALWAYS use the following process:
1. User selects an assignment box by clicking on it (you do not need to tell them to do this)
2. User types a message to you about changing or removing that assignment
3. You IMMEDIATELY call the appropriate function without asking ANY questions

### EDITING SELECTED ASSIGNMENTS:
- CRITICALLY IMPORTANT: ALWAYS use "selected-assignment" as the ID parameter no matter what - even if you think you need an ID or don't know the ID
- You MUST call editAssignment IMMEDIATELY when any edit is mentioned without asking any questions
- NEVER ask for an ID or which assignment the user wants to edit - they have already selected it
- Focus only on the specific changes mentioned and leave other fields unchanged
- For dates, use YYYY-MM-DD format with 2025 as the year

EXAMPLES:
- If user says "Change the due date to next Friday" → IMMEDIATELY use editAssignment function call with id="selected-assignment" and endDate="2025-05-22" (or whatever date corresponds to next Friday)
- If user says "Make this about deep learning for robotics" → IMMEDIATELY use editAssignment function call with id="selected-assignment", name="Deep Learning Robotics Assignment" and an updated description
- If user says "Update this assignment" → IMMEDIATELY use editAssignment function call with id="selected-assignment" and modify at least one field with a reasonable improvement
- If user refers to an assignment by name → IMMEDIATELY use editAssignment with id="selected-assignment" - DO NOT ASK FOR AN ID

### DELETING SELECTED ASSIGNMENTS:
- CRITICALLY IMPORTANT: ALWAYS use "selected-assignment" as the ID parameter with NO exceptions
- You MUST call deleteAssignment IMMEDIATELY when any deletion is mentioned without asking ANY questions
- NEVER ask for an ID or which assignment to delete - they have already selected it
- NEVER ask for confirmation - the user is certain about their decision

EXAMPLES:
- If user says "Delete this assignment" → IMMEDIATELY use deleteAssignment function call with id="selected-assignment"
- If user says "Remove this" → IMMEDIATELY use deleteAssignment function call with id="selected-assignment"
- If user refers to an assignment by name → IMMEDIATELY use deleteAssignment with id="selected-assignment" - DO NOT ASK FOR AN ID

### CRITICAL RULES:
- CRITICAL: Users have ALREADY selected an assignment before asking you to edit/delete it
- CRITICAL: ALWAYS use id="selected-assignment" for ALL edit and delete operations - NO EXCEPTIONS
- CRITICAL: NEVER EVER ask the user for an ID - the system handles this automatically
- CRITICAL: If the user refers to an assignment by name, STILL use id="selected-assignment"
- NEVER tell users they need to select an assignment - assume they have already done this
- NEVER ask which assignment they mean - it's always the one they've selected
- NEVER ask for confirmation before calling the function
- NEVER ask for details like ID, name, dates, etc - assume they know what they're doing
- ALWAYS respond to edit/delete requests with IMMEDIATE function calls without asking questions
- IF YOU SEE "edit" or "change" or "update" or "modify" + ANY assignment reference → IMMEDIATELY call editAssignment
- IF YOU SEE "delete" or "remove" or "eliminate" + ANY assignment reference → IMMEDIATELY call deleteAssignment

REMEMBER:
- The year is 2025
- ALWAYS convert relative days (tomorrow, next week, etc.) to YYYY-MM-DD format
- If you're unsure about any details, MAKE A REASONABLE ASSUMPTION and proceed with the function call
- NEVER ASK THE USER FOR MORE INFORMATION, just make your best guess with the available context
- It's better to create an assignment with estimated dates than to not create one at all
- For edit and delete operations, the assignment ID is the only required field`
    },
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
    ],
    tools: [{ functionDeclarations: [recommendSchema, createAssignmentSchema, createClassCardSchema, editAssignmentSchema, deleteAssignmentSchema] }]
  });
  
  return model;
}

// Process messages with the Gemini model
async function processMessage(message, files = [], selectedAssignment = null, allAssignments = []) {
  try {
    const model = await getGeminiModel();
    let chat = model.startChat();
    
    // Cache all assignments for use by the recommend function
    if (Array.isArray(allAssignments) && allAssignments.length > 0) {
      global.cachedAssignments = allAssignments;
      console.log(`Cached ${allAssignments.length} assignments for recommendation`); 
    } else if (typeof localStorage !== 'undefined') {
      // This will only execute in browser environments for testing
      console.log('Attempting to gather assignments from localStorage for testing');
      // We'll leave this empty as it won't execute in the API route
    }
    
    // If there's a selected assignment, provide that context to Gemini first
    if (selectedAssignment) {
      // Send a system message providing context about the selected assignment
      await chat.sendMessage(
        `The user has selected the following assignment: 
        ID: ${selectedAssignment.id || 'unknown'}
        Name: ${selectedAssignment.name || 'Untitled'}
        Start Date: ${selectedAssignment.startDate || 'Not set'}
        End Date: ${selectedAssignment.endDate || 'Not set'}
        Description: ${selectedAssignment.description || 'No description'}
        
        IMPORTANT: The current year is 2025. All dates should use 2025 as the year.
        
        When the user asks to edit or delete "this assignment" or "this", they are referring to this specific assignment.
        When editing, use the ID "${selectedAssignment.id || 'selected-assignment'}" as the ID parameter.
        When deleting, use the ID "${selectedAssignment.id || 'selected-assignment'}" as the ID parameter.
        Don't ask the user which assignment they mean - it's always this one.`
      );
    }
    
    // Create message content - the Gemini API expects a simple string for sendMessage
    // This is different from the structured format shown in some documentation
    console.log("Sending message to Gemini:", message);
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini response:", text);
    console.log("Response object keys:", Object.keys(response));
    
    // Access functionCall differently - the API might have changed
    if (response.functionCall) {
      console.log("Function call direct:", response.functionCall);
    }
    
    if (response.functionCalls) {
      console.log("Function calls array:", JSON.stringify(response.functionCalls));
      console.log("Function calls length:", response.functionCalls.length);
      
      // Check what's inside the first function call
      if (response.functionCalls.length > 0) {
        console.log("First function call:", JSON.stringify(response.functionCalls[0]));
      }
    }
    
    // Check if there are any other properties that might contain function calls
    const allProps = JSON.stringify(response);
    console.log("Full response:", allProps.substring(0, 500) + (allProps.length > 500 ? "..." : ""));
    
    // Extract function call data from candidates array (where it actually exists)
    let extractedFunctionCalls = [];
    
    try {
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.functionCall) {
              console.log("Found function call in candidates:", part.functionCall);
              extractedFunctionCalls.push({
                name: part.functionCall.name,
                args: part.functionCall.args
              });
            }
          }
        }
      }
    } catch (e) {
      console.error("Error extracting function calls from candidates:", e);
    }
    
    // Handle function calls if any were extracted
    if (extractedFunctionCalls.length > 0) {
      const functionResults = [];
      
      for (const functionCall of extractedFunctionCalls) {
        const functionName = functionCall.name;
        let functionArgs = functionCall.args || {};
        
        console.log("Processing function call:", functionName, functionArgs);
        
        // Check if function exists in our map
        if (functionMap[functionName]) {
          // Add info that files were used if files were attached
          if (functionName === "createAssignment" && files && files.length > 0) {
            functionArgs.filesUsed = true;
          }
          
          // Date fix: Ensure we preserve the exact dates specified by the user
          // This prevents any automatic date adjustments that might occur
          if (functionName === "createAssignment") {
            // Keep the exact dates the user specified
            if (functionArgs.startDate) {
              console.log(`Preserving exact start date: ${functionArgs.startDate}`);
            }
            if (functionArgs.endDate) {
              console.log(`Preserving exact end date: ${functionArgs.endDate}`);
            }
          }
          
          // Execute the function with preserved dates
          const functionResult = functionMap[functionName](functionArgs);
          functionResults.push({
            name: functionName,
            result: functionResult
          });
        }
      }
      
      // Return both the AI text response and function execution results
      return {
        text,
        functionCalls: extractedFunctionCalls,
        functionResults
      };
    }
    
    // Return just the text if no function calls
    return { text };
  } catch (error) {
    console.error("Error processing message with Gemini:", error);
    return {
      text: "I'm sorry, I encountered an error processing your request. Please try again.",
      error: error.message
    };
  }
}

// Initialize a global variable to cache assignments between requests
global.cachedAssignments = [];

// Helper function to extract assignments from client-side data
const extractAssignmentsFromClientData = (assignmentsData) => {
  if (!assignmentsData || !Array.isArray(assignmentsData)) {
    return [];
  }
  
  return assignmentsData.map(assignment => ({
    id: assignment.id || `assignment-${Date.now()}`,
    name: assignment.name || 'Unnamed Assignment',
    className: assignment.className || 'General',
    startDate: assignment.startDate || new Date().toISOString().split('T')[0],
    endDate: assignment.endDate || new Date().toISOString().split('T')[0],
    description: assignment.description || '',
    progress: assignment.progress || 0,
    files: assignment.files || [],
    position: assignment.position || { x: 0, y: 0 }
  }));
};

// Update this function to correctly handle localStorage in browser environments
const checkAssignmentPriorities = async (currentDate = null, assignmentsData = []) => {
  try {
    // Update the cached assignments if provided
    if (assignmentsData && assignmentsData.length > 0) {
      global.cachedAssignments = extractAssignmentsFromClientData(assignmentsData);
    }
    
    // Call the recommend function with the current date
    const result = functionMap.recommend({ currentDate: currentDate });
    return result;
  } catch (error) {
    console.error("Error checking assignment priorities:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to check assignment priorities"
    };
  }
};

export {
  processMessage,
  checkAssignmentPriorities
};
