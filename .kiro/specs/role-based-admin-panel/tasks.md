# Implementation Plan: Role-Based Admin Panel

- [ ] 1. Set up database schema and migrations
  - Create enhanced AdminUsers table with new fields (role, permissions, isFirstLogin, isActive, etc.)
  - Create AuditLogs table with appropriate indexes
  - Create database setup script for new tables
  - _Requirements: 1.4, 9.1-9.5_

- [ ] 2. Implement password utilities and security functions
  - Create secure password generation function with 12+ characters including uppercase, lowercase, numbers, and special characters
  - Create password validation function for minimum 8 characters with complexity requirements
  - Add bcrypt hashing utilities with salt rounds configuration
  - _Requirements: 1.3, 1.4, 2.3_

- [ ] 2.1 Write property test for password generation
  - **Property 2: Generated passwords meet security requirements**
  - **Validates: Requirements 1.3**

- [ ] 2.2 Write property test for password validation
  - **Property 4: Password validation correctly identifies valid passwords**
  - **Validates: Requirements 2.3**

- [ ] 2.3 Write property test for password hashing
  - **Property 3: Passwords are stored hashed**
  - **Validates: Requirements 1.4**

- [ ] 3. Create audit logging system
  - Implement audit log model and DynamoDB operations
  - Create audit logging middleware for Express
  - Add audit log creation functions for all event types (login, password reset, user management, permission changes)
  - _Requirements: 9.1-9.5_

- [ ] 3.1 Write property test for audit log creation
  - **Property 11: Password resets are audit logged**
  - **Property 23: Successful logins are audit logged**
  - **Property 24: Failed logins are audit logged**
  - **Property 25: Permission changes are audit logged**
  - **Validates: Requirements 4.5, 9.1, 9.2, 9.3**

- [ ] 4. Implement authentication middleware enhancements
  - Enhance existing auth middleware to load full user object with role and permissions
  - Add isActive check to prevent deactivated users from accessing system
  - Update lastLogin timestamp on successful authentication
  - Add first login detection in login response
  - _Requirements: 2.1, 7.4, 8.1_

- [ ] 5. Create permission authorization middleware
  - Implement requirePermission middleware that checks user permissions
  - Implement requireSuperAdmin middleware for super admin-only routes
  - Add permission checking utility functions (hasPermission, isSuperAdmin)
  - _Requirements: 3.4, 3.5, 6.3, 8.3_

- [ ] 5.1 Write property test for permission authorization
  - **Property 22: API returns 403 for unauthorized access**
  - **Validates: Requirements 8.3**

- [ ] 6. Build user management API endpoints
  - Implement POST /api/users (create user with role and permissions)
  - Implement GET /api/users (list all users with filtering)
  - Implement GET /api/users/:username (get single user)
  - Implement PATCH /api/users/:username (update user role, permissions, status)
  - Implement DELETE /api/users/:username (delete user)
  - Implement POST /api/users/:username/reset-password (admin password reset)
  - All endpoints protected with requireSuperAdmin middleware
  - _Requirements: 1.1-1.5, 4.1-4.5, 7.1-7.5, 10.1-10.5_

- [ ] 6.1 Write property test for form validation
  - **Property 1: Form validation requires all mandatory fields**
  - **Validates: Requirements 1.2**

- [ ] 6.2 Write property test for permission assignment
  - **Property 6: Multiple permissions can be assigned**
  - **Property 7: Permission updates persist correctly**
  - **Validates: Requirements 3.2, 3.3**

- [ ] 6.3 Write property test for user search
  - **Property 21: User search returns matching results**
  - **Validates: Requirements 7.5**

- [ ] 6.4 Write property test for deactivated users
  - **Property 20: Deactivated users cannot login**
  - **Validates: Requirements 7.4**

- [ ] 7. Enhance authentication endpoints
  - Update POST /api/auth/login to return role, permissions, and isFirstLogin flag
  - Create POST /api/auth/reset-password for first login and user-initiated password changes
  - Add password strength validation to password reset endpoint
  - Implement old password invalidation on password change
  - _Requirements: 2.1-2.5, 3.4_

- [ ] 7.1 Write property test for password invalidation
  - **Property 5: Old passwords are invalidated after reset**
  - **Validates: Requirements 2.5**

