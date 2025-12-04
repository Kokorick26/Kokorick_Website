# Role-Based Access Control (RBAC) API Documentation

## Overview

This document describes the RBAC system API endpoints for the Kokorick admin panel. The system supports multiple user roles with granular permissions.

## Authentication

All endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <token>
```

### POST /api/auth/login
Login with username and password.

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "username": "admin",
    "email": "admin@example.com",
    "role": "Super Admin",
    "roleType": "system",
    "permissions": ["analytics", "testimonials", ...],
    "isFirstLogin": false,
    "fullName": "Admin User"
  }
}
```

### POST /api/auth/reset-password
Reset password (handles first login and regular password changes).

**Request (First Login):**
```json
{
  "username": "newuser",
  "newPassword": "SecurePass123!"
}
```

**Request (Password Change):**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "NewSecurePass456!"
}
```

### GET /api/auth/verify
Verify current token and get user info.

**Response:**
```json
{
  "valid": true,
  "user": {
    "username": "admin",
    "email": "admin@example.com",
    "role": "Super Admin",
    ...
  }
}
```

---

## User Management (Super Admin Only)

### GET /api/users
List all users.

**Query Parameters:**
- `role` (optional): Filter by role name
- `isActive` (optional): Filter by active status ("true" or "false")

**Response:**
```json
{
  "users": [
    {
      "username": "john",
      "email": "john@example.com",
      "role": "Admin",
      "roleType": "system",
      "permissions": [...],
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/users
Create a new user.

**Request:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "role": "Content Writer",
  "permissions": ["blogs", "whitepapers"],
  "fullName": "New User",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "Content Writer",
    ...
  },
  "temporaryPassword": "xK9#mP2$nL5@"
}
```

### PATCH /api/users/:username
Update a user.

**Request:**
```json
{
  "role": "Admin",
  "permissions": ["analytics", "blogs", "projects"],
  "isActive": true
}
```

### DELETE /api/users/:username
Delete a user (cannot delete yourself or other Super Admins).

### POST /api/users/:username/reset-password
Reset a user's password (generates new temporary password).

**Response:**
```json
{
  "message": "Password reset successfully",
  "temporaryPassword": "yZ8!qR3$kM7@"
}
```

---

## Role Management (Super Admin Only)

### GET /api/roles
List all roles (system and custom).

**Response:**
```json
{
  "roles": [
    {
      "id": "super-admin",
      "name": "Super Admin",
      "type": "system",
      "permissions": ["ALL"],
      "description": "Full system access",
      "userCount": 1
    },
    {
      "id": "custom-role-123",
      "name": "Marketing Team",
      "type": "custom",
      "permissions": ["blogs", "newsletter"],
      "description": "Marketing content access",
      "userCount": 3
    }
  ]
}
```

### POST /api/roles
Create a custom role.

**Request:**
```json
{
  "name": "Marketing Team",
  "permissions": ["blogs", "newsletter", "whitepapers"],
  "description": "Access to marketing content"
}
```

### PATCH /api/roles/:roleId
Update a custom role.

**Request:**
```json
{
  "name": "Marketing & Sales",
  "permissions": ["blogs", "newsletter", "whitepapers", "testimonials"]
}
```

### DELETE /api/roles/:roleId
Delete a custom role (fails if users are assigned to it).

---

## Profile Management

### GET /api/profile
Get current user's profile.

**Response:**
```json
{
  "profile": {
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phone": "+1234567890",
    "role": "Admin",
    "permissions": [...],
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

### PATCH /api/profile
Update current user's profile.

**Request:**
```json
{
  "fullName": "John D. Doe",
  "phone": "+1987654321",
  "email": "john.doe@example.com"
}
```

### POST /api/profile/change-password
Change current user's password.

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "NewSecure456!"
}
```

---

## Audit Logs (Super Admin Only)

### GET /api/audit-logs
Query audit logs with filters.

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `eventType` (optional): Filter by event type
- `performedBy` (optional): Filter by username
- `limit` (optional): Number of results (default: 50)
- `lastKey` (optional): Pagination key

**Response:**
```json
{
  "logs": [
    {
      "id": "log-123",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "eventType": "login_success",
      "performedBy": "admin",
      "targetUser": null,
      "ipAddress": "192.168.1.1",
      "details": {},
      "success": true
    }
  ],
  "lastKey": "eyJpZCI6ImxvZy0xMjMifQ=="
}
```

### GET /api/audit-logs/event-types
Get list of all event types.

**Response:**
```json
{
  "eventTypes": [
    {
      "id": "login_success",
      "name": "Login Success",
      "description": "User successfully logged in"
    },
    {
      "id": "login_failure",
      "name": "Login Failure", 
      "description": "Failed login attempt"
    },
    ...
  ]
}
```

---

## Permissions Reference

| Permission | Description |
|------------|-------------|
| `analytics` | View analytics dashboard |
| `testimonials` | Manage testimonials |
| `projects` | Manage projects |
| `blogs` | Manage blog posts |
| `team` | Manage team members |
| `whitepapers` | Manage whitepapers |
| `newsletter` | Manage newsletter |
| `requests` | Manage contact requests |
| `user_management` | Manage users (Super Admin only) |
| `role_management` | Manage roles (Super Admin only) |
| `audit_logs` | View audit logs (Super Admin only) |
| `admin_panel_access` | Access admin panel |

---

## System Roles

### Super Admin
- Full access to all features
- Can manage users and roles
- Can view audit logs
- Cannot be deleted
- Only role that can create other Super Admins

### Admin
- Access to most features
- Cannot manage users, roles, or view audit logs
- Default role for new admins

### Content Writer
- Limited access to content management
- Can manage: blogs, whitepapers, newsletter
- Cannot access: analytics, testimonials, projects, team, requests

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `401`: Unauthorized - Invalid or missing token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `400`: Bad Request - Invalid input
- `500`: Internal Server Error

---

## Password Requirements

Passwords must meet these requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

---

## Audit Event Types

| Event Type | Description |
|------------|-------------|
| `login_success` | Successful login |
| `login_failure` | Failed login attempt |
| `password_reset` | Password was reset by admin |
| `password_change` | User changed their password |
| `user_created` | New user created |
| `user_updated` | User details updated |
| `user_deleted` | User deleted |
| `user_deactivated` | User account deactivated |
| `permissions_modified` | User permissions changed |
| `role_created` | Custom role created |
| `role_updated` | Custom role updated |
| `role_deleted` | Custom role deleted |
