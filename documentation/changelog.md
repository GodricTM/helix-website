# Project Changelog

## [Current Session] - Admin & Visual Enhancements

### New Features
- **Admin Dashboard Refactor**:
    - Created a dedicated **"Themes & Appearance"** tab.
    - Moved Color Theme, Layout Style, and Text Effects controls to the new tab.
    - Restored visual color theme selector buttons.
    - Added live preview boxes for text effects.
- **Visual Text Effects**:
    - Implemented 6 selectable CSS animations for "Ireland's Finest" and "DNA" text:
        - **Idle** (Breathing scale)
        - **Heat** (Blur/Skew distortion)
        - **Underglow** (Neon shadow)
        - **Ignition** (Brightness flash)
        - **Rev** (Gradient wipe)
        - **Carbon** (Texture overlay)
    - Added database columns `helix_text_effect` and `helix_title_effect` to persist selections.
- **Hero Section Enhancements**:
    - Made "FREE CONSULTATION AVAILABLE" tagline editable via Admin.
    - Made "— building, tuning, and fixing them right." description editable via Admin.
    - Made "DNA" title highlight text editable via Admin.
    - Split subtitle into "Ireland's" (Irish Gradient) and "Finest." (Chrome Gradient).
    - Removed "trapped in a box" clipping issue from the main title.
- **Promotion Banner**:
    - Added a high-contrast, dismissible promotion banner.
    - Added Admin controls to enable/disable and edit banner text.
- **Rider Reviews**:
    - Implemented full CRUD system for customer reviews.
    - Added "Show Reviews" toggle to hide the section globally.
- **Navigation & Layout**:
    - Added a floating "Scroll to Bottom" button.
    - Added a "Logout" button to the Admin Dashboard.
    - Implemented "Minimal" layout style option (CSS class hook).

### Code Improvements
- **Refactoring**:
    - Centralized theme and layout logic in `AdminDashboard.tsx`.
    - Cleaned up `Helix.tsx` to support dynamic effects and content.
    - Standardized Admin Dashboard button styling.
- **Database**:
    - Added multiple columns to `contact_info` table to support new features.
    - Created `reviews` table with RLS policies.

### SQL Commands Run (or Required)
```sql
-- Text Effects
alter table contact_info add column if not exists helix_text_effect text default 'none';
alter table contact_info add column if not exists helix_title_effect text default 'none';

-- Editable Content
alter table contact_info add column if not exists helix_tagline text default 'FREE CONSULTATION AVAILABLE';
alter table contact_info add column if not exists helix_description text default '— building, tuning, and fixing them right.';
alter table contact_info add column if not exists helix_title_highlight text default 'DNA';
alter table contact_info add column if not exists helix_subtitle_highlight text default 'Finest.';

-- Promotions
alter table contact_info add column if not exists promotion_enabled boolean default false;
alter table contact_info add column if not exists promotion_text text default 'Special Offer: 10% Off All Services!';

-- Reviews
create table if not exists reviews (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  text text not null,
  date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table reviews enable row level security;
create policy "Reviews are viewable by everyone" on reviews for select using (true);
create policy "Reviews are editable by authenticated users" on reviews for all using (auth.role() = 'authenticated');
```

## [RBAC & Final Polish] - Team Management & Security

### New Features
- **Role-Based Access Control (RBAC)**:
    - Implemented a robust permission system with 3 roles: `super_admin`, `admin`, `editor`.
    - **Super Admin**: Full access, including Team Management.
    - **Admin**: Can manage content, projects, and services, but cannot manage users.
    - **Editor**: Restricted access (configurable).
- **Team Management Tab**:
    - Created a new **"Team"** tab in the Admin Dashboard (visible only to Super Admins).
    - Allows adding new users (email/password).
    - Allows editing roles and granular permissions for each user.
    - Allows removing users (revoking access).
- **Header Refactor**:
    - Restored the **"Workshop CMS"** branding with correct fonts and colors.
    - Moved navigation tabs to a dedicated row for better usability.
    - Added a prominent **Logout** button.

### Bug Fixes
- **RLS Recursion Fix**:
    - Resolved a critical `500 Error` caused by infinite recursion in Row Level Security policies.
    - Implemented a `SECURITY DEFINER` function `is_super_admin()` to safely check roles without triggering loops.
- **Crash Fixes**:
    - Fixed a "Client Component" crash caused by async calls in the JSX render path.
    - Fixed layout regressions where navigation buttons were missing.
- **UI Polish**:
    - Fixed "white on white" text issues in the header.
    - Restored the correct "Helix" font styling.
    - Updated email placeholders for better UX.

### SQL Commands Run (RBAC Setup)
```sql
-- See db_rbac.sql for full script
-- Key components:
-- 1. user_roles table
-- 2. is_super_admin() security definer function
-- 3. RLS policies for user_roles
```
