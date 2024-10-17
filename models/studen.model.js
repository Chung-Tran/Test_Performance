const mongoose = require('mongoose');

// Khoa
const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: String,
  establishedDate: Date
});

// Giáo viên
const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  position: String,
  phoneNumber: String,
  dateOfBirth: Date,
  hireDate: Date
});

// Chủ nhiệm lớp
const classAdvisorSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  className: { type: String, required: true },
  academicYear: { type: String, required: true },
  startDate: Date,
  endDate: Date
});

// Trạng thái sinh viên
const studentStatusSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String
});

// Sinh viên
const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: String,
  phoneNumber: String,
  enrollmentDate: { type: Date, default: Date.now },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  classAdvisor: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassAdvisor' },
  status: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentStatus', required: true }
});

// Đề tài đồ án
const thesisProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['Proposed', 'In Progress', 'Completed', 'Defended'], default: 'Proposed' },
  grade: Number
});

// Tạo và xuất các model
const Faculty = mongoose.model('Faculty', facultySchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const ClassAdvisor = mongoose.model('ClassAdvisor', classAdvisorSchema);
const StudentStatus = mongoose.model('StudentStatus', studentStatusSchema);
const Student = mongoose.model('Student', studentSchema);
const ThesisProject = mongoose.model('ThesisProject', thesisProjectSchema);

module.exports = { 
  Faculty, 
  Teacher, 
  ClassAdvisor, 
  StudentStatus, 
  Student, 
  ThesisProject 
};