# Admin Refactor & DNA Effects

## Goal Description
1.  Apply selectable text effects to the "DNA" (Title Highlight) text.
2.  Refactor the Admin Dashboard to move all visual/theme settings (Color Theme, Layout Style, Text Effects) into a dedicated "Themes & Appearance" tab.

## Proposed Changes

### 1. Database & Types
#### [MODIFY] [types.ts](file:///e:/Helix/with%20admin%20page/types.ts)
- Add `helixTitleEffect` property to `ContactInfo`.

### 2. Application Logic
#### [MODIFY] [App.tsx](file:///e:/Helix/with%20admin%20page/App.tsx)
- Fetch `helix_title_effect` from Supabase and map it.

### 3. Component Logic
#### [MODIFY] [components/Helix.tsx](file:///e:/Helix/with%20admin%20page/components/Helix.tsx)
- Apply the `helixTitleEffect` class to the DNA text span.

### 4. Admin Interface
#### [MODIFY] [components/AdminDashboard.tsx](file:///e:/Helix/with%20admin%20page/components/AdminDashboard.tsx)
- Add 'themes' to `activeTab` state.
- Create a new "Themes & Appearance" tab content area.
- Move "Color Theme", "Layout Style", and "Subtitle Text Effect" controls to this new tab.
- Add "Title Text Effect" control to this new tab.
- Create `handleSaveThemes` function (wrapping the `contact_info` update logic for these fields).

## Database Setup (SQL)
```sql
alter table contact_info 
add column if not exists helix_title_effect text default 'none';
```

---

# RBAC System Implementation

## Goal Description
Implement a secure Role-Based Access Control (RBAC) system to manage user permissions for the Admin Dashboard.

## Architecture

### 1. Database Schema
- **Table**: `user_roles`
    - `user_id` (uuid, FK to auth.users)
    - `email` (text)
    - `role` (text: 'super_admin', 'admin', 'editor')
    - `permissions` (jsonb)
- **Security**:
    - RLS Policies to restrict access.
    - `is_super_admin()` SECURITY DEFINER function to prevent recursion.

### 2. Frontend Integration
#### [MODIFY] [types.ts](file:///e:/Helix/with%20admin%20page/types.ts)
- Define `UserRole` and `UserPermissions` interfaces.

#### [NEW] [components/TeamManagement.tsx](file:///e:/Helix/with%20admin%20page/components/TeamManagement.tsx)
- Component for Super Admins to add/edit/remove users.
- Interface for toggling granular permissions.

#### [MODIFY] [components/AdminDashboard.tsx](file:///e:/Helix/with%20admin%20page/components/AdminDashboard.tsx)
- Fetch user role on login.
- Conditionally render "Team" tab.
- Wrap action handlers (Save/Delete) with `checkPermission()` helper.

## Verification Plan
### Automated Tests
- None (Manual verification required).

### Manual Verification
- [x] Log in as Super Admin -> Verify full access.
- [x] Create Editor user -> Log in -> Verify restricted access.
- [x] Test RLS policies (ensure 500 errors are resolved).
