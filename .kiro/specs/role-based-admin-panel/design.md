# Design Document: Role-Based Admin Panel

## Overview

This design document outlines the architecture and implementation strategy for a comprehensive role-based admin panel system. The system will extend the existing admin panel to support multiple user roles (Super Admin, Admin, Content Writer) with granular permission controls, user management, profile management, secure authentication with mandatory password reset on first login, and a dynamic dashboard.

The system will be built on the existing technology stack:
- **Frontend**: React 18 with TypeScript, Vite, TailwindCSS, Radix UI components
- **Backend**: Express.js with Node.js
- **Database**: AWS DynamoDB
- **Authentication**: JWT with bcrypt password hashing
- **Storage**: AWS S3 for file uploads

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login &    │  │   Dynamic    │  │   Profile    │      │
│  │ Password     │  │  Dashboard   │  │  Management  │      │
│  │   Reset      │  └──────────────┘  └──────────────┘      │
│  └──────────────┘                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         User Management (Super Admin Only)           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (Express.js)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │     User     │  │   Profile    │      │
│  │  Middleware  │  │  Management  │  │     API      │      │
│  └──────────────┘  │     API      │  └──────────────┘      │
│  ┌──────────────┐  └──────────────┘  ┌──────────────┐      │
│  │  Permission  │  ┌──────────────┐  │  Audit Log   │      │
│  │  Middleware  │  │   Password   │  │     API      │      │
│  └──────────────┘  │  Generation  │  └──────────────┘      │
│                    └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (DynamoDB)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  AdminUsers  │  │    Audit     │  │   Existing   │      │
│  │    Table     │  │     Logs     │  │   Tables     │      │
│  │  (Enhanced)  │  │    Table     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Security Architecture

1. **Authentication Flow**:
   - User submits credentials → JWT token issued → Token stored in localStorage
   - All API requests include JWT token in Authorization header
   - Middleware validates token and extracts user information

2. **Authorization Flow**:
   - User role and permissions loaded from database
   - Permission middleware checks user permissions before allowing access
   - Frontend dynamically renders UI based on permissions

3. **Password Security**:
   - Passwords hashed using bcrypt with salt rounds (10+)
   - First login flag enforced at authentication layer
   - Password reset generates secure random passwords

## Components and Interfaces

### Backend Components

#### 1. Enhanced User Model

```typescript
interface AdminUser {
  username: string;              // Primary key
  email: string;                 // Unique, required
  password: string;              // Bcrypt hashed
  role: 'super_admin' | 'admin' | 'content_writer';
  permissions: Permission[];     // Array of granted permissions
  isFirstLogin: boolean;         // Flag for mandatory password reset
  isActive: boolean;             // Account status
  profilePicture?: string;       // S3 URL
  fullName?: string;
  phone?: string;
  lastLogin?: string;            // ISO timestamp
  createdAt: string;             // ISO timestamp
  createdBy?: string;            // Username of creator
  updatedAt?: string;            // ISO timestamp
}

type Permission = 
  | 'analytics'
  | 'testimonials'
  | 'projects'
  | 'blogs'
  | 'team'
  | 'whitepapers'
  | 'newsletter'
  | 'requests';
```

#### 2. Audit Log Model

```typescript
interface AuditLog {
  id: string;                    // UUID, primary key
  timestamp: string;             // ISO timestamp, sort key
  eventType: AuditEventType;
  performedBy: string;           // Username
  targetUser?: string;           // For user-related actions
  ipAddress?: string;
  details: Record<string, any>;  // Event-specific data
  success: boolean;
}

type AuditEventType =
  | 'login_success'
  | 'login_failure'
  | 'password_reset'
  | 'password_change'
  | 'user_created'
  | 'user_updated'
  | 'user_deactivated'
  | 'user_deleted'
  | 'permissions_modified';
```

#### 3. API Endpoints

**Authentication Endpoints**
```
POST   /api/auth/login
  Body: { username, password }
  Response: { token, user: { username, email, role, permissions, isFirstLogin } }

POST   /api/auth/reset-password
  Headers: Authorization: Bearer <token>
  Body: { currentPassword?, newPassword }
  Response: { message, requiresRelogin }
```

