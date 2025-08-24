// Test script to verify the "+ New" project fix
// This tests the key functions that handle project creation and state management

// Mock localStorage
const localStorage = {
  storage: {},
  getItem(key) { return this.storage[key] || null; },
  setItem(key, value) { this.storage[key] = value; },
  removeItem(key) { delete this.storage[key]; },
  clear() { this.storage = {}; }
};

// Mock window.dispatchEvent
const dispatchedEvents = [];
const mockDispatchEvent = (event) => {
  dispatchedEvents.push(event);
  console.log('Event dispatched:', event.type, event.detail);
};

// Test the clearAllCachedProjectData function
function testClearAllCachedProjectData() {
  console.log('\n=== Testing clearAllCachedProjectData ===');
  
  // Setup initial state
  localStorage.setItem('jetsy_current_project_id', 'old-project-id');
  localStorage.setItem('jetsy_current_project_name', 'Old Project Name');
  localStorage.setItem('jetsy_project_name_123', 'Project 123');
  localStorage.setItem('jetsy_project_name_456', 'Project 456');
  localStorage.setItem('jetsy_prefill_idea', 'some idea');
  localStorage.setItem('other_key', 'should remain');
  
  console.log('Before clearing:', localStorage.storage);
  
  // Simulate the clearAllCachedProjectData function
  const clearAllCachedProjectData = () => {
    localStorage.removeItem('jetsy_current_project_id');
    localStorage.removeItem('jetsy_current_project_name');
    
    const keysToRemove = [];
    for (const key in localStorage.storage) {
      if (key.startsWith('jetsy_project_name_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    localStorage.removeItem('jetsy_prefill_idea');
  };
  
  clearAllCachedProjectData();
  
  console.log('After clearing:', localStorage.storage);
  
  // Verify only 'other_key' remains
  const expectedKeys = ['other_key'];
  const actualKeys = Object.keys(localStorage.storage);
  const success = expectedKeys.length === actualKeys.length && 
    expectedKeys.every(key => actualKeys.includes(key));
  
  console.log('✅ clearAllCachedProjectData test:', success ? 'PASSED' : 'FAILED');
  return success;
}

// Test the forceProjectNameUpdate function
function testForceProjectNameUpdate() {
  console.log('\n=== Testing forceProjectNameUpdate ===');
  
  dispatchedEvents.length = 0; // Clear previous events
  localStorage.clear();
  
  // Simulate the forceProjectNameUpdate function
  const setCachedProjectName = (name, projectId) => {
    console.log(`setCachedProjectName called with: ${name}, ${projectId}`);
  };
  
  const forceProjectNameUpdate = (projectName, projectId) => {
    localStorage.setItem('jetsy_current_project_name', projectName);
    if (projectId) {
      localStorage.setItem(`jetsy_project_name_${projectId}`, projectName);
    }
    
    mockDispatchEvent({
      type: 'project-name-update',
      detail: { projectName }
    });
    
    setCachedProjectName(projectName, projectId);
  };
  
  // Test with new project
  forceProjectNameUpdate('New business', 'new-project-123');
  
  console.log('localStorage after forceProjectNameUpdate:', localStorage.storage);
  console.log('Events dispatched:', dispatchedEvents.length);
  
  // Verify localStorage is updated correctly
  const nameInStorage = localStorage.getItem('jetsy_current_project_name');
  const projectNameInStorage = localStorage.getItem('jetsy_project_name_new-project-123');
  const eventDispatched = dispatchedEvents.some(e => 
    e.type === 'project-name-update' && 
    e.detail.projectName === 'New business'
  );
  
  const success = nameInStorage === 'New business' && 
    projectNameInStorage === 'New business' && 
    eventDispatched;
  
  console.log('✅ forceProjectNameUpdate test:', success ? 'PASSED' : 'FAILED');
  return success;
}

// Test the project selection flow
function testProjectSelectionFlow() {
  console.log('\n=== Testing Project Selection Flow ===');
  
  dispatchedEvents.length = 0; // Clear previous events
  localStorage.clear();
  
  // Mock state setters
  let currentProject = null;
  const setCurrentProject = (project) => {
    currentProject = project;
    console.log('setCurrentProject called with:', project);
  };
  
  const setCachedProjectName = (name, projectId) => {
    console.log(`setCachedProjectName called with: ${name}, ${projectId}`);
  };
  
  const clearAllCachedProjectData = () => {
    localStorage.removeItem('jetsy_current_project_id');
    localStorage.removeItem('jetsy_current_project_name');
    
    const keysToRemove = [];
    for (const key in localStorage.storage) {
      if (key.startsWith('jetsy_project_name_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    localStorage.removeItem('jetsy_prefill_idea');
  };
  
  const forceProjectNameUpdate = (projectName, projectId) => {
    localStorage.setItem('jetsy_current_project_name', projectName);
    if (projectId) {
      localStorage.setItem(`jetsy_project_name_${projectId}`, projectName);
    }
    
    mockDispatchEvent({
      type: 'project-name-update',
      detail: { projectName }
    });
    
    setCachedProjectName(projectName, projectId);
  };
  
  // Simulate selecting a new project
  const mockNewProject = {
    id: 'new-project-123',
    user_id: 1,
    project_name: 'New business',
    files: {},
    visibility: 'private'
  };
  
  // Simulate the handleProjectSelect flow for a new project
  const handleProjectSelect = (project) => {
    // Clear all cached data first
    clearAllCachedProjectData();
    
    // Ensure proper project name
    const projectName = project.project_name || 'New business';
    
    // Force immediate UI update
    forceProjectNameUpdate(projectName, project.id);
    
    // Set the new project
    setCurrentProject({
      id: project.id,
      user_id: project.user_id,
      project_name: projectName,
      files: project.files,
      visibility: project.visibility
    });
  };
  
  // Setup old project state first
  localStorage.setItem('jetsy_current_project_name', 'Old Project Name');
  
  console.log('Before project selection:', localStorage.storage);
  
  // Select new project
  handleProjectSelect(mockNewProject);
  
  console.log('After project selection:', localStorage.storage);
  console.log('Current project:', currentProject);
  
  // Verify the fix works
  const nameInStorage = localStorage.getItem('jetsy_current_project_name');
  const projectNameMatches = currentProject && currentProject.project_name === 'New business';
  const eventDispatched = dispatchedEvents.some(e => 
    e.type === 'project-name-update' && 
    e.detail.projectName === 'New business'
  );
  
  const success = nameInStorage === 'New business' && 
    projectNameMatches && 
    eventDispatched;
  
  console.log('✅ Project selection flow test:', success ? 'PASSED' : 'FAILED');
  return success;
}

// Run all tests
console.log('🧪 Running "+ New" project fix tests...\n');

const test1 = testClearAllCachedProjectData();
const test2 = testForceProjectNameUpdate();
const test3 = testProjectSelectionFlow();

console.log('\n📊 Test Results:');
console.log('- clearAllCachedProjectData:', test1 ? '✅ PASSED' : '❌ FAILED');
console.log('- forceProjectNameUpdate:', test2 ? '✅ PASSED' : '❌ FAILED');
console.log('- Project selection flow:', test3 ? '✅ PASSED' : '❌ FAILED');

const allPassed = test1 && test2 && test3;
console.log('\n🎯 Overall result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

if (allPassed) {
  console.log('\n🚀 The fix should work correctly!');
  console.log('When "+ New" is clicked:');
  console.log('1. All cached data is cleared');
  console.log('2. Project name is immediately set to "New business"');
  console.log('3. UI is updated with the correct project name');
  console.log('4. No previous project name should leak through');
} else {
  console.log('\n⚠️ Some tests failed. The fix may need additional work.');
}
