import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employmentDetails: {
    employeeId: { 
      type: String, 
      required: true, 
      unique: true 
    },
    hireDate: { 
      type: Date, 
      required: true,
      default: Date.now 
    },
    employmentType: { 
      type: String, 
      enum: ['full-time', 'part-time', 'contract', 'intern'],
      required: true,
      default: 'full-time'
    },
    department: { 
      type: String, 
      required: true 
    },
    position: { 
      type: String, 
      required: true 
    },
    manager: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Employee' 
    },
    workLocation: String,
    workEmail: { 
      type: String, 
      required: true,
      unique: true 
    },
    workPhone: String
  },
  personalInfo: {
    dateOfBirth: Date,
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other'] 
    },
    maritalStatus: { 
      type: String, 
      enum: ['single', 'married', 'divorced', 'widowed'] 
    },
    nationality: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },
  compensation: {
    salary: { 
      type: Number, 
      min: 0,
      required: true 
    },
    payFrequency: { 
      type: String, 
      enum: ['hourly', 'weekly', 'bi-weekly', 'monthly'],
      default: 'monthly'
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      routingNumber: String
    }
  },
  jobHistory: [{
    position: String,
    department: String,
    startDate: Date,
    endDate: Date,
    reason: String
  }],
  education: [{
    degree: String,
    institution: String,
    fieldOfStudy: String,
    graduationYear: Number,
    grade: String
  }],
  skills: [{
    name: String,
    level: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert'] 
    },
    yearsOfExperience: Number
  }],
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  attendance: {
    totalLeaves: { 
      type: Number, 
      default: 20 
    },
    leavesTaken: { 
      type: Number, 
      default: 0 
    },
    lateDays: { 
      type: Number, 
      default: 0 
    },
    absentDays: { 
      type: Number, 
      default: 0 
    }
  },
  performance: {
    currentRating: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    lastReviewDate: Date,
    nextReviewDate: Date,
    reviews: [{
      date: {
        type: Date,
        default: Date.now
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      reviewedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      }
    }]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'probation'],
    default: 'active'
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

employeeSchema.index({ 'employmentDetails.employeeId': 1 });
employeeSchema.index({ 'employmentDetails.department': 1 });
employeeSchema.index({ 'employmentDetails.manager': 1 });
employeeSchema.index({ 'skills.name': 1 });
employeeSchema.index({ 'performance.currentRating': -1 });

// Virtual for years of service
employeeSchema.virtual('yearsOfService').get(function() {
  const years = Math.floor((Date.now() - this.employmentDetails.hireDate) / (1000 * 60 * 60 * 24 * 365));
  return years;
});

// Virtual for available leaves
employeeSchema.virtual('availableLeaves').get(function() {
  return this.attendance.totalLeaves - this.attendance.leavesTaken;
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