**User Management Endpoints (Super Admin Only)**
```
GET    /api/users
  Headers: Authorization: Bearer <token>
  Query: ?search=<term>&role=<role>&status=<active|inactive>
  Response: { users: AdminUser[] }

POST   /api/users
  Headers: Authorization: Bearer <token>
  Body: { username, email, role, permissions }
  Response: { user: AdminUser, generatedPassword: string }

GET    /api/users/:username
  Headers: Authorization: Bearer <token>
  Response: { user: AdminUser }

PATCH  /api/users/:username
  Headers: Authorization: Bearer <token>
  Body: { email?, role?, permissions?, isActive? }
  Response: { user: AdminUser }

DELETE /api/users/:username
  Headers: Authorization: Bearer <token>
  Response: { message }

POST   /api/users/:username/reset-password
  Headers: Authorization: Bearer <token>
  Response: { generatedPassword: string }
```

**Profile Endpoints**
```
GET    /api/profile
  Headers: Authorization: Bearer <token>
  Response: { user: AdminUser }

PATCH  /api/profile
  Headers: Authorization: Bearer <token>
  Body: { fullName?, email?, phone?, profilePicture? }
  Response: { user: AdminUser }

POST   /api/profile/change-password
  Headers: Authorization: Bearer <token>
  Body: { currentPassword, newPassword }
  Response: { message }
```

**Audit Log Endpoints (Super Admin Only)**
```
GET    /api/audit-logs
  Headers: Authorization: Bearer <token>
  Query: ?startDate=<iso>&endDate=<iso>&eventType=<type>&user=<username>
  Response: { logs: AuditLog[], count: number }
```

#### 4. Middleware Components

**Enhanced Auth Middleware**
```typescript
// Validates JWT and loads user data
function authMiddleware(req, res, next) {
  // Extract and verify JWT token
  // Load user from database
  // Attach user to req.user
  // Check if user is active
  // Update lastLogin timestamp
}
```

**Permission Middleware**
```typescript
// Checks if user has required permissions
function requirePermission(...permissions: Permission[]) {
  return (req, res, next) => {
    // Check if user.role === 'super_admin' (has all permissions)
    // OR check if user.permissions includes required permission
    // Return 403 if unauthorized
  }
}

// Checks if user is Super Admin
function requireSuperAdmin(req, res, next) {
  // Check if user.role === 'super_admin'
  // Return 403 if not super admin
}
```

**Audit Logging Middleware**
```typescript
// Logs all authentication and authorization events
function auditLogger(eventType: AuditEventType) {
  return (req, res, next) => {
    // Capture request details
    // Log event to AuditLogs table
    // Continue to next middleware
  }
}
```

#### 5. Password Generation Utility

```typescript
function generateSecurePassword(): string {
  // Generate 12-16 character password
  // Include uppercase, lowercase, numbers, special characters
  // Ensure at least one of each character type
  // Return generated password
}

function validatePasswordStrength(password: string): boolean {
  // Check minimum length (8 characters)
  // Check for uppercase letters
  // Check for lowercase letters
  // Check for numbers
  // Return validation result
}
```

### Frontend Components

#### 1. Enhanced Login Component

```typescript
interface LoginPageProps {
  onLogin: () => void;
}

// Existing component enhanced with first login detection
function LoginPage({ onLogin }: LoginPageProps) {
  // Handle login
  // Check isFirstLogin flag in response
  // If true, show PasswordResetModal
  // If false, proceed to dashboard
}
```

#### 2. Password Reset Modal

```typescript
interface PasswordResetModalProps {
  isOpen: boolean;
  onComplete: () => void;
  isFirstLogin: boolean;
}

function PasswordResetModal({ isOpen, onComplete, isFirstLogin }: PasswordResetModalProps) {
  // Show modal that cannot be dismissed if isFirstLogin
  // Validate new password strength
  // Submit password change
  // On success, call onComplete
}
```

#### 3. User Management Page (Super Admin Only)

```typescript
function UserManagementPage() {
  // Display list of all users
  // Search and filter functionality
  // Create new user button → opens CreateUserModal
  // Edit user button → opens EditUserModal
  // Reset password button → generates new password
  // Deactivate/Activate user toggle
  // Delete user button with confirmation
}
```

#### 4. Create User Modal

