import { processMessage } from './gemini';
import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({path: "../../.env"});

// Helper function to convert File object to base64
async function fileToBase64(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const message = formData.get('message');
    const files = formData.getAll('files');
    
    // Get the selected assignment data if present
    let selectedAssignment = null;
    const selectedAssignmentRaw = formData.get('selectedAssignment');
    if (selectedAssignmentRaw) {
      try {
        selectedAssignment = JSON.parse(selectedAssignmentRaw);
      } catch (error) {
        console.error('Error parsing selectedAssignment JSON:', error);
      }
    }
    
    // Get all assignments for recommendation
    let allAssignments = [];
    const allAssignmentsRaw = formData.get('allAssignments');
    if (allAssignmentsRaw) {
      try {
        allAssignments = JSON.parse(allAssignmentsRaw);
        console.log(`Received ${allAssignments.length} assignments from client for recommendation`);
      } catch (error) {
        console.error('Error parsing allAssignments JSON:', error);
      }
    }
    
    // Process files if present
    const processedFiles = [];
    
    if (files && files.length > 0) {
      for (const file of files) {
        if (file.size > 0) {
          const base64Data = await fileToBase64(file);
          const processedFile = {
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64Data
          };
          
          // For PDF files, keep the original file object too for analysis
          if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            // Store the original file for PDF processing
            processedFile.originalFile = file;
          }
          
          processedFiles.push(processedFile);
        }
      }
      console.log(`Processed ${processedFiles.length} files for Gemini API`);
    }
    
    // Process message with Gemini, passing the selected assignment and all assignments
    const response = await processMessage(message, processedFiles, selectedAssignment, allAssignments);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in Gemini API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request', message: error.message },
      { status: 500 }
    );
  }
}
