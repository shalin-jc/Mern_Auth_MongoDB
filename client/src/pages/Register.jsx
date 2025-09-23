
import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as yup from "yup";

export function Register(props) {
    
    const [showPassword, setShowPassword] = useState(false)
    const [showConformPassword, setShowConfirmPassword] = useState(false)
     const {backendUrl} = useContext(AppContext)

    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const [errors, setErrors]= useState({})

    const validationSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        email: yup.string().matches(/^[^@]+@[^@]+\.[^@]+$/,'Invalid email format').required('Email is required'),
        password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required'),
    })

    const handleChange = (e) => {
        const { name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const onSubmitHandler = async(e)=>{
        e.preventDefault()
        try {
            // if(password !== confirmPassword){
            //     toast.error("Password and confirm password must be same")
            //     return
            // }
            await validationSchema.validate(formData, { abortEarly: false });
            setErrors({})
            const {data} = await axios.post(backendUrl + '/api/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password
            })
            if(data && data.success){
                toast.success(data.message)
                navigate('/login')
            } else {
                toast.error(data.message || "Registration failed")
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Registration failed"
            toast.error(message)
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
         <div className="flex justify-center">
                
               
        <div className="form border rounded-2xl">
           <div onClick={()=>navigate('/')} className="x">x</div>
            <h1> Register Account </h1>
            <form onSubmit={onSubmitHandler} className='w-full flex flex-col align-items-center' >
            <div className="inputGroup">
                <label htmlFor="">Name</label>
                <input value={formData.name} onChange={handleChange} name='name' type="text" placeholder='Name'/>
                {errors.name && <div style={{ color: 'red' }}>{errors.name}</div>}
            </div>
            
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
            <div className="inputGroup">
                <label htmlFor="">Conform Password</label>
                <input value={formData.confirmPassword} onChange={handleChange} name='confirmPassword' type={showConformPassword?'text': 'password'}  placeholder='Conform Password' />
                <div className='flex gap-1'>
                    <input type="checkbox" checked={showConformPassword? true: false} onChange={()=>setShowConfirmPassword((prev)=>!prev)} />
                    <p>Show Password</p>
                </div>
                {errors.confirmPassword && <div style={{ color: 'red' }}>{errors.confirmPassword}</div>}
            </div>
           
            <button className='btn'>Register</button>
            <div className="flex flex-col text-center gap-2 mt-4 text-sm">
                <p>Already an User <span onClick={()=> navigate('/login')} className='text-blue-500 cursor-pointer'>Login</span></p>
          
            </div>
            </form>
        </div>
        </div>
    )
}