```typescript
interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: AdminUser, password: string) => void;
}

function CreateUserModal({ isOpen, onClose, onUserCreated }: CreateUserModalProps) {
  // Form fields: username, email, role
  // Permission checkboxes based on role
  // Submit creates user and shows generated password
  // Display password in copyable format
  // Option to send credentials via email
}
```

#### 5. Edit User Modal

```typescript
interface EditUserModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (user: AdminUser) => void;
}

function EditUserModal({ user, isOpen, onClose, onUserUpdated }: EditUserModalProps) {
  // Form fields: email, role, permissions
  // Cannot edit username (primary key)
  // Permission checkboxes
  // Active/Inactive toggle
  // Submit updates user
}
```

#### 6. Profile Page

```typescript
function ProfilePage() {
  // Display current user information
  // Editable fields: fullName, email, phone, profilePicture
  // Change password section (requires current password)
  // Upload profile picture to S3
  // Save changes button
}
```

#### 7. Dynamic Dashboard Component

```typescript
interface DashboardProps {
  user: AdminUser;
}

function DynamicDashboard({ user }: DashboardProps) {
  // Render navigation based on user.permissions
  // Show/hide menu items dynamically
  // Display role-specific widgets
  // Super Admin sees all features
}
```

#### 8. Protected Route Component

```typescript
interface ProtectedRouteProps {
  requiredPermission?: Permission;
  requireSuperAdmin?: boolean;
  children: React.ReactNode;
}

function ProtectedRoute({ requiredPermission, requireSuperAdmin, children }: ProtectedRouteProps) {
  // Check if user has required permission
  // Redirect to unauthorized page if not
  // Render children if authorized
}
```

## Data Models

### DynamoDB Table Schemas

#### AdminUsers Table (Enhanced)

```
Table Name: AdminUsers
Primary Key: username (String)

Attributes:
- username: String (PK)
- email: String (GSI)
- password: String
- role: String
- permissions: List<String>
- isFirstLogin: Boolean
- isActive: Boolean
- profilePicture: String
- fullName: String
- phone: String
- lastLogin: String
- createdAt: String
- createdBy: String
- updatedAt: String

Global Secondary Indexes:
- EmailIndex: email (PK)
- RoleIndex: role (PK), createdAt (SK)
```

#### AuditLogs Table (New)

```
Table Name: AuditLogs
Primary Key: id (String - UUID)
Sort Key: timestamp (String - ISO)

Attributes:
- id: String (PK)
- timestamp: String (SK)
- eventType: String
- performedBy: String
- targetUser: String
- ipAddress: String
- details: Map
- success: Boolean

Global Secondary Indexes:
- EventTypeIndex: eventType (PK), timestamp (SK)
- UserIndex: performedBy (PK), timestamp (SK)
```

### State Management

The frontend will use React hooks for state management:

```typescript
// Auth Context
interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AdminUser>) => void;
  hasPermission: (permission: Permission) => boolean;
  isSuperAdmin: () => boolean;
}

// User Management Context (Super Admin)
interface UserManagementContextType {
  users: AdminUser[];
  loading: boolean;
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<{ user: AdminUser; password: string }>;
  updateUser: (username: string, updates: UpdateUserData) => Promise<AdminUser>;
  deleteUser: (username: string) => Promise<void>;
  resetPassword: (username: string) => Promise<string>;
}
```

## 
Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Form validation requires all mandatory fields
*For any* user creation form submission, if any of the required fields (username, email, role) are missing or empty, the submission should be rejected with appropriate validation errors.
**Validates: Requirements 1.2**

### Property 2: Generated passwords meet security requirements
*For any* password generated by the system, it should contain at least 12 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.
**Validates: Requirements 1.3**

### Property 3: Passwords are stored hashed
*For any* password stored in the database, it should be hashed using bcrypt and should not match the plaintext password, and bcrypt.compare should successfully verify the plaintext against the hash.
**Validates: Requirements 1.4**

### Property 4: Password validation correctly identifies valid passwords
*For any* password string, the validation function should return true if and only if the password contains at least 8 characters with at least one uppercase letter, one lowercase letter, and one number.
**Validates: Requirements 2.3**

### Property 5: Old passwords are invalidated after reset
*For any* user who changes their password, attempting to authenticate with the old password should fail while authentication with the new password should succeed.
**Validates: Requirements 2.5**

