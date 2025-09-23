import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useForm } from 'react-hook-form';

export function Form(props) {

    const {backendUrl, setIsLoggedIn , getUserData} = useContext(AppContext)

    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const [formData, setFromData] = useState({
        email: "",
        password: ""
    })

    const [errors, setErrors]= useState({})
    

    const validationSchema = yup.object().shape({
        email: yup.string().matches(/^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.(com)$/,'Invalid email format').required('Email is required'),
        password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    })
       const handleChange = (e) => {
        const { name, value } = e.target;
        setFromData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
        axios.defaults.withCredentials = true;
        await validationSchema.validate(formData, { abortEarly: false });
        setErrors({});
        // console.log('Form submitted:', formData);

        const { data } = await axios.post(backendUrl + '/api/auth/login', { 
            email: formData.email,
            password: formData.password
        });

        if(data.success){
            setIsLoggedIn(true);
            localStorage.setItem('isLoggedIn', 'true');
            getUserData();
            navigate('/', { replace: true });
            toast.success(data.message);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        console.log(error);
        
        if (error.response && error.response.data && error.response.data.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error(error.message);
        }

        if(error.inner){
            const formErrors = {};
                error.inner.forEach(error => {
                    formErrors[error.path] = error.message;
                });
                setErrors(formErrors);
        }
    }
}

    return (
        <div className="form border rounded-2xl">
           <div onClick={()=>navigate('/')} className="x">x</div>
            <h1> Login Account</h1>
            <form onSubmit={onSubmitHandler} className='w-full flex flex-col align-items-center' >
            
        
            <div className="inputGroup">
                <label htmlFor="">Email</label>
                <input value={formData.email} onChange={handleChange} name='email'  placeholder='Email' />
                {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
            </div>
            <div className="inputGroup">
                <label htmlFor="">Password</label>
                <input value={formData.password} onChange={handleChange} name='password' type={showPassword?'text': 'password'} placeholder='Password' />
                 <div className="flex gap-1">
                    <input type="checkbox" checked={showPassword? true: false} onChange={()=>setShowPassword((prev)=>!prev)} />
                    <p>Show Password</p>
                </div>
                 {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}

            </div>
           
           
            <button className='btn'>LogIn</button>
            <div className="flex flex-col text-center gap-2 mt-4 text-sm">
                
                 <p>Create an Account <span onClick={()=> navigate('/register')} className='text-blue-500 cursor-pointer'>Register</span></p>
                 <p><span onClick={()=> navigate("/resetpass")} className='text-blue-500 cursor-pointer'>Forgot Password</span></p>
                
              
            </div>
            </form>
        </div>
    )
}
