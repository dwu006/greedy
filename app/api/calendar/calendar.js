/**
 * Calendar API for Greedy application
 * This handles converting assignments to calendar events and toggling view modes
 */

// Process assignments into calendar events grouped by date
export function processAssignmentsToEvents(assignments = []) {
  // Map to store events by date string (YYYY-MM-DD)
  const eventsByDate = new Map();
  
  // Process each assignment
  assignments.forEach(assignment => {
    if (!assignment.assignmentData) return;
    
    // Get the start and end dates from assignment
    const { startDate, endDate, name, description } = assignment.assignmentData;
    
    // Skip if no valid dates
    if (!startDate) return;
    
    // Parse the start date
    let start = parseDate(startDate);
    if (!start) return;
    
    // Parse the end date (if available)
    let end = endDate ? parseDate(endDate) : null;
    
    // If only start date is available, make it a single-day event
    if (!end) end = new Date(start);
    
    // For multi-day events, create an event for each day in the range
    const currentDate = new Date(start);
    
    // Loop through each day from start to end
    while (currentDate <= end) {
      const dateStr = formatDateToYYYYMMDD(currentDate);
      
      // Initialize array for this date if it doesn't exist
      if (!eventsByDate.has(dateStr)) {
        eventsByDate.set(dateStr, []);
      }
      
      // Add the event to this date
      eventsByDate.get(dateStr).push({
        id: assignment.id,
        title: name,
        description: description || '',
        position: assignment.position,
        isStart: isSameDay(currentDate, start),
        isEnd: isSameDay(currentDate, end),
        originalAssignment: assignment,
        files: assignment.assignmentData.files || [],
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });
  
  return eventsByDate;
}

// Helper to parse dates in various formats
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Handle different date formats
  // 1. Try native Date parsing (works for ISO strings and many formats)
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  
  // 2. Try MM/DD/YYYY format
  const mmddyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const mmddyyyyMatch = dateStr.match(mmddyyyyPattern);
  if (mmddyyyyMatch) {
    const [_, month, day, year] = mmddyyyyMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // 3. Try Month Day format ("May 15")
  const monthDayPattern = /^([A-Za-z]+)\s+(\d{1,2})$/;
  const monthDayMatch = dateStr.match(monthDayPattern);
  if (monthDayMatch) {
    const [_, month, day] = monthDayMatch;
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, 
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const monthIndex = months[month.toLowerCase().substring(0, 3)];
    if (monthIndex !== undefined) {
      // Use current year if not specified
      const currentYear = new Date().getFullYear();
      return new Date(currentYear, monthIndex, parseInt(day));
    }
  }
  
  // Return null if we couldn't parse the date
  return null;
}

// Format date to YYYY-MM-DD string
function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Check if two dates are the same day
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

export function formatMonthYear(date) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Format date for display
export function formatDateForDisplay(date) {
  if (!date) return '';
  
  // If it's already a string, just return it
  if (typeof date === 'string') return date;
  
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// This function handles the API route for toggling between calendar and assignment box views
export async function handleCalendarToggle(req, res) {
  try {
    const { assignments, isCalendarView } = req.body;
    
    if (isCalendarView) {
      // Convert assignments to calendar events
      const events = processAssignmentsToEvents(assignments);
      return res.status(200).json({ success: true, events });
    } else {
      // Return assignments as-is for box view
      return res.status(200).json({ success: true, assignments });
    }
  } catch (error) {
    console.error('Error in calendar toggle API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Handle POST request for calendar API
export async function POST(req) {
  try {
    const data = await req.json();
    const { assignments } = data;
    
    // Process assignments into calendar events
    const events = processAssignmentsToEvents(assignments);
    
    return new Response(JSON.stringify({ success: true, events }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error processing calendar data:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// Handle GET request for calendar API
export async function GET() {
  return new Response(JSON.stringify({ status: "Calendar API is running" }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}
