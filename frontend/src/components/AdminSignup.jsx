import React, { useState } from "react";
import "./StudentSignup.css";
import { registerAdminStep } from "./api";

export default function AdminSignup() {
  const [step, setStep] = useState(1);
  const [adminId, setAdminId] = useState(null);
  const [form, setForm] = useState({});

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const next = async () => {
    try {
      const res = await registerAdminStep(step, form, adminId);
      if (step === 1) {
        setAdminId(res.admin_id);
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
        <h2>Admin Signup</h2>
        <p>Step {step}/5</p>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input name="employee_id" placeholder="Employee ID" onChange={handleChange} />
            <button onClick={next}>Next</button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input name="first_name" placeholder="First Name" onChange={handleChange} />
            <input name="last_name" placeholder="Last Name" onChange={handleChange} />
            <input name="full_name" placeholder="Full Name" onChange={handleChange} />
            <input type="date" name="date_of_birth" onChange={handleChange} />
            <select name="gender" onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input name="profile_photo_url" placeholder="Profile Photo URL" onChange={handleChange} />
            <button onClick={next}>Next</button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <input name="email" placeholder="Email" type="email" onChange={handleChange} />
            <input name="phone_number" placeholder="Phone Number" onChange={handleChange} />
            <input name="alternate_phone_number" placeholder="Alternate Phone" onChange={handleChange} />
            <button onClick={next}>Next</button>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
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

        {/* STEP 5 */}
        {step === 5 && (
          <>
            <input name="username" placeholder="Username" onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} />
            <button onClick={next}>Finish</button>
          </>
        )}

        {step > 5 && (
          <div>
            <h3>Signup Complete!</h3>
            <p>You can now log in.</p>
          </div>
        )}
      </div>
    </div>
  );
}