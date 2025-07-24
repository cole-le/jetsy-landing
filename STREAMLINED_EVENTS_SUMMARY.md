# Streamlined Event Tracking System - Summary

## Overview
This document summarizes the changes made to streamline the event tracking system for Jetsy, removing unnecessary events and ensuring the necessary ones capture the right data.

## Events to Keep (Streamlined)

### 1. `page_view`
- **Purpose**: Track when users view pages
- **Data Captured**: Page name, load time, URL, user agent, session ID
- **Status**: ✅ Kept as-is

### 2. `chat_input_submit` / `idea_submit`
- **Purpose**: Track when users submit their startup ideas
- **Data Captured**: 
  - `idea_length`: Length of the input
  - `idea_content`: **NEW** - The actual user input content
  - `visibility`: Public or private
- **Status**: ✅ Enhanced to capture actual input content

### 3. `pricing_plan_select`
- **Purpose**: Track when users select a pricing plan
- **Data Captured**: Plan type, plan price
- **Status**: ✅ Kept as-is

### 4. `lead_capture` / `lead_form_submit`
- **Purpose**: Track when users submit lead information
- **Data Captured**: 
  - `email`: **NEW** - User's email address
  - `phone`: **NEW** - User's phone number
  - `has_plan`: Whether they selected a plan
  - `plan_type`: Type of plan selected
- **Status**: ✅ Enhanced to capture email and phone

### 5. `queue_view`
- **Purpose**: Track when users view the queue page
- **Data Captured**: Email, phone
- **Status**: ✅ Kept as-is

### 6. `priority_access_click` / `priority_access_attempt`
- **Purpose**: Track when users attempt priority access
- **Data Captured**: 
  - `email`: **NEW** - User's email address
  - `phone`: **NEW** - User's phone number
  - `startup_idea`: Their submitted idea
  - `selected_plan`: Plan they selected
- **Status**: ✅ Enhanced to capture email and phone

## Events Removed

### ❌ Removed Events:
1. `lead_saved_success` - Redundant with lead capture
2. `lead_form_success` - Redundant with lead form submit
3. `priority_access_saved_success` - Redundant with priority access attempt
4. `onboarding_saved_success` - Redundant with onboarding complete
5. `login_form_success` - Not essential for funnel tracking

## Code Changes Made

### Main Website (`src/`)

#### 1. `src/components/ChatInputWithToggle.jsx`
- Added `idea_content` field to capture actual user input
- Event: `chat_input_submit`

#### 2. `src/components/LeadCaptureForm.jsx`
- Added `email` and `phone` fields to capture user contact info
- Removed `lead_form_success` event tracking
- Event: `lead_form_submit`

#### 3. `src/components/HeroSection.jsx`
- Added `idea_content` field to capture actual user input
- Event: `hero_idea_submit`

#### 4. `src/App.jsx`
- Enhanced `lead_capture` event to include email and phone
- Enhanced `priority_access_attempt` event to include email and phone
- Removed `lead_saved_success` event tracking
- Removed `onboarding_saved_success` event tracking
- Removed `priority_access_saved_success` event tracking

#### 5. `src/components/LoginForm.jsx`
- Removed `login_form_success` event tracking

#### 6. `src/components/OnboardingForm.jsx`
- Removed `onboarding_form_success` event tracking

### Analytics Dashboard (`analytics-dashboard/`)

#### 1. `analytics-dashboard/src/worker.js`
- Updated `getOverviewMetrics()` to only count streamlined events
- Updated `getDailyMetrics()` to use streamlined events
- Updated `getEventsBreakdown()` to only show streamlined events
- Updated `getFunnelMetrics()` to use streamlined event names
- Updated `getPriorityAccessMetrics()` to extract email/phone from event data
- Updated `getRealTimeMetrics()` to use streamlined events
- Updated `getDebugInfo()` to focus on streamlined events

## Database Impact

### Tables Affected:
- `tracking_events` - Now contains more meaningful data with actual user inputs
- No schema changes required - existing structure supports the enhanced data

### Data Migration:
- No migration needed - existing data remains intact
- New events will contain the enhanced data fields
- Analytics dashboard will only show streamlined events going forward

## Benefits of Streamlined System

1. **Reduced Noise**: Fewer redundant events make analytics cleaner
2. **Better Data Quality**: Capturing actual user inputs provides valuable insights
3. **Improved Performance**: Less event processing and storage
4. **Clearer Funnel**: Focus on essential conversion steps
5. **Enhanced Privacy**: Only capture necessary user data

## Deployment Notes

### Main Website:
- Deploy updated components to capture enhanced data
- No breaking changes to existing functionality
- Backward compatible with existing event structure

### Analytics Dashboard:
- Updated to only display streamlined events
- Enhanced data extraction for email/phone from event_data JSON
- Improved performance with focused queries

## Testing Recommendations

1. **Test Event Capture**: Verify that enhanced data (email, phone, idea content) is being captured
2. **Test Analytics**: Ensure dashboard displays only streamlined events
3. **Test Data Extraction**: Verify email/phone extraction from JSON event data
4. **Test Performance**: Monitor dashboard load times with streamlined queries

## Future Considerations

1. **Data Retention**: Consider how long to retain user input data
2. **Privacy Compliance**: Ensure GDPR/CCPA compliance for captured data
3. **Data Encryption**: Consider encrypting sensitive user inputs
4. **Analytics Enhancement**: Build reports around the enhanced data fields 