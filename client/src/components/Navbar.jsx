import axios from "axios";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useState } from "react";

export function Navbar(props) {
  const navigate = useNavigate();
  const { backendUrl, userData, isLoggedIn, setUserData, setIsLoggedIn } =
    useContext(AppContext);
    const [popLogOut, setPopLogOut] = useState(false)

  const logOut = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setIsLoggedIn(false);

        localStorage.removeItem("isLoggedIn");
        setUserData(false);
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="nav">
      <div className="logo">
        <h2>Coders</h2>
      </div>
      <div className="menu">
        <ul>
          <li onClick={() => navigate("/")}>Home</li>
          <li onClick={() => navigate("/about")}>About</li>
          <div className="position-relative">
            {isLoggedIn && <li onClick={()=>{setPopLogOut(true)}}>LogOut</li>}
            <div className={`${popLogOut? 'block': 'hidden'}  popup_box text-center gap-3 flex flex-col align-items-center justify-center`}>
                <p>Comform LogOut</p>
                <div className="flex gap-3 justify-center">
                <button className="btn2 btn-sm btn-primary" onClick={logOut}>Yes</button>
                <button className="btn3 btn-sm btn-primary" onClick={()=>setPopLogOut(false)}>No</button>
                </div>
                

            </div>
          </div>
        </ul>
      </div>
      <div className="profile">
        <p>{userData && userData.name}</p>
        {userData ? (
          <div className="cir w-10 h-10 flex align-items-center justify-center rounded-full  bg-purple-900">
            <h2 className="text-white  ">{userData.name[0].toUpperCase()}</h2>
          </div>
        ) : (
          <li className="list-none" onClick={() => navigate("/login")}>
            LogIn
          </li>
        )}
      </div>
    </div>
  );
}
