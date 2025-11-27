# Changelog

## [Unreleased] - 2025-11-27

### Added
- **Dynamic Layout Ordering**: Added a "Layout" section to the Admin Dashboard allowing reordering of homepage sections (Helix, Services, Showroom, etc.).
- **Service Flip Cards**: Services on the homepage now flip on click to reveal a "Book Now" button linking directly to WhatsApp.
- **Before & After Slider**: Added an interactive slider to the Cerakote section in `Services.tsx` to demonstrate restoration results.
- **Lightbox Gallery**: Implemented a full-screen lightbox for viewing project images in `Showroom.tsx` and `ProjectsPage.tsx`.
- **New Logo**: Designed and implemented a new "Mechanical DNA" SVG logo with a neon bronze glow and spinning background.
- **Database Columns**: Added support for `helix_title`, `helix_subtitle`, `helix_video_url`, and `section_order` in the `contact_info` table.

### Changed
- **Branding**: Refactored all "Hero" section references to "Helix" across the codebase for consistency.
- **Admin Dashboard**: Split the "General Settings" save functionality into separate handlers for Contact, Helix, Social, and Hours for better data management.
- **Cerakote Image**: Updated the featured Cerakote service image to a high-quality "Gold Rims" example.
- **Spelling**: Corrected "Calliper" to "Caliper" in the services list.

### Fixed
- **Service Editing**: Fixed an issue where the service edit modal wouldn't open for certain IDs.
- **Syntax Errors**: Resolved JSX syntax errors in `App.tsx` and `Logo.tsx` during development.
