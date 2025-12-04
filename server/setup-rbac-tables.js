import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { hashPassword } from './utils/password.js';

dotenv.config();

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB();
const documentClient = new AWS.DynamoDB.DocumentClient();

// Table definitions
const tables = [
  {
    TableName: 'AuditLogs',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'eventType', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' },
      { AttributeName: 'performedBy', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EventTypeIndex',
        KeySchema: [
          { AttributeName: 'eventType', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      },
      {
        IndexName: 'UserIndex',
        KeySchema: [
          { AttributeName: 'performedBy', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
  },
  {
    TableName: 'CustomRoles',
    KeySchema: [
      { AttributeName: 'roleId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'roleId', AttributeType: 'S' },
      { AttributeName: 'roleName', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'RoleNameIndex',
        KeySchema: [
          { AttributeName: 'roleName', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
  }
];

async function tableExists(tableName) {
  try {
    await dynamodb.describeTable({ TableName: tableName }).promise();
    return true;
  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function createTable(tableConfig) {
  const { TableName } = tableConfig;
  
  if (await tableExists(TableName)) {
    console.log(`Table ${TableName} already exists.`);
    return;
  }

  console.log(`Creating table ${TableName}...`);
  await dynamodb.createTable(tableConfig).promise();
  
  // Wait for table to be active
  console.log(`Waiting for table ${TableName} to be active...`);
  await dynamodb.waitFor('tableExists', { TableName }).promise();
  console.log(`Table ${TableName} is now active.`);
}

async function seedSystemRoles() {
  const systemRoles = [
    {
      roleId: 'super_admin',
      roleName: 'Super Admin',
      displayName: 'Super Admin',
      permissions: [
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
      ],
      isSystemRole: true,
      createdAt: new Date().toISOString()
    },
    {
      roleId: 'admin',
      roleName: 'Admin',
      displayName: 'Admin',
      permissions: [
        'analytics',
        'testimonials',
        'projects',
        'blogs',
        'team',
        'requests',
        'admin_panel_access'
      ],
      isSystemRole: true,
      createdAt: new Date().toISOString()
    },
    {
      roleId: 'content_writer',
      roleName: 'Content Writer',
      displayName: 'Content Writer',
      permissions: [
        'blogs',
        'whitepapers',
        'admin_panel_access'
      ],
      isSystemRole: true,
      createdAt: new Date().toISOString()
    }
  ];

  for (const role of systemRoles) {
    try {
      // Check if role exists
      const existing = await documentClient.get({
        TableName: 'CustomRoles',
        Key: { roleId: role.roleId }
      }).promise();

      if (!existing.Item) {
        await documentClient.put({
          TableName: 'CustomRoles',
          Item: role
        }).promise();
        console.log(`Created system role: ${role.roleName}`);
      } else {
        console.log(`System role ${role.roleName} already exists.`);
      }
    } catch (error) {
      console.error(`Failed to seed role ${role.roleName}:`, error);
    }
  }
}

async function migrateExistingUsers() {
  console.log('\nMigrating existing AdminUsers...');
  
  try {
    const result = await documentClient.scan({
      TableName: 'AdminUsers'
    }).promise();

    const users = result.Items || [];
    let migrated = 0;

    for (const user of users) {
      // Check if user already has new fields
      if (user.role && user.permissions) {
        console.log(`User ${user.username} already migrated.`);
        continue;
      }

      // Update user with new fields
      const updateParams = {
        TableName: 'AdminUsers',
        Key: { username: user.username },
        UpdateExpression: 'SET #role = :role, #permissions = :permissions, #isFirstLogin = :isFirstLogin, #isActive = :isActive, #roleType = :roleType',
        ExpressionAttributeNames: {
          '#role': 'role',
          '#permissions': 'permissions',
          '#isFirstLogin': 'isFirstLogin',
          '#isActive': 'isActive',
          '#roleType': 'roleType'
        },
        ExpressionAttributeValues: {
          ':role': 'super_admin',
          ':permissions': [
            'analytics', 'testimonials', 'projects', 'blogs', 'team',
            'whitepapers', 'newsletter', 'requests', 'user_management',
            'role_management', 'audit_logs', 'admin_panel_access'
          ],
          ':isFirstLogin': false,
          ':isActive': true,
          ':roleType': 'system'
        }
      };

      await documentClient.update(updateParams).promise();
      console.log(`Migrated user: ${user.username}`);
      migrated++;
    }

    console.log(`Migration complete. ${migrated} users migrated.`);
  } catch (error) {
    console.error('Failed to migrate users:', error);
  }
}

async function main() {
  console.log('Setting up role-based admin panel database tables...\n');

  try {
    // Create tables
    for (const tableConfig of tables) {
      await createTable(tableConfig);
    }

    // Seed system roles
    console.log('\nSeeding system roles...');
    await seedSystemRoles();

    // Migrate existing users
    await migrateExistingUsers();

    console.log('\n✅ Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

main();