### Property 6: Multiple permissions can be assigned
*For any* valid combination of permissions, the system should be able to store and retrieve that exact set of permissions for a user without loss or modification.
**Validates: Requirements 3.2**

### Property 7: Permission updates persist correctly
*For any* user and any new set of permissions, after saving the permission changes, querying that user's data should return the updated permissions exactly as they were saved.
**Validates: Requirements 3.3**

### Property 8: User sessions contain assigned permissions
*For any* user who logs in, the authentication response should include their complete set of assigned permissions from the database.
**Validates: Requirements 3.4**

### Property 9: Dashboard displays only authorized features
*For any* user with a specific set of permissions, the dashboard navigation should display menu items only for features included in their permission set, and should not display menu items for features not in their permission set.
**Validates: Requirements 3.5, 6.2, 8.2**

### Property 10: Admin password reset sets first login flag
*For any* user whose password is reset by a Super Admin, the user's isFirstLogin flag should be set to true.
**Validates: Requirements 4.3**

### Property 11: Password resets are audit logged
*For any* password reset operation, an audit log entry should be created containing the event type, the admin who performed the reset, the target user, and a timestamp.
**Validates: Requirements 4.5, 9.4**

### Property 12: Profile displays all user information
*For any* user viewing their profile page, all user fields (name, email, role, profile picture) should be displayed with their current values from the database.
**Validates: Requirements 5.2**

### Property 13: Profile validation rejects invalid inputs
*For any* profile update with invalid data (e.g., malformed email, empty required fields), the validation should reject the update and return appropriate error messages.
**Validates: Requirements 5.3**

### Property 14: Profile updates persist to database
*For any* valid profile update, after saving, querying the user's data should return the updated values exactly as they were saved.
**Validates: Requirements 5.4**

### Property 15: Password changes require current password
*For any* password change attempt from the profile page, if the provided current password does not match the user's actual current password, the change should be rejected.
**Validates: Requirements 5.5**

### Property 16: Dashboard renders based on permissions
*For any* user, the dashboard should render components and features that correspond exactly to their assigned permissions, with no additional or missing features.
**Validates: Requirements 6.1**

### Property 17: Direct URL access is protected
*For any* user attempting to access a route that requires a permission they don't have, the system should redirect them to an unauthorized page or dashboard instead of rendering the protected content.
**Validates: Requirements 6.3**

### Property 18: Widgets display permission-appropriate data
*For any* dashboard widget, the data displayed should only include information that the current user has permission to access based on their permission set.
**Validates: Requirements 6.4**

### Property 19: User list displays all required fields
*For any* user in the user management list, the display should include their username, email, role, last login date, and account status.
**Validates: Requirements 7.2**

### Property 20: Deactivated users cannot login
*For any* user whose isActive flag is set to false, login attempts with correct credentials should fail with an appropriate error message, while their data remains in the database.
**Validates: Requirements 7.4**

### Property 21: User search returns matching results
*For any* search query, the returned users should match the search criteria (username, email, or role contains the search term), and no non-matching users should be returned.
**Validates: Requirements 7.5**

### Property 22: API returns 403 for unauthorized access
*For any* API endpoint that requires a specific permission, requests from users without that permission should return a 403 Forbidden status code.
**Validates: Requirements 8.3**

### Property 23: Successful logins are audit logged
*For any* successful login, an audit log entry should be created containing the event type, username, timestamp, and IP address.
**Validates: Requirements 9.1**

### Property 24: Failed logins are audit logged
*For any* failed login attempt, an audit log entry should be created containing the event type, attempted username, and timestamp.
**Validates: Requirements 9.2**

### Property 25: Permission changes are audit logged
*For any* permission modification, an audit log entry should be created containing the Super Admin who made the change, the affected user, the old permissions, the new permissions, and a timestamp.
**Validates: Requirements 9.3**

### Property 26: Audit log queries return correct results
*For any* audit log query with date range and filters, the returned logs should match all specified criteria and be ordered by timestamp.
**Validates: Requirements 9.5**

## Error Handling

### Authentication Errors

1. **Invalid Credentials**: Return 401 with message "Invalid username or password"
2. **Inactive Account**: Return 403 with message "Account has been deactivated"
3. **Expired Token**: Return 401 with message "Session expired, please login again"
4. **Missing Token**: Return 401 with message "Authentication required"

