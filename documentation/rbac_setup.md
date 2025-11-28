# Role-Based Access Control (RBAC) System

## Overview
The Helix Admin Dashboard now includes a comprehensive RBAC system to manage user access and permissions. This allows you to have multiple team members with different levels of control over the website content.

## Roles

### 1. Super Admin (`super_admin`)
*   **Access**: Unlimited.
*   **Capabilities**:
    *   Can view and edit ALL content (Projects, Services, Reviews, Messages, Themes).
    *   **Exclusive Access**: Can see the **"Team"** tab.
    *   **User Management**: Can create new users, assign roles, and modify permissions for other staff.
    *   **System**: Can delete critical data.

### 2. Admin (`admin`)
*   **Access**: High.
*   **Capabilities**:
    *   Can manage Projects, Services, and Reviews.
    *   Can view and archive Messages.
    *   **Restriction**: Cannot access the "Team" tab or manage other users.

### 3. Editor (`editor`)
*   **Access**: Restricted / Customizable.
*   **Capabilities**:
    *   Default: Can view messages but cannot delete them.
    *   **Customizable**: Permissions can be toggled individually by a Super Admin (e.g., allow an Editor to manage Reviews but not Projects).

## Permissions List
The system uses granular permissions stored in the database:
*   `manage_team`: Access to the Team tab (Super Admin only).
*   `manage_content`: General content (Taglines, Hours, Socials).
*   `manage_projects`: Add/Edit/Delete Projects.
*   `manage_services`: Add/Edit/Delete Services.
*   `manage_reviews`: Approve/Delete Reviews.
*   `view_messages`: Read incoming messages.
*   `manage_messages`: Archive/Delete messages.

## Database Setup
The RBAC system relies on the `user_roles` table and specific Row Level Security (RLS) policies.

### Key SQL Components
*   **Table**: `user_roles` (links `auth.users` to roles and permissions).
*   **Function**: `is_super_admin()` (Security Definer function to prevent infinite recursion in policies).
*   **Policies**:
    *   "Super Admins can view all roles"
    *   "Users can view own role"
    *   "Super Admins can manage roles"

## How to Manage Users
1.  **Log in** as a Super Admin (e.g., `admin@helixmotorcycles.com`).
2.  Navigate to the **"Team"** tab.
3.  **Add User**: Click "+ Add Team Member", enter email and temporary password.
4.  **Edit User**: Click "Edit" on a user card to change their role or toggle specific permissions.
5.  **Remove User**: Click "Remove" to revoke their access.
