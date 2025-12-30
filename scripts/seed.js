require('dotenv').config();

const mongoose = require('mongoose');
const Permission = require('../src/models/Permission');
const Role = require('../src/models/Role');
const User = require('../src/models/User');
const { hashPassword } = require('../src/utils/crypto');

const permissions = [
  { resource: 'users', action: 'create', description: 'Create users' },
  { resource: 'users', action: 'read', description: 'Read users' },
  { resource: 'users', action: 'update', description: 'Update users' },
  { resource: 'users', action: 'delete', description: 'Delete users' },
  { resource: 'roles', action: 'create', description: 'Create roles' },
  { resource: 'roles', action: 'read', description: 'Read roles' },
  { resource: 'roles', action: 'update', description: 'Update roles' },
  { resource: 'roles', action: 'delete', description: 'Delete roles' },
  { resource: 'roles', action: 'assign', description: 'Assign roles to users' },
  { resource: '*', action: '*', description: 'Super admin - all permissions' }
];

const roles = [
  {
    name: 'admin',
    description: 'System administrator with full access',
    permissionNames: ['*:*']
  },
  {
    name: 'moderator',
    description: 'Content moderator with limited admin access',
    permissionNames: ['users:read', 'users:update', 'roles:read']
  },
  {
    name: 'user',
    description: 'Regular user with basic access',
    permissionNames: []
  }
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-system';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    await Permission.deleteMany({});
    console.log('Cleared existing permissions');
    
    const createdPermissions = await Permission.insertMany(permissions);
    console.log(`Created ${createdPermissions.length} permissions`);
    
    const permissionMap = {};
    createdPermissions.forEach(p => {
      permissionMap[`${p.resource}:${p.action}`] = p._id;
    });
    
    await Role.deleteMany({});
    console.log('Cleared existing roles');
    
    for (const roleData of roles) {
      const permissionIds = roleData.permissionNames
        .map(name => permissionMap[name])
        .filter(id => id);
      
      await Role.create({
        name: roleData.name,
        description: roleData.description,
        permissions: permissionIds
      });
    }
    console.log(`Created ${roles.length} roles`);
    
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      const adminRole = await Role.findOne({ name: 'admin' });
      
      await User.create({
        email: 'admin@example.com',
        username: 'admin',
        password: 'Admin@123',
        roles: [adminRole._id],
        isActive: true
      });
      console.log('Created admin user (admin@example.com / Admin@123)');
    } else {
      console.log('Admin user already exists');
    }
    
    console.log('\nSeed completed successfully!');
    console.log('\nDefault admin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: Admin@123');
    
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