### Authorization Errors

1. **Insufficient Permissions**: Return 403 with message "You don't have permission to access this resource"
2. **Super Admin Required**: Return 403 with message "This action requires Super Admin privileges"

### Validation Errors

1. **Missing Required Fields**: Return 400 with field-specific error messages
2. **Invalid Email Format**: Return 400 with message "Please provide a valid email address"
3. **Weak Password**: Return 400 with message "Password must be at least 8 characters with uppercase, lowercase, and numbers"
4. **Duplicate Username**: Return 409 with message "Username already exists"
5. **Duplicate Email**: Return 409 with message "Email already registered"

### Database Errors

1. **User Not Found**: Return 404 with message "User not found"
2. **Database Connection Error**: Return 500 with message "Database connection failed"
3. **Query Timeout**: Return 504 with message "Request timeout, please try again"

### General Error Response Format

```typescript
interface ErrorResponse {
  error: string;           // Human-readable error message
  code: string;            // Machine-readable error code
  details?: any;           // Additional error details
  timestamp: string;       // ISO timestamp
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific functionality and edge cases:

**Authentication Tests**:
- Login with valid credentials succeeds
- Login with invalid credentials fails
- Login with inactive account fails
- Token generation and validation
- First login detection

**Password Tests**:
- Password generation produces valid passwords
- Password hashing works correctly
- Password validation accepts/rejects correctly
- Password reset flow

**Permission Tests**:
- Permission middleware correctly authorizes/denies
- Super Admin has all permissions
- Role-based default permissions are applied

**Validation Tests**:
- Form validation catches missing fields
- Email validation works correctly
- Password strength validation

**API Endpoint Tests**:
- Each endpoint returns correct status codes
- Error responses have correct format
- Success responses include expected data

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using **fast-check** (JavaScript/TypeScript property testing library):

**Configuration**: Each property test will run a minimum of 100 iterations to ensure thorough coverage.

**Tagging**: Each property-based test will include a comment tag in this format:
```typescript
// Feature: role-based-admin-panel, Property 2: Generated passwords meet security requirements
```

**Property Test Coverage**:
- Property 1: Form validation (test with various combinations of missing fields)
- Property 2: Password generation (test 100+ generated passwords)
- Property 3: Password hashing (test with various passwords)
- Property 4: Password validation (test with valid and invalid passwords)
- Property 5: Password invalidation (test password change flow)
- Property 6: Permission assignment (test with various permission combinations)
- Property 7: Permission persistence (test save/load cycles)
- Property 8: Session permissions (test login responses)
- Property 9: Dashboard rendering (test with various permission sets)
- Property 10-26: Additional properties as specified above

**Test Organization**:
- Unit tests: `server/__tests__/` and `src/__tests__/`
- Property tests: `server/__tests__/properties/` and `src/__tests__/properties/`
- Integration tests: `server/__tests__/integration/`

### Integration Testing

Integration tests will verify end-to-end workflows:

1. **User Creation Flow**: Super Admin creates user → User receives credentials → User logs in → Password reset required → User resets password → Access granted
2. **Permission Management Flow**: Super Admin assigns permissions → User logs in → Dashboard shows only authorized features → API access restricted correctly
3. **Profile Management Flow**: User updates profile → Changes persist → User changes password → Old password invalid
4. **Audit Logging Flow**: Actions performed → Audit logs created → Logs queryable with filters

### Testing Tools

- **Unit Testing**: Jest or Vitest
- **Property-Based Testing**: fast-check
- **API Testing**: Supertest
- **React Testing**: React Testing Library
- **E2E Testing**: Playwright (optional, for critical flows)

## Security Considerations

### Password Security

1. **Hashing**: Use bcrypt with salt rounds ≥ 10
2. **Generation**: Cryptographically secure random password generation
3. **Validation**: Enforce minimum strength requirements
4. **Storage**: Never log or display passwords in plaintext
5. **Transmission**: Always use HTTPS in production

### Token Security

1. **JWT Secret**: Use strong, randomly generated secret (minimum 256 bits)
2. **Token Expiration**: Set reasonable expiration (24 hours recommended)
3. **Token Storage**: Store in httpOnly cookies or secure localStorage
4. **Token Refresh**: Implement refresh token mechanism for long sessions

### Authorization Security

1. **Middleware Order**: Auth middleware before permission middleware
2. **Default Deny**: Deny access unless explicitly permitted
3. **Role Hierarchy**: Super Admin inherits all permissions
4. **API Protection**: Every protected endpoint must use permission middleware

### Audit Security

1. **Immutable Logs**: Audit logs should not be editable or deletable
2. **Comprehensive Logging**: Log all security-relevant events
3. **Log Retention**: Retain logs for compliance requirements
4. **Log Access**: Only Super Admin can view audit logs

### Input Validation

1. **Sanitization**: Sanitize all user inputs
2. **Validation**: Validate on both client and server
3. **SQL Injection**: Use parameterized queries (DynamoDB handles this)
4. **XSS Prevention**: Escape output, use React's built-in XSS protection

## Performance Considerations

### Database Optimization

1. **Indexes**: Create GSIs for email and role lookups
2. **Query Patterns**: Use efficient query patterns for user lists
3. **Caching**: Cache user permissions in JWT token
4. **Batch Operations**: Use batch operations for bulk user management

### Frontend Optimization

1. **Code Splitting**: Lazy load admin components
2. **Memoization**: Use React.memo for expensive components
3. **Virtual Scrolling**: For large user lists
4. **Debouncing**: Debounce search inputs

### API Optimization

1. **Response Size**: Return only necessary fields
2. **Pagination**: Implement pagination for user lists
3. **Rate Limiting**: Implement rate limiting for auth endpoints
4. **Compression**: Enable gzip compression

## Deployment Considerations

### Environment Variables

```
# JWT Configuration
JWT_SECRET=<strong-random-secret>
JWT_EXPIRATION=24h

