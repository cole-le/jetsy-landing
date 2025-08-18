# Project Naming System Improvements

## Overview
We've enhanced the AI website generation system to automatically create shorter, more descriptive project names that help users quickly understand what projects they created when reviewing their project history.

## Key Improvements

### 1. **Automatic Project Name Generation**
- **Before**: All projects were named "AI Landing Page Builder" by default
- **After**: AI automatically generates descriptive project names based on the user's business idea
- **Example**: "I want to create a coffee shop website" → Project name: "Coffee Shop"

### 2. **Character Limit Enforcement**
- **Maximum length**: 40 characters for all project names
- **Automatic truncation**: Names longer than 40 characters are truncated with "..." 
- **Frontend validation**: Input fields prevent users from entering names longer than 40 characters

### 3. **Smart Name Extraction Algorithm**
The system now intelligently extracts meaningful business terms from user messages:
- Removes common words like "create", "build", "website", "for", "my", etc.
- Extracts 1-3 most relevant business terms
- Capitalizes each word for readability
- Ensures names are memorable and descriptive

### 4. **Real-time Project Name Updates**
- Project names are automatically updated after AI generates the landing page
- Users receive a notification when their project name is updated
- The change is immediately reflected in the UI and database

### 5. **Enhanced User Experience**
- **Character counter**: Shows current length vs. 40 character limit
- **Helpful hints**: "Keep it short and descriptive" guidance
- **Info tooltips**: Explains that AI automatically updates project names
- **Validation messages**: Clear error messages for invalid names

## Technical Implementation

### Backend Changes (`src/worker.js`)
1. **Modified `handleTemplateGeneration` function**:
   - Now returns `suggested_project_name` in the response
   - Generates names based on AI-generated business names or user message analysis

2. **Added `generateDescriptiveProjectName` function**:
   - Intelligent text processing to extract business terms
   - Character limit enforcement
   - Fallback to "New Project" if no meaningful terms found

3. **Enhanced AI prompt**:
   - Business names are now limited to 1-3 words max
   - Kept under 25 characters for optimal project naming

### Frontend Changes (`src/components/TemplateBasedChat.jsx`)
1. **Automatic project name updates**:
   - Detects when AI suggests a better project name
   - Updates the project in the database
   - Shows success notification to user
   - Updates local state immediately

2. **Default project name change**:
   - Changed from "AI Landing Page Builder" to "New Project"

### Frontend Changes (`src/components/ProjectSelector.jsx`)
1. **Character limit validation**:
   - Input fields enforce 40 character maximum
   - Real-time character counter display
   - Validation in create/rename functions
   - Clear error messages

2. **User guidance**:
   - Helpful text explaining the AI naming system
   - Character limit explanations
   - Best practices for naming projects

## Example Transformations

| User Input | Old Project Name | New Project Name | Characters |
|------------|------------------|------------------|------------|
| "I want to create a coffee shop website" | AI Landing Page Builder | Coffee Shop | 11/40 |
| "Build a SaaS platform for project management" | AI Landing Page Builder | Saas Platform Project | 21/40 |
| "Make a landing page for my real estate business" | AI Landing Page Builder | Real Estate Business | 20/40 |
| "Create a restaurant website for Italian cuisine" | AI Landing Page Builder | Restaurant Italian Cuisine | 26/40 |

## Benefits

1. **Better Project Organization**: Users can quickly identify projects in their history
2. **Improved User Experience**: No more generic "AI Landing Page Builder" names
3. **Professional Appearance**: Project names now reflect actual business purposes
4. **Easier Navigation**: Clear, descriptive names make project selection intuitive
5. **Consistent Naming**: AI ensures all project names follow the same format and length

## User Workflow

1. **User creates project**: Gets "New Project" as default name
2. **User describes business idea**: Types their business description in chat
3. **AI generates content**: Creates landing page + suggests project name
4. **Project name updates**: Automatically renamed to reflect business idea
5. **User notified**: Sees confirmation that project name was updated
6. **Future reference**: Can easily find project in project history

## Future Enhancements

- **Custom naming preferences**: Allow users to set naming patterns
- **Industry-specific templates**: Generate names based on business category
- **Name suggestions**: Show multiple name options for user selection
- **Naming history**: Track how project names evolve over time

## Testing

The system has been tested with various business ideas and consistently generates:
- ✅ Descriptive names under 40 characters
- ✅ Meaningful business terms
- ✅ Proper capitalization and formatting
- ✅ Fallback names when needed

This improvement significantly enhances the user experience by making project management more intuitive and professional.