- [ ] 7.2 Write property test for session permissions
  - **Property 8: User sessions contain assigned permissions**
  - **Validates: Requirements 3.4**

- [ ] 8. Create profile management API endpoints
  - Implement GET /api/profile (get current user profile)
  - Implement PATCH /api/profile (update profile information)
  - Implement POST /api/profile/change-password (change password with current password verification)
  - Add profile field validation
  - _Requirements: 5.1-5.5_

- [ ] 8.1 Write property test for profile operations
  - **Property 12: Profile displays all user information**
  - **Property 13: Profile validation rejects invalid inputs**
  - **Property 14: Profile updates persist to database**
  - **Property 15: Password changes require current password**
  - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**

- [ ] 9. Implement audit log API endpoints
  - Create GET /api/audit-logs with date range and filter support
  - Add pagination for audit log queries
  - Protect with requireSuperAdmin middleware
  - _Requirements: 9.5_

- [ ] 9.1 Write property test for audit log queries
  - **Property 26: Audit log queries return correct results**
  - **Validates: Requirements 9.5**

- [ ] 10. Create React authentication context
  - Implement AuthContext with user state, role, and permissions
  - Add login, logout, and updateUser functions
  - Create hasPermission and isSuperAdmin helper functions
  - Store JWT token and user data in localStorage
  - Handle token expiration and auto-logout
  - _Requirements: 3.4, 3.5_

- [ ] 11. Build password reset modal component
  - Create PasswordResetModal component with mandatory mode for first login
  - Add password strength indicator
  - Implement password validation on client side
  - Prevent modal dismissal when isFirstLogin is true
  - Show success message and redirect to dashboard on completion
  - _Requirements: 2.1-2.4_

- [ ] 12. Enhance login page component
  - Update LoginPage to handle isFirstLogin flag from API response
  - Show PasswordResetModal when isFirstLogin is true
  - Add error handling for inactive accounts
  - Integrate with audit logging
  - _Requirements: 2.1, 7.4_

- [ ] 13. Create user management page (Super Admin only)
  - Build UserManagementPage component with user list table
  - Add search and filter functionality (by role, status)
  - Implement user list display with all required fields
  - Add action buttons for each user (edit, reset password, deactivate, delete)
  - Show confirmation dialogs for destructive actions
  - _Requirements: 7.1-7.5_

- [ ] 13.1 Write property test for user list display
  - **Property 19: User list displays all required fields**
  - **Validates: Requirements 7.2**

- [ ] 14. Build create user modal component
  - Create CreateUserModal with form for username, email, and role
  - Add permission checkboxes for granular permission assignment
  - Apply role-based default permissions (Super Admin = all, Admin = default set, Content Writer = limited)
  - Display generated password in copyable format after creation
  - Add option to send credentials via email
  - _Requirements: 1.1-1.5, 10.1-10.5_

- [ ] 15. Build edit user modal component
  - Create EditUserModal for updating user role, permissions, and status
  - Show current user information (username not editable)
  - Add permission checkboxes with current selections
  - Add active/inactive toggle
  - Show confirmation when changing role to prompt permission review
  - _Requirements: 3.1-3.3, 7.3, 10.5_

- [ ] 15.1 Write property test for permission updates
  - **Property 10: Admin password reset sets first login flag**
  - **Validates: Requirements 4.3**

- [ ] 16. Create profile page component
  - Build ProfilePage showing current user information
  - Add editable fields for fullName, email, phone, profilePicture
  - Implement profile picture upload to S3
  - Add change password section requiring current password
  - Show success/error messages for updates
  - _Requirements: 5.1-5.5_

- [ ] 17. Implement dynamic dashboard component
  - Update existing AdminPage to use permission-based navigation
  - Create navigation filter function based on user permissions
  - Hide/show menu items dynamically based on permissions
  - Add profile menu item for all users
  - Add user management menu item for Super Admin only
  - _Requirements: 3.5, 6.1, 6.2, 6.5_

- [ ] 17.1 Write property test for dynamic dashboard
  - **Property 9: Dashboard displays only authorized features**
  - **Property 16: Dashboard renders based on permissions**
  - **Validates: Requirements 3.5, 6.1, 6.2**

- [ ] 18. Create protected route component
  - Build ProtectedRoute wrapper component
  - Check user permissions before rendering children
  - Redirect to unauthorized page or dashboard if permission missing
  - Support both permission-based and super-admin-only routes
  - _Requirements: 6.3_

