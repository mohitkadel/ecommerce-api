const Admin  = 1;
const Teacher  = 2;
const Student  = 3;
let isAdmin = function(role) {
	return role === Admin
}

let isTeacher = function(role) {
	return role === Teacher
}

let isStudent = function(role) {
	return role === Student
}

module.exports = {
  Admin: Admin,
  Teacher: Teacher,
  Student: Student,
  isAdmin: isAdmin,
  isTeacher: isTeacher,
  isStudent: isStudent

}