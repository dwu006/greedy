// Class API functions for interacting with classes

// Sample data - in a real app, this would connect to a database
const classes = [
  {
    id: "class-1",
    name: "Introduction to AI",
    slug: "introduction-to-ai",
    description: "An introduction to artificial intelligence and its applications in modern technology.",
    schedule: "MWF 10:00-11:30AM",
    color: "blue",
    createdAt: "2025-05-01"
  },
  {
    id: "class-2",
    name: "Web Development",
    slug: "web-development",
    description: "Learn full-stack web development from scratch with modern frameworks.",
    schedule: "TR 1:00-2:30PM",
    color: "green",
    createdAt: "2025-05-05"
  }
];

// Create a new class
function createClass(classData) {
  const newClass = {
    id: `class-${classes.length + 1}`,
    slug: classData.name.toLowerCase().replace(/\s+/g, '-'),
    createdAt: new Date().toISOString().split('T')[0],
    ...classData
  };
  
  classes.push(newClass);
  return newClass;
}

// Get all classes
function getAllClasses() {
  return [...classes];
}

// Get a class by ID
function getClassById(id) {
  return classes.find(cls => cls.id === id) || null;
}

// Get a class by slug
function getClassBySlug(slug) {
  return classes.find(cls => cls.slug === slug) || null;
}

// Update a class
function updateClass(id, updates) {
  const index = classes.findIndex(cls => cls.id === id);
  if (index === -1) return null;
  
  classes[index] = { ...classes[index], ...updates };
  return classes[index];
}

// Delete a class
function deleteClass(id) {
  const index = classes.findIndex(cls => cls.id === id);
  if (index === -1) return false;
  
  classes.splice(index, 1);
  return true;
}

export {
  createClass,
  getAllClasses,
  getClassById,
  getClassBySlug,
  updateClass,
  deleteClass
};
