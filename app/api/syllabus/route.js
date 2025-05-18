import { NextResponse } from 'next/server';
import { createClassFromSyllabus } from './syllabus';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Handle POST requests to upload and process syllabus PDF
 */
export async function POST(request) {
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file');

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Log file details for debugging
    console.log('Processing PDF upload:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      bufferLength: buffer.length
    });

    // Process syllabus with Gemini AI
    const result = await createClassFromSyllabus(buffer);

    if (result.success) {
      return NextResponse.json({
        success: true,
        class: result.class,
        assignments: result.assignments,
        storeLocally: true,
        message: `Successfully created class: ${result.class.name}`
      });
    } else {
      console.error('Syllabus creation failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to create class from syllabus'
      }, { status: 500 });
    }
  } catch (error) {
    // Provide detailed error information for debugging
    console.error('Error processing syllabus:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Return a user-friendly error message
    return NextResponse.json(
      { 
        success: false, 
        error: error.code === 'ENOENT' 
          ? 'PDF parsing error: The system could not access a required file. This is an internal server error, not an issue with your PDF.'
          : `PDF processing error: ${error.message || 'Unknown error'}`,
        // Include technical details in development environment only
        details: process.env.NODE_ENV === 'development' ? {
          name: error.name,
          code: error.code,
          stack: error.stack
        } : undefined
      },
      { status: 500 }
    );
  }
}
