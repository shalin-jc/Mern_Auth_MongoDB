import React, { useContext, useState } from "react";
import { Navbar } from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import * as yup from 'yup';


export function VerifyOtp(props) {
    const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);

  const navigate = useNavigate();
  const [sentOtp, setSentOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [userId, setUserId] = useState("");
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [errors, setErrors] = useState({})

  const otpvalidationSchema = yup.object().shape({
        email: yup.string().matches(/^[^@]+@[^@]+\.[^@]+$/,'Invalid email format').required('Email is required'),
  })
  const validationSchema = yup.object().shape({
    email: yup.string().matches(/^[^@]+@[^@]+\.[^@]+$/,'Invalid email format').required('Email is required'),
    otp: yup.string().required('Otp is required'),
  })

  const passwordSchema = yup.object().shape({
    newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
    confirmNewPassword: yup.string().oneOf([yup.ref('newPassword'), null], 'Passwords must match').required('Confirm Password is required'),
  })
  const handleChange = (e)=>{
    const {name, value} = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: value,
    }));
  }

 const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;
      if (!sentOtp) {
        // Step 1: Send OTP
        await otpvalidationSchema.validate(formData, { abortEarly: false });
        setErrors({});
        const { data } = await axios.post(backendUrl + "/api/auth/sendOtp", {
          email: formData.email,
        });
        if (data.success) {
          setSentOtp(true);
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      } else if (!otpVerified) {
        // Step 2: Verify OTP
        await validationSchema.validate(formData, { abortEarly: false });
        setErrors({});
        const { data } = await axios.post(backendUrl + "/api/auth/verifyOtp", {
          email: formData.email,
          otp: formData.otp,
        });
        if (data.success && data.userId) {
          setOtpVerified(true);
          setUserId(data.userId);
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      } else {
        // Step 3: Reset password
        await passwordSchema.validate(formData, { abortEarly: false });
        setErrors({});
        const { data } = await axios.post(backendUrl + "/api/auth/resetPassword", {
          email: formData.email,
          newPassword: formData.newPassword,
        });
        if (data.success) {
          toast.success(data.message);
          navigate('/login');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      if (error.name === "ValidationError") {
        const formErrors = {};
        error.inner.forEach((err) => {
          formErrors[err.path] = err.message;
        });
        setErrors(formErrors);
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
};

  return (
    <div className="centered flex flex-col align-items-center justify-center">
      <div className="form border rounded-2xl">
        <div onClick={() => navigate("/")} className="x">
          x
        </div>
        <h1> Reset password </h1>
        <form onSubmit={onSubmitHandler} className="w-full flex flex-col align-items-center">
          <div className="inputGroup">
            <label htmlFor="">Email</label>
            <input
              disabled={sentOtp}
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              name="email"
            />
            {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
          </div>

          {sentOtp && !otpVerified && (
            <div className="inputGroup">
              <label htmlFor="">Otp</label>
              <input
                value={formData.otp}
                onChange={handleChange}
                type="number"
                placeholder="Otp"
                name="otp"
              />
              {errors.otp && <div style={{ color: 'red' }}>{errors.otp}</div>}
            </div>
          )}

          {otpVerified && (
            <>
            <div className="inputGroup">
              <label htmlFor="">New Password</label>
              <input
                value={formData.newPassword}
                onChange={handleChange}
                type="password"
                placeholder="New Password"
                name="newPassword"
              />
              {errors.newPassword && <div style={{ color: 'red' }}>{errors.newPassword}</div>}
            </div>
            <div className="inputGroup">
              <label htmlFor="">New Password</label>
              <input
                value={formData.confirmNewPassword}
                onChange={handleChange}
                type="password"
                placeholder="Conform New Password"
                name="confirmNewPassword"
              />
              {errors.confirmNewPassword && <div style={{ color: 'red' }}>{errors.confirmNewPassword}</div>}
            </div>
            </>
          )}

          <button className="btn">
            {!sentOtp ? "Send Otp" : !otpVerified ? "Verify Otp" : "Reset Password"}
          </button>
          <div className="flex flex-col text-center gap-2 mt-4 text-sm">
            {sentOtp && !otpVerified && <p>6 digit Otp has been sent on your email id</p>}
            {otpVerified && <p>Enter your new password</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
