/**
 * Migration script to update existing AdminUsers table with RBAC fields
 * 
 * Run with: node server/migrate-admin-users.js
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.ADMIN_USERS_TABLE || 'AdminUsers';

// All available permissions
const ALL_PERMISSIONS = [
  'analytics',
  'testimonials',
  'projects',
  'blogs',
  'team',
  'whitepapers',
  'newsletter',
  'requests',
  'user_management',
  'role_management',
  'audit_logs',
  'admin_panel_access'
];

async function migrateAdminUsers() {
  console.log('Starting AdminUsers migration...\n');

  try {
    // Scan all users
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME
    }));

    const users = result.Items || [];
    console.log(`Found ${users.length} user(s) to migrate\n`);

    for (const user of users) {
      console.log(`Processing user: ${user.username}`);

      // Check if user already has RBAC fields
      if (user.role && user.permissions && user.roleType) {
        console.log(`  - Already migrated, skipping\n`);
        continue;
      }

      // Determine role based on existing data or default to Admin
      // If this is the first/only user, make them Super Admin
      const isSuperAdmin = users.length === 1 || user.username === 'admin' || user.username === 'superadmin';
      
      const updates = {
        role: isSuperAdmin ? 'Super Admin' : 'Admin',
        roleType: 'system',
        permissions: isSuperAdmin ? ALL_PERMISSIONS : ALL_PERMISSIONS.filter(p => 
          !['user_management', 'role_management', 'audit_logs'].includes(p)
        ),
        isFirstLogin: false, // Existing users don't need to reset password
        isActive: user.isActive !== false, // Default to active if not specified
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add email if missing
      if (!user.email) {
        updates.email = `${user.username}@example.com`;
        console.log(`  - Adding placeholder email: ${updates.email}`);
      }

      // Add fullName if missing
      if (!user.fullName) {
        updates.fullName = user.username.charAt(0).toUpperCase() + user.username.slice(1);
        console.log(`  - Adding fullName: ${updates.fullName}`);
      }

      // Build update expression
      const updateExpression = 'SET ' + Object.keys(updates).map(k => `#${k} = :${k}`).join(', ');
      const expressionAttributeNames = Object.fromEntries(Object.keys(updates).map(k => [`#${k}`, k]));
      const expressionAttributeValues = Object.fromEntries(Object.entries(updates).map(([k, v]) => [`:${k}`, v]));

      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { username: user.username },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      }));

      console.log(`  - Role: ${updates.role}`);
      console.log(`  - Permissions: ${updates.permissions.length} granted`);
      console.log(`  - Migration complete\n`);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify users have correct permissions in the admin panel');
    console.log('2. Create additional users via User Management if needed');
    console.log('3. Consider creating a Super Admin account if none exists');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateAdminUsers();