# AWS Configuration
AWS_REGION=<region>
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>

# Email Configuration (for sending credentials)
SMTP_HOST=<host>
SMTP_PORT=<port>
SMTP_USER=<user>
SMTP_PASS=<password>
FROM_EMAIL=<email>

# Application Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=<url>
```

### Database Setup

1. Create AdminUsers table with GSIs
2. Create AuditLogs table with GSIs
3. Migrate existing admin users to new schema
4. Create initial Super Admin account

### Migration Strategy

1. **Phase 1**: Deploy new tables and API endpoints
2. **Phase 2**: Migrate existing admin user to Super Admin role
3. **Phase 3**: Deploy frontend with role-based UI
4. **Phase 4**: Enable permission enforcement
5. **Phase 5**: Create additional admin users as needed

## Future Enhancements

1. **Two-Factor Authentication**: Add 2FA for enhanced security
2. **Session Management**: View and revoke active sessions
3. **Password Policies**: Configurable password policies
4. **Role Templates**: Predefined role templates for common use cases
5. **Bulk User Operations**: Import/export users via CSV
6. **Advanced Audit Reports**: Detailed audit reports and analytics
7. **IP Whitelisting**: Restrict access by IP address
8. **Login Notifications**: Email notifications for new logins
9. **Account Lockout**: Temporary lockout after failed login attempts
10. **Permission Groups**: Group permissions for easier management


## Custom Roles Feature

### Custom Role Model

```typescript
interface CustomRole {
  roleId: string;                // UUID, primary key
  roleName: string;              // Unique, user-defined name
  displayName: string;           // Human-readable name
  permissions: Permission[];     // Array of granted permissions
  isSystemRole: boolean;         // false for custom roles, true for super_admin/admin/content_writer
  createdBy: string;             // Username of creator
  createdAt: string;             // ISO timestamp
  updatedAt?: string;            // ISO timestamp
  userCount?: number;            // Number of users with this role (computed)
}

// Enhanced Permission type to include admin panel access
type Permission = 
  | 'admin_panel_access'         // NEW: Required to access admin panel
  | 'analytics'
  | 'testimonials'
  | 'projects'
  | 'blogs'
  | 'team'
  | 'whitepapers'
  | 'newsletter'
  | 'requests'
  | 'user_management';           // NEW: For custom roles that can manage users
