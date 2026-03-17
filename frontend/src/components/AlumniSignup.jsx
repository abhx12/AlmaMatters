import React, { useState } from "react";
import "./StudentSignup.css";
import { registerAlumniStep } from "./api";

export default function AlumniSignup() {
  const [step, setStep] = useState(1);
  const [alumniId, setAlumniId] = useState(null);
  const [form, setForm] = useState({});

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const next = async () => {
    try {
      const res = await registerAlumniStep(step, form, alumniId);
      if (step === 1) {
        setAlumniId(res.alumni_id);
      }
      setStep(step + 1);
    } catch (err) {
      console.error(err);
      alert("Error saving step data");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Alumni Signup</h2>
        <p>Step {step}/7</p>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input name="student_id" placeholder="Student ID (Number)" type="number" onChange={handleChange} />
            <input name="graduation_year" placeholder="Graduation Year (YYYY)" type="number" onChange={handleChange} />
            <button onClick={next}>Next</button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input name="linkedin_url" placeholder="LinkedIn URL" onChange={handleChange} />
            <input name="current_city" placeholder="Current City" onChange={handleChange} />
            <button onClick={next}>Next</button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <input name="company_name" placeholder="Company Name" onChange={handleChange} />
            <input name="job_title" placeholder="Job Title" onChange={handleChange} />
            <input name="industry" placeholder="Industry" onChange={handleChange} />
            <input name="years_of_experience" placeholder="Years of Experience" type="number" step="0.1" onChange={handleChange} />
            <button onClick={next}>Next</button>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <>
            <input name="university_name" placeholder="Higher Studies University (optional)" onChange={handleChange} />
            <input name="degree" placeholder="Degree" onChange={handleChange} />
            <input name="field_of_study" placeholder="Field of Study" onChange={handleChange} />
            <input name="country" placeholder="Country" onChange={handleChange} />
            <input name="start_year" placeholder="Start Year" type="number" onChange={handleChange} />
            <input name="end_year" placeholder="End Year" type="number" onChange={handleChange} />
            <button onClick={next}>Next</button>
          </>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <>
            <input name="department" placeholder="Department" onChange={handleChange} />
            <input name="program" placeholder="Program" onChange={handleChange} />
            <input name="course" placeholder="Course" onChange={handleChange} />
            <input name="batch_year" placeholder="Batch Year" type="number" onChange={handleChange} />
            <input name="graduation_year" placeholder="Graduation Year" type="number" onChange={handleChange} />
            <input name="cgpa" placeholder="CGPA" type="number" step="0.01" onChange={handleChange} />
            <input name="class_obtained" placeholder="Class Obtained" onChange={handleChange} />
            <button onClick={next}>Next</button>
          </>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <>
            <input name="address_line1" placeholder="Address Line 1" onChange={handleChange} />
            <input name="address_line2" placeholder="Address Line 2" onChange={handleChange} />
            <input name="city" placeholder="City" onChange={handleChange} />
            <input name="state" placeholder="State" onChange={handleChange} />
            <input name="pincode" placeholder="Pincode" onChange={handleChange} />
            <input name="country" placeholder="Country" onChange={handleChange} />
            <button onClick={next}>Next</button>
          </>
        )}

        {/* STEP 7 */}
        {step === 7 && (
          <>
            <input name="username" placeholder="Username" onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} />
            <button onClick={next}>Finish</button>
          </>
        )}

        {step > 7 && (
          <div>
            <h3>Signup Complete!</h3>
            <p>You can now log in.</p>
          </div>
        )}
      </div>
    </div>
  );
}