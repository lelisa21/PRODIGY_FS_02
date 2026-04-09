// scripts/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

import User from '../src/models/User.model.js';
import Employee from '../src/models/Employee.model.js';
import ActivityLog from '../src/models/ActivityLog.model.js';
import Message from '../src/models/Message.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';

// Ethiopian cities and locations
const ETHIOPIAN_CITIES = [
  'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar', 
  'Hawassa', 'Adama', 'Jimma', 'Harar', 'Dessie'
];

const ETHIOPIAN_STATES = [
  'Addis Ababa', 'Oromia', 'Amhara', 'Tigray', 'SNNPR', 
  'Dire Dawa', 'Harari', 'Benishangul-Gumuz', 'Gambela'
];

const DEPARTMENTS = [
  'Engineering', 'Marketing', 'Sales', 'Human Resources', 
  'Finance', 'Operations', 'IT', 'Customer Support'
];

const ETHIOPIAN_NAMES = {
  firstNames: ['Abebe', 'Almaz', 'Biruk', 'Chaltu', 'Dawit', 'Eden', 'Fikru', 'Genet', 'Henok', 'Isra', 'Jemal', 'Kidus', 'Liya', 'Meron', 'Natnael', 'Oliyad', 'Rediet', 'Selam', 'Tigist', 'Yonas'],
  lastNames: ['Abebe', 'Bekele', 'Chala', 'Desta', 'Eshetu', 'Fikre', 'Girma', 'Hailu', 'Ibrahim', 'Jemal', 'Kebede', 'Lemma', 'Mekonnen', 'Negash', 'Olana', 'Petros', 'Reda', 'Sisay', 'Tadesse', 'Wondimu']
};

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomEthiopianPhone() {
  const prefixes = ['09', '07', '091', '092', '093', '094', '095'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `+251${prefix}${number}`;
}

function getRandomEthiopianAddress() {
  return {
    street: `Bole ${Math.floor(Math.random() * 50) + 1} Road`,
    city: getRandomElement(ETHIOPIAN_CITIES),
    state: getRandomElement(ETHIOPIAN_STATES),
    country: 'Ethiopia',
    postalCode: `${Math.floor(Math.random() * 9000) + 1000}`
  };
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomSkills() {
  const skillsList = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'AWS', 'Docker',
    'Leadership', 'Communication', 'Project Management', 'Data Analysis',
    'UI/UX Design', 'SEO', 'Content Creation', 'Sales Strategy', 'Recruiting',
    'TypeScript', 'GraphQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Kubernetes',
    'Amharic', 'English', 'Oromo', 'Tigrigna'
  ];
  
  const numSkills = Math.floor(Math.random() * 5) + 1;
  const selected = [];
  for (let i = 0; i < numSkills; i++) {
    const skill = skillsList[Math.floor(Math.random() * skillsList.length)];
    if (!selected.find(s => s.name === skill)) {
      selected.push({
        name: skill,
        level: getRandomElement(['beginner', 'intermediate', 'advanced', 'expert']),
        yearsOfExperience: Math.floor(Math.random() * 10) + 1
      });
    }
  }
  return selected;
}

function getPositionForDepartment(department) {
  const positions = {
    'Engineering': ['Software Engineer', 'Senior Developer', 'Tech Lead', 'DevOps Engineer', 'QA Engineer', 'Frontend Developer', 'Backend Developer'],
    'Marketing': ['Marketing Specialist', 'SEO Expert', 'Content Writer', 'Social Media Manager', 'Brand Manager', 'Digital Marketing Manager'],
    'Sales': ['Sales Representative', 'Account Executive', 'Sales Manager', 'Business Development', 'Customer Success', 'Regional Sales Manager'],
    'Human Resources': ['HR Generalist', 'Recruiter', 'Training Specialist', 'Payroll Coordinator', 'Benefits Administrator', 'HR Manager'],
    'Finance': ['Financial Analyst', 'Accountant', 'Auditor', 'Tax Specialist', 'Budget Analyst', 'Finance Manager'],
    'Operations': ['Operations Manager', 'Logistics Coordinator', 'Supply Chain Analyst', 'Process Improvement Specialist'],
    'IT': ['IT Support', 'System Administrator', 'Network Engineer', 'Security Analyst', 'Database Administrator'],
    'Customer Support': ['Customer Support Rep', 'Support Specialist', 'Customer Success Manager', 'Technical Support']
  };
  const deptPositions = positions[department] || ['Staff'];
  return getRandomElement(deptPositions);
}

function getRandomDepartment() {
  return getRandomElement(DEPARTMENTS);
}

async function generateEmployeeId() {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const employeeId = `ETH${year}${random}`;
  
  const existing = await User.findOne({ 'employeeDetails.employeeId': employeeId });
  if (existing) {
    return generateEmployeeId();
  }
  return employeeId;
}

async function seedDatabase() {
  try {
    console.log('🌍 Starting Ethiopian EMS Database Seeding...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    await Employee.deleteMany({});
    await ActivityLog.deleteMany({});
    await Message.deleteMany({});
    console.log('✅ Cleared existing data');

    console.log('\n📝 Creating users...');

    // 1. Admin User
    const admin = await User.create({
      email: 'laloo@greateam.com',
      password: '1234Abcd@',
      role: 'admin',
      profile: {
        firstName: 'Laloo',
        lastName: 'Hailu',
        phone: getRandomEthiopianPhone(),
        avatar: 'avatar.png',
        bio: 'System Administrator - GreatTeam EMS',
        location: 'Addis Ababa, Ethiopia'
      },
      employeeDetails: {
        employeeId: await generateEmployeeId(),
        department: 'IT',
        position: 'System Administrator',
        joinDate: new Date('2023-01-15'),
        salary: 250000
      },
      status: 'active',
      lastLogin: new Date()
    });

    // 2. Manager Users
    const managers = [];
    for (let i = 0; i < DEPARTMENTS.length; i++) {
      const manager = await User.create({
        email: `${DEPARTMENTS[i].toLowerCase().replace(/\s/g, '')}.manager@greatteam.com`,
        password: 'Manager123!',
        role: 'manager',
        profile: {
          firstName: getRandomElement(ETHIOPIAN_NAMES.firstNames),
          lastName: getRandomElement(ETHIOPIAN_NAMES.lastNames),
          phone: getRandomEthiopianPhone(),
          avatar: `avatar-${i}.png`,
          bio: `${DEPARTMENTS[i]} Department Manager at Ethiopian EMS`,
          location: `${getRandomElement(ETHIOPIAN_CITIES)}, Ethiopia`
        },
        employeeDetails: {
          employeeId: await generateEmployeeId(),
          department: DEPARTMENTS[i],
          position: `${DEPARTMENTS[i]} Manager`,
          joinDate: new Date('2023-03-01'),
          salary: 180000 + (i * 10000)
        },
        status: 'active',
        lastLogin: new Date()
      });
      managers.push(manager);
    }
    console.log(`✅ Created ${managers.length} managers`);

    // 3. Employees (50 employees)
    const employees = [];
    const statuses = ['active', 'active', 'active', 'active', 'inactive', 'suspended'];
    
    for (let i = 1; i <= 50; i++) {
      const department = getRandomDepartment();
      const manager = managers.find(m => m.employeeDetails?.department === department);
      const joinDate = getRandomDate(new Date('2023-01-01'), new Date('2024-01-01'));
      
      const employee = await User.create({
        email: `employee${i}@greatteam.com`,
        password: `Employee${i}!23`,
        role: 'employee',
        profile: {
          firstName: getRandomElement(ETHIOPIAN_NAMES.firstNames),
          lastName: getRandomElement(ETHIOPIAN_NAMES.lastNames),
          phone: getRandomEthiopianPhone(),
          avatar: `avatar-emp-${i}.png`,
          bio: `Employee at ${department} department - Ethiopian EMS`,
          location: `${getRandomElement(ETHIOPIAN_CITIES)}, Ethiopia`
        },
        employeeDetails: {
          employeeId: await generateEmployeeId(),
          department: department,
          position: getPositionForDepartment(department),
          joinDate: joinDate,
          salary: 60000 + Math.floor(Math.random() * 120000)
        },
        status: getRandomElement(statuses),
        lastLogin: Math.random() > 0.3 ? new Date() : null
      });
      employees.push(employee);
    }
    console.log(`✅ Created ${employees.length} employees`);

    // ==================== CREATE EMPLOYEE DETAILS ====================
    console.log('\n📝 Creating employee details...');
    
    const allEmployees = [...employees, ...managers, admin];
    const employeeRecords = [];
    
    for (const user of allEmployees) {
      if (user.employeeDetails?.employeeId) {
        const manager = managers.find(m => m.employeeDetails?.department === user.employeeDetails.department);
        
        await Employee.create({
          user: user._id,
          employmentDetails: {
            employeeId: user.employeeDetails.employeeId,
            hireDate: user.employeeDetails.joinDate,
            employmentType: getRandomElement(['full-time', 'full-time', 'full-time', 'contract']),
            department: user.employeeDetails.department,
            position: user.employeeDetails.position,
            manager: manager?._id || admin._id,
            workLocation: getRandomElement(['remote', 'onsite', 'hybrid']),
            workEmail: user.email,
            workPhone: user.profile.phone
          },
          personalInfo: {
            dateOfBirth: getRandomDate(new Date('1970-01-01'), new Date('2000-01-01')),
            gender: getRandomElement(['male', 'female', 'other']),
            maritalStatus: getRandomElement(['single', 'married', 'divorced', 'widowed']),
            nationality: 'Ethiopian',
            address: getRandomEthiopianAddress(),
            emergencyContact: {
              name: `${getRandomElement(ETHIOPIAN_NAMES.firstNames)} ${getRandomElement(ETHIOPIAN_NAMES.lastNames)}`,
              relationship: getRandomElement(['Spouse', 'Parent', 'Sibling', 'Friend']),
              phone: getRandomEthiopianPhone(),
              email: `emergency.${user.email}`
            }
          },
          compensation: {
            salary: user.employeeDetails.salary || 60000,
            payFrequency: getRandomElement(['monthly', 'bi-weekly']),
            bankDetails: {
              bankName: getRandomElement(['Commercial Bank of Ethiopia', 'Dashen Bank', 'Awash Bank', 'United Bank']),
              accountNumber: `ACC${Math.floor(Math.random() * 99999999)}`,
              routingNumber: `${Math.floor(Math.random() * 90000000) + 10000000}`
            }
          },
          jobHistory: [
            {
              position: 'Junior Position',
              department: user.employeeDetails.department,
              startDate: new Date(user.employeeDetails.joinDate.getFullYear() - 2, 0, 1),
              endDate: new Date(user.employeeDetails.joinDate.getFullYear() - 1, 11, 31),
              reason: 'Career growth'
            }
          ],
          education: [
            {
              degree: getRandomElement(['Bachelor', 'Master', 'PhD']),
              institution: getRandomElement(['Addis Ababa University', 'Bahir Dar University', 'Jimma University', 'Mekelle University']),
              fieldOfStudy: user.employeeDetails.department,
              graduationYear: 2015 + Math.floor(Math.random() * 8),
              grade: (3 + Math.random() * 1).toFixed(1)
            }
          ],
          skills: getRandomSkills(),
          attendance: {
            totalLeaves: 20,
            leavesTaken: Math.floor(Math.random() * 15),
            lateDays: Math.floor(Math.random() * 10),
            absentDays: Math.floor(Math.random() * 5)
          },
          performance: {
            currentRating: 3 + Math.random() * 2,
            lastReviewDate: new Date('2024-03-15'),
            nextReviewDate: new Date('2025-03-15'),
            reviews: [
              {
                date: new Date('2024-03-15'),
                rating: 3 + Math.random() * 2,
                comments: 'Good performance, room for improvement',
                reviewedBy: manager?._id || admin._id
              }
            ]
          },
          status: user.status === 'active' ? 'active' : 
                  user.status === 'inactive' ? 'inactive' : 'active'
        });
        employeeRecords.push(user);
      }
    }
    console.log(`✅ Created ${employeeRecords.length} employee records`);

    
    
    const actions = ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT'];
    const resources = ['EMPLOYEE', 'USER', 'DEPARTMENT', 'REPORT', 'SETTINGS'];
    
    for (let i = 0; i < 200; i++) {
      const user = getRandomElement(allEmployees);
      await ActivityLog.create({
        user: user._id,
        action: getRandomElement(actions),
        resource: getRandomElement(resources),
        resourceId: getRandomElement(allEmployees)._id,
        details: {
          description: `User performed ${actions[i % actions.length]} action`,
          timestamp: new Date()
        },
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: getRandomElement(['SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED'])
      });
    }
    console.log(`✅ Created 200 activity logs`);

   
    
    const messageTexts = [
      'Selam! Welcome to the team!',
      'Great work on the project!',
      'Can we schedule a meeting?',
      'Please review the latest report.',
      'Melkam Lidet! (Happy Birthday!)',
      'Congratulations on your promotion!',
      'Team lunch at 1 PM today.',
      'Don\'t forget to submit your timesheet.',
      'Great presentation yesterday!',
      'Looking forward to working with you.',
      'Enkwan aderesachu! (Thank you all!)',
      'Let\'s have a team building event next week.'
    ];
    
    for (let i = 0; i < 100; i++) {
      const user = getRandomElement(allEmployees);
      await Message.create({
        text: getRandomElement(messageTexts),
        createdBy: user._id
      });
    }
    console.log(`✅ Created 100 messages`);

  } catch (error) {
    console.error('\n❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

seedDatabase();
