import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import Employee from '../models/Employee.model.js';
import bcrypt from 'bcrypt';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const admin = await User.create({
      email: 'admin@ems.com',
      password: adminPassword,
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567890'
      },
      status: 'active'
    });
    console.log('Admin user created');

    // Create manager user
    const managerPassword = await bcrypt.hash('Manager123!', 12);
    const manager = await User.create({
      email: 'manager@ems.com',
      password: managerPassword,
      role: 'manager',
      profile: {
        firstName: 'Manager',
        lastName: 'User',
        phone: '+1234567891'
      },
      status: 'active'
    });
    console.log('Manager user created');

    // Create employee users
    const employees = [];
    for (let i = 1; i <= 10; i++) {
      const empPassword = await bcrypt.hash(`Employee${i}!23`, 12);
      const user = await User.create({
        email: `employee${i}@ems.com`,
        password: empPassword,
        role: 'employee',
        profile: {
          firstName: `Employee${i}`,
          lastName: 'Test',
          phone: `+12345678${i}`
        },
        employeeDetails: {
          employeeId: `EMP2024${String(i).padStart(3, '0')}`,
          department: i <= 3 ? 'Engineering' : (i <= 6 ? 'Marketing' : 'Sales'),
          position: i <= 3 ? 'Software Engineer' : (i <= 6 ? 'Marketing Specialist' : 'Sales Representative'),
          joinDate: new Date(2024, 0, i)
        },
        status: 'active'
      });
      employees.push(user);
      console.log(`Employee ${i} user created`);
    }

    // Create employee records
    for (let i = 0; i < employees.length; i++) {
      const user = employees[i];
      await Employee.create({
        user: user._id,
        employmentDetails: {
          employeeId: user.employeeDetails.employeeId,
          hireDate: user.employeeDetails.joinDate,
          employmentType: 'full-time',
          department: user.employeeDetails.department,
          position: user.employeeDetails.position,
          workEmail: user.email,
          workPhone: user.profile.phone
        },
        compensation: {
          salary: 50000 + (i * 5000),
          payFrequency: 'monthly',
          bankDetails: {
            bankName: 'Test Bank',
            accountNumber: `ACC${String(i).padStart(8, '0')}`,
            routingNumber: '123456789'
          }
        },
        skills: [
          { name: 'JavaScript', level: 'advanced', yearsOfExperience: 3 },
          { name: 'React', level: 'intermediate', yearsOfExperience: 2 }
        ],
        attendance: {
          totalLeaves: 20,
          leavesTaken: Math.floor(Math.random() * 5),
          lateDays: Math.floor(Math.random() * 3),
          absentDays: 0
        },
        performance: {
          currentRating: 3 + Math.random() * 2,
          lastReviewDate: new Date(2024, 2, 15)
        }
      });
      console.log(`Employee ${i + 1} record created`);
    }

    console.log('Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin - email: admin@ems.com, password: Admin123!');
    console.log('Manager - email: manager@ems.com, password: Manager123!');
    console.log('Employee - email: employee1@ems.com, password: Employee1!23');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedDatabase();
