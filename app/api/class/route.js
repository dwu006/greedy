import { NextResponse } from 'next/server';
import { createClass, getAllClasses } from './class';

// GET handler to fetch all classes
export async function GET() {
  try {
    const classes = getAllClasses();
    return NextResponse.json({ success: true, classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST handler to create a new class
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { success: false, error: 'Class name is required' },
        { status: 400 }
      );
    }
    
    // Create the class
    const newClass = createClass({
      name: data.name,
      description: data.description || `Course materials and assignments for ${data.name}`,
      schedule: data.schedule || 'TBD',
      color: data.color || getRandomColor()
    });
    
    return NextResponse.json({ success: true, class: newClass });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Helper function to get a random color for class cards
function getRandomColor() {
  const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'teal', 'forest', 'amber'];
  return colors[Math.floor(Math.random() * colors.length)];
}
