import axios from "axios";


const API = axios.create({

  baseURL: "http://localhost:3000/api",

  headers: {

    "Content-Type": "application/json",

  },

});



/*
=====================================
MULTI STEP STUDENT SIGNUP
=====================================
*/

export const registerStep = (step, data, studentId) => {
  return API.post("/students/register-step", { step, data, studentId }).then(res => res.data);
};

export const registerAlumniStep = (step, data, alumniId) => {
  return API.post("/alumni/register-step", { step, data, alumniId }).then(res => res.data);
};

export const registerAdminStep = (step, data, adminId) => {
  return API.post("/admin/register-step", { step, data, adminId }).then(res => res.data);
};



/*
=====================================
OTHER STUDENT APIs (optional)
=====================================
*/

export const registerStudent = (data) =>

  API.post("/students/register", data);



export const loginStudent = (data) =>

  API.post("/students/login", data);



export const getStudentProfile = (id) =>

  API.get(`/students/${id}`);



export const updateStudent = (id, data) =>

  API.put(`/students/${id}`, data);



export const loginGoogle = (token) =>
  API.post("/auth/google-login", { token });

export const sendOtp = (email) =>
  API.post("/auth/send-otp", { email });

export const verifyOtp = (email, otp) =>
  API.post("/auth/verify-otp", { email, otp });

export default API;