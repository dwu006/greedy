import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Gemini API with your API key
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Function schemas
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
1. CREATE assignments when users mention creating, adding, or making a new assignment/homework/project
2. CREATE class cards when users mention creating, adding, or setting up a new class
3. EDIT assignments when users mention updating, changing, or modifying an existing assignment
4. DELETE assignments when users mention removing or deleting an assignment

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
- Always use "selected-assignment" as the ID
- Focus only on what changes they want to make
- Create detailed descriptions when updating content

EXAMPLES:
- If user says "Change the due date to next Friday" → IMMEDIATELY use editAssignment with id="selected-assignment" and endDate="YYYY-MM-DD" for next Friday
- If user says "Make this about deep learning for robotics" → IMMEDIATELY use editAssignment with id="selected-assignment", name="Deep Learning Robotics Assignment" and an updated description

### DELETING SELECTED ASSIGNMENTS:
- Always use "selected-assignment" as the ID
- Never ask for confirmation or which assignment they mean

EXAMPLES:
- If user says "Delete this assignment" → IMMEDIATELY use deleteAssignment with id="selected-assignment"
- If user says "Remove this" → IMMEDIATELY use deleteAssignment with id="selected-assignment"

### CRITICAL RULES:
- Users must select an assignment box BEFORE asking to edit/delete (this happens outside of your view)
- NEVER tell users they need to select an assignment - assume they have already done this
- NEVER ask which assignment they mean - it's always the one they've selected
- NEVER ask for confirmation before calling the function
- NEVER ask for details like ID, name, dates, etc - assume they know what they're doing
- ALWAYS respond to edit/delete requests with IMMEDIATE function calls

REMEMBER:
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
    tools: [{ functionDeclarations: [createAssignmentSchema, createClassCardSchema, editAssignmentSchema, deleteAssignmentSchema] }]
  });
  
  return model;
}

// Process messages with the Gemini model
async function processMessage(message, files = []) {
  try {
    const model = await getGeminiModel();
    let chat = model.startChat();
    
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

export {
  processMessage
};
