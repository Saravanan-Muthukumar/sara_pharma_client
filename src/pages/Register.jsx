import React from 'react'
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'


const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e =>{
    setInputs(prev=>({...prev, [e.target.name]: e.target.value}))
    console.log(inputs)
  };

  const handleSubmit = async e =>{
    e.preventDefault();
    try{
      const res = await axios.post("https://deployserver-production-e464.up.railway.app/register", inputs)
      console.log(res)
      navigate('/login');
    }catch(err) {
      console.log('Error is ', err.response.data)
      setError(err.response.data)
    }
  }

  return (
    <div className='auth'>
      <h1>Register</h1>
      <form action="">
        <input required type="text" placeholder='username' name = 'username' onChange={handleChange}/>
        <input required type="email" placeholder='email' name= 'email' onChange={handleChange} />
        <input required type="text" placeholder='password' name = 'password' onChange={handleChange}/>
        <button onClick={handleSubmit}>Register</button>
        <p>{error}</p>
        <Link to='/login'>Login</Link>
      </form>
    </div>
  )
}

export default Register;