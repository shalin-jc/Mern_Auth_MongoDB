import React, { use, useContext } from 'react'
import { AppContext } from '../context/AppContext'

export function Welcome(props) {
    
    const {userData} = useContext(AppContext)
    return (
        
        <div className="text-center  text-white mt-20">
            
            <h2 className='text-6xl'>Hello {userData ? userData.name: "Developers"}!</h2>
            <h1 className='text-3xl'>Welecome to<span className="text-blue-500 cursor-pointer"> Coders.com</span></h1>
            <button className="btn w-100 text-center">Get Started</button>
        </div>

        
    )
}