- [ ] 18.1 Write property test for route protection
  - **Property 17: Direct URL access is protected**
  - **Validates: Requirements 6.3**

- [ ] 19. Implement permission-based widget filtering
  - Update dashboard widgets to check user permissions
  - Filter displayed data based on user permissions
  - Ensure Super Admin sees all data
  - Hide widgets user doesn't have permission for
  - _Requirements: 6.4_

- [ ] 19.1 Write property test for widget filtering
  - **Property 18: Widgets display permission-appropriate data**
  - **Validates: Requirements 6.4**

- [ ] 20. Add email notification system
  - Implement email sending utility using SMTP
  - Create email templates for new user credentials
  - Create email template for password reset
  - Send emails when users are created or passwords are reset
  - _Requirements: 1.5, 4.4_

- [ ] 21. Create database migration script
  - Write script to migrate existing AdminUsers to new schema
  - Add default role (super_admin) to existing users
  - Add default permissions (all) to existing users
  - Set isFirstLogin to false for existing users
  - Set isActive to true for existing users
  - _Requirements: 1.4_

- [ ] 22. Build audit log viewer (Super Admin only)
  - Create AuditLogViewer component
  - Add date range picker for filtering
  - Add event type filter dropdown
  - Add user filter
  - Display logs in table format with all details
  - Add pagination for large result sets
  - _Requirements: 9.5_

- [ ] 23. Add role-based default permissions logic
  - Implement getDefaultPermissions function based on role
  - Super Admin: all permissions
  - Admin: analytics, testimonials, projects, blogs, team, requests
  - Content Writer: blogs, whitepapers
  - Apply defaults in create user form
  - Allow customization before saving
  - _Requirements: 10.1-10.4_

- [ ] 24. Implement error handling and user feedback
  - Add error boundary components
  - Implement toast notifications for success/error messages
  - Add loading states for all async operations
  - Show appropriate error messages for auth failures
  - Handle network errors gracefully
  - _Requirements: All_

- [ ] 25. Add input validation and sanitization
  - Implement client-side validation for all forms
  - Add email format validation
  - Add username format validation (alphanumeric, no spaces)
  - Sanitize all user inputs before sending to API
  - Show inline validation errors
  - _Requirements: 1.2, 5.3_

- [ ] 26. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 27. Create initial Super Admin setup script
  - Write script to create first Super Admin account
  - Prompt for username, email, and password
  - Hash password and store in database
  - Set role to super_admin with all permissions
  - Set isFirstLogin to false
  - _Requirements: 10.1_

- [ ] 28. Add API rate limiting
  - Implement rate limiting middleware for auth endpoints
  - Limit login attempts to prevent brute force
  - Add rate limiting to user creation endpoint
  - Configure appropriate limits (e.g., 5 login attempts per minute)
  - _Requirements: Security_

- [ ] 29. Implement session management
  - Add token refresh mechanism
  - Implement auto-logout on token expiration
  - Add "remember me" functionality (optional)
  - Clear session data on logout
  - _Requirements: 2.1, 7.4_

- [ ] 30. Add comprehensive logging
  - Add server-side logging for all API requests
  - Log errors with stack traces
  - Log security events (failed auth, permission denials)
  - Configure log levels (debug, info, warn, error)
  - _Requirements: 9.1-9.5_

- [ ] 31. Create API documentation
  - Document all new API endpoints
  - Include request/response examples
  - Document authentication requirements
  - Document permission requirements
  - Add error response documentation
  - _Requirements: All_

- [ ] 32. Perform security audit
  - Review all authentication flows
  - Verify permission checks on all protected routes
  - Test for common vulnerabilities (XSS, CSRF, SQL injection)
  - Verify password security (hashing, strength requirements)
  - Test audit logging completeness
  - _Requirements: All security requirements_

- [ ] 33. Final checkpoint - Comprehensive testing
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 34. Create custom roles database table
  - Create CustomRoles DynamoDB table with roleId as primary key
  - Add RoleNameIndex GSI for unique role name lookups
  - Create database setup script for CustomRoles table
  - Seed system roles (super_admin, admin, content_writer) as isSystemRole=true
  - _Requirements: 11.1, 11.3_

