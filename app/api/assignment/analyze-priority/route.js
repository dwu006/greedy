/**
 * API route for analyzing PDF files to determine assignment priority
 */
import { NextResponse } from 'next/server';
import { analyzePdfForPriority } from '@/app/lib/assignmentPriority';

export async function POST(request) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check if file is a PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Analyze PDF content for priority
    const result = await analyzePdfForPriority(buffer);

    return NextResponse.json({
      success: true,
      priority: result.priority,
      reason: result.reason
    });
  } catch (error) {
    console.error('Error analyzing PDF for priority:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to analyze PDF: ${error.message || 'Unknown error'}`,
        priority: 'medium',
        reason: 'Error during analysis. Setting default priority.'
      },
      { status: 500 }
    );
  }
}