```

### Enhanced User Model for Custom Roles

```typescript
interface AdminUser {
  username: string;
  email: string;
  password: string;
  role: string;                  // Can now be custom role ID or system role name
  roleType: 'system' | 'custom'; // Indicates if role is system or custom
  permissions: Permission[];     // Cached permissions from role
  isFirstLogin: boolean;
  isActive: boolean;
  profilePicture?: string;
  fullName?: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
}
```

### Custom Role API Endpoints

```
GET    /api/roles
  Headers: Authorization: Bearer <token>
  Query: ?includeSystem=true
  Response: { roles: CustomRole[] }
  Description: List all roles (Super Admin only)

POST   /api/roles
  Headers: Authorization: Bearer <token>
  Body: { roleName, displayName, permissions }
  Response: { role: CustomRole }
  Description: Create custom role (Super Admin only)

GET    /api/roles/:roleId
  Headers: Authorization: Bearer <token>
  Response: { role: CustomRole, userCount: number }
  Description: Get role details (Super Admin only)

PATCH  /api/roles/:roleId
  Headers: Authorization: Bearer <token>
  Body: { displayName?, permissions? }
  Response: { role: CustomRole }
  Description: Update custom role (Super Admin only)

DELETE /api/roles/:roleId
  Headers: Authorization: Bearer <token>
  Response: { message }
  Description: Delete custom role if no users assigned (Super Admin only)
```

### Custom Role Components

#### Role Management Page

```typescript
function RoleManagementPage() {
  // Display list of all roles (system + custom)
  // Show role name, permissions count, user count
  // Create new role button → opens CreateRoleModal
  // Edit role button → opens EditRoleModal
  // Delete role button (disabled if users assigned)
  // View users with role button
}
```

#### Create Role Modal

```typescript
interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleCreated: (role: CustomRole) => void;
}

function CreateRoleModal({ isOpen, onClose, onRoleCreated }: CreateRoleModalProps) {
  // Form fields: roleName, displayName
  // Permission checkboxes including admin_panel_access
  // Validation: unique role name, at least one permission
  // Submit creates custom role
}
```

#### Edit Role Modal

```typescript
interface EditRoleModalProps {
  role: CustomRole;
  isOpen: boolean;
  onClose: () => void;
  onRoleUpdated: (role: CustomRole) => void;
}

function EditRoleModal({ role, isOpen, onClose, onRoleUpdated }: EditRoleModalProps) {
  // Cannot edit system roles
  // Form fields: displayName, permissions
  // Warning: changing permissions affects all users with this role
  // Submit updates custom role
}
```

### Enhanced Authentication Flow for Custom Roles

1. User logs in → System loads user record
2. If roleType is 'custom' → Load custom role from Roles table
3. Apply permissions from custom role to user session
4. Check if user has 'admin_panel_access' permission
5. If no admin_panel_access → Deny access to admin panel
6. If has admin_panel_access → Grant access with their specific permissions

### DynamoDB Table for Custom Roles

```
Table Name: CustomRoles
Primary Key: roleId (String - UUID)

Attributes:
- roleId: String (PK)
- roleName: String (GSI)
- displayName: String
- permissions: List<String>
- isSystemRole: Boolean
- createdBy: String
- createdAt: String
- updatedAt: String

Global Secondary Indexes:
- RoleNameIndex: roleName (PK)
```

### Custom Role Correctness Properties

### Property 27: Custom role requires unique name
*For any* custom role creation attempt, if a role with the same name already exists, the creation should be rejected with an appropriate error.
**Validates: Requirements 11.2**

### Property 28: Custom role permissions persist correctly
*For any* custom role with a specific set of permissions, after saving, querying that role should return the exact same permission set.
**Validates: Requirements 11.3**

### Property 29: Users inherit custom role permissions
*For any* user assigned a custom role, their effective permissions should match exactly the permissions defined in that custom role.
**Validates: Requirements 11.4**

### Property 30: Role updates affect all users
*For any* custom role whose permissions are modified, all users with that role should receive the updated permissions on their next login.
**Validates: Requirements 11.5**

### Property 31: Cannot delete role with assigned users
*For any* custom role that has one or more users assigned to it, deletion attempts should be rejected with an appropriate error.
**Validates: Requirements 11.6**

### Property 32: Admin panel access is enforced
*For any* user without the 'admin_panel_access' permission, attempts to access the admin panel should be denied regardless of other permissions.
**Validates: Requirements 11.7**
