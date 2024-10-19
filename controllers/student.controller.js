const { Student } = require("../models/studen.model");
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const redisClient = require('../config/redis');

const formatResponse = (success, data, message, metadata = {}) => {
    return {
        success,
        data,
        message,
        metadata
    }
}
const getStudentDetail = async (req, res) => {
    try {
        const studentId = new ObjectId(req.params.id);

        const [studentDetail] = await Student.aggregate([
            { $match: { _id: studentId } },
            {
                $lookup: {
                    from: 'faculties',
                    localField: 'faculty',
                    foreignField: '_id',
                    as: 'faculty'
                }
            },
            { $unwind: '$faculty' },
            {
                $lookup: {
                    from: 'classadvisors',
                    localField: 'classAdvisor',
                    foreignField: '_id',
                    as: 'classAdvisor'
                }
            },
            { $unwind: { path: '$classAdvisor', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'classAdvisor.teacher',
                    foreignField: '_id',
                    as: 'classAdvisor.teacher'
                }
            },
            { $unwind: { path: '$classAdvisor.teacher', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'studentstatuses',
                    localField: 'status',
                    foreignField: '_id',
                    as: 'status'
                }
            },
            { $unwind: '$status' },
            {
                $lookup: {
                    from: 'thesisprojects',
                    let: { studentId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$student', '$$studentId'] } } },
                        {
                            $lookup: {
                                from: 'teachers',
                                localField: 'supervisor',
                                foreignField: '_id',
                                as: 'supervisor'
                            }
                        },
                        { $unwind: '$supervisor' },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                description: 1,
                                startDate: 1,
                                endDate: 1,
                                status: 1,
                                grade: 1,
                                'supervisor._id': 1,
                                'supervisor.firstName': 1,
                                'supervisor.lastName': 1,
                                'supervisor.email': 1
                            }
                        }
                    ],
                    as: 'thesisProject'
                }
            },
            { $unwind: { path: '$thesisProject', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    studentId: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    dateOfBirth: 1,
                    gender: 1,
                    address: 1,
                    phoneNumber: 1,
                    enrollmentDate: 1,
                    'faculty._id': 1,
                    'faculty.name': 1,
                    'faculty.code': 1,
                    classAdvisor: {
                        $cond: {
                            if: { $ifNull: ['$classAdvisor', false] },
                            then: {
                                _id: '$classAdvisor._id',
                                className: '$classAdvisor.className',
                                academicYear: '$classAdvisor.academicYear',
                                teacher: {
                                    _id: '$classAdvisor.teacher._id',
                                    firstName: '$classAdvisor.teacher.firstName',
                                    lastName: '$classAdvisor.teacher.lastName',
                                    email: '$classAdvisor.teacher.email'
                                }
                            },
                            else: null
                        }
                    },
                    status: 1,
                    thesisProject: 1
                }
            }
        ]);

        if (!studentDetail) {
            return res.status(404).json(formatResponse(false, null, 'Không tìm thấy sinh viên'));
        }

        res.json(formatResponse(true, studentDetail, 'Successfully!!'));
    } catch (error) {
        console.error('Lỗi khi lấy thông tin sinh viên:', error);
        res.status(500).json(formatResponse(false, null, 'Đã xảy ra lỗi server'));
    }

}

const getStudentDetailWithCache = async (req, res) => {
    try {
        const studentId = req.params.id;
        const cacheKey = `student:${studentId}`;

        // Thử lấy dữ liệu từ Redis cache
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.json(formatResponse(true, JSON.parse(cachedData), 'Successfully!!'));
        }
        const studentObjectId = new ObjectId(studentId);

        const [studentDetail] = await Student.aggregate([
            { $match: { _id: studentObjectId } },
            {
                $lookup: {
                    from: 'faculties',
                    localField: 'faculty',
                    foreignField: '_id',
                    as: 'faculty'
                }
            },
            { $unwind: '$faculty' },
            {
                $lookup: {
                    from: 'classadvisors',
                    localField: 'classAdvisor',
                    foreignField: '_id',
                    as: 'classAdvisor'
                }
            },
            { $unwind: { path: '$classAdvisor', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'classAdvisor.teacher',
                    foreignField: '_id',
                    as: 'classAdvisor.teacher'
                }
            },
            { $unwind: { path: '$classAdvisor.teacher', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'studentstatuses',
                    localField: 'status',
                    foreignField: '_id',
                    as: 'status'
                }
            },
            { $unwind: '$status' },
            {
                $lookup: {
                    from: 'thesisprojects',
                    let: { studentId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$student', '$$studentId'] } } },
                        {
                            $lookup: {
                                from: 'teachers',
                                localField: 'supervisor',
                                foreignField: '_id',
                                as: 'supervisor'
                            }
                        },
                        { $unwind: '$supervisor' },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                description: 1,
                                startDate: 1,
                                endDate: 1,
                                status: 1,
                                grade: 1,
                                'supervisor._id': 1,
                                'supervisor.firstName': 1,
                                'supervisor.lastName': 1,
                                'supervisor.email': 1
                            }
                        }
                    ],
                    as: 'thesisProject'
                }
            },
            { $unwind: { path: '$thesisProject', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    studentId: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    dateOfBirth: 1,
                    gender: 1,
                    address: 1,
                    phoneNumber: 1,
                    enrollmentDate: 1,
                    'faculty._id': 1,
                    'faculty.name': 1,
                    'faculty.code': 1,
                    classAdvisor: {
                        $cond: {
                            if: { $ifNull: ['$classAdvisor', false] },
                            then: {
                                _id: '$classAdvisor._id',
                                className: '$classAdvisor.className',
                                academicYear: '$classAdvisor.academicYear',
                                teacher: {
                                    _id: '$classAdvisor.teacher._id',
                                    firstName: '$classAdvisor.teacher.firstName',
                                    lastName: '$classAdvisor.teacher.lastName',
                                    email: '$classAdvisor.teacher.email'
                                }
                            },
                            else: null
                        }
                    },
                    status: 1,
                    thesisProject: 1
                }
            }
        ]);

        if (!studentDetail) {
            return res.status(404).json(formatResponse(false, null, 'Không tìm thấy sinh viên'));
        }

        await redisClient.set(cacheKey, JSON.stringify(studentDetail), 'EX', 300); // Cache trong 5 phút

        res.json(formatResponse(true, studentDetail, 'Successfully!!'));
    } catch (error) {
        res.status(500).json(formatResponse(false, null, 'Lỗi khi lấy thông tin sinh viên:' + error));
    }

}

module.exports = {
    getStudentDetail,
    getStudentDetailWithCache
}