- [ ] 35. Implement custom role API endpoints
  - Implement GET /api/roles (list all roles)
  - Implement POST /api/roles (create custom role)
  - Implement GET /api/roles/:roleId (get role details with user count)
  - Implement PATCH /api/roles/:roleId (update custom role)
  - Implement DELETE /api/roles/:roleId (delete if no users assigned)
  - All endpoints protected with requireSuperAdmin middleware
  - _Requirements: 11.1-11.7_

- [ ] 35.1 Write property test for custom role creation
  - **Property 27: Custom role requires unique name**
  - **Validates: Requirements 11.2**

- [ ] 35.2 Write property test for custom role permissions
  - **Property 28: Custom role permissions persist correctly**
  - **Validates: Requirements 11.3**

- [ ] 35.3 Write property test for role deletion
  - **Property 31: Cannot delete role with assigned users**
  - **Validates: Requirements 11.6**

- [ ] 36. Enhance user model for custom roles
  - Add roleType field to AdminUser model ('system' or 'custom')
  - Update user creation to support custom role assignment
  - Update user update to support changing to/from custom roles
  - Cache permissions from custom role in user record
  - _Requirements: 11.4_

- [ ] 37. Update authentication to support custom roles
  - Enhance login endpoint to load custom role if roleType is 'custom'
  - Apply custom role permissions to user session
  - Check for 'admin_panel_access' permission before granting admin access
  - Update auth middleware to handle custom roles
  - _Requirements: 11.4, 11.7_

- [ ] 37.1 Write property test for custom role permissions inheritance
  - **Property 29: Users inherit custom role permissions**
  - **Validates: Requirements 11.4**

- [ ] 37.2 Write property test for admin panel access
  - **Property 32: Admin panel access is enforced**
  - **Validates: Requirements 11.7**

- [ ] 38. Implement role permission update propagation
  - Create function to update all users when custom role permissions change
  - Add background job or trigger to refresh user permissions
  - Update permissions on next login for affected users
  - _Requirements: 11.5_

- [ ] 38.1 Write property test for role update propagation
  - **Property 30: Role updates affect all users**
  - **Validates: Requirements 11.5**

- [ ] 39. Build role management page component
  - Create RoleManagementPage showing all roles (system + custom)
  - Display role name, permissions count, user count for each role
  - Add create new role button
  - Add edit/delete buttons for custom roles (disabled for system roles)
  - Show confirmation dialog before deleting role
  - Add "View Users" button to see users with each role
  - _Requirements: 11.1_

- [ ] 40. Create role creation modal
  - Build CreateRoleModal with form for roleName and displayName
  - Add permission checkboxes including 'admin_panel_access'
  - Validate unique role name
  - Require at least one permission selection
  - Show success message on creation
  - _Requirements: 11.2, 11.3_

- [ ] 41. Create role editing modal
  - Build EditRoleModal for updating custom role
  - Disable editing for system roles
  - Allow editing displayName and permissions
  - Show warning about affecting existing users
  - Prevent removing all permissions
  - _Requirements: 11.5_

- [ ] 42. Update user creation/editing to support custom roles
  - Add custom role selection dropdown in CreateUserModal
  - Show both system and custom roles in dropdown
  - Display permissions preview when role is selected
  - Allow permission customization for custom roles
  - Update EditUserModal to support custom role assignment
  - _Requirements: 11.4_

- [ ] 43. Add admin panel access check to frontend
  - Update AdminPage to check for 'admin_panel_access' permission
  - Redirect users without admin_panel_access to unauthorized page
  - Show appropriate error message for users without access
  - Update navigation to only show admin panel link if user has access
  - _Requirements: 11.7_

- [ ] 44. Create role assignment audit logging
  - Log when custom roles are created
  - Log when custom roles are updated
  - Log when custom roles are deleted
  - Log when users are assigned custom roles
  - Include role details in audit logs
  - _Requirements: 9.1-9.5_

- [ ] 45. Add role management to navigation
  - Add "Role Management" menu item for Super Admin
  - Place it near User Management in the sidebar
  - Add appropriate icon (Shield or Key icon)
  - Update navigation permissions check
  - _Requirements: 11.1_

- [ ] 46. Final checkpoint - Test custom roles feature
  - Ensure all tests pass, ask the user if questions arise.
