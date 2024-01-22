import React, { useContext } from 'react'
import Logo from '../img/logo.png'
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { useNavigate } from "react-router-dom";


const Navbar = () => {

  const {currentUser, logout} = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async () => {
      await logout();
      navigate("/login");
  };


  return (
    <div className='navbar'>
      <div className="container">
        <div className="logo">
          <Link to="/"><img src={Logo} alt="" /></Link>
        </div>
        <div className="links">
          <Link className='link' to='/'>
            <h6>HOME</h6>
          </Link>
          {currentUser && 
            <Link className='link' to='/cheques'>
              <h6>CHEQUES</h6>
            </Link>     
          }
          {currentUser && 
            <Link className='link' to='/issues'>
              <h6>PURCHASE ISSUES</h6>
            </Link>    
          }
          {currentUser && 
            <Link className='link' to='/collection'>
              <h6>COLLECTIONS</h6>
            </Link>    
          }
          {currentUser && 
          <Link className='link' to='/repadjustment'>
            <h6>REP ADJUSTMENT</h6>
          </Link>

          }

          {currentUser && <span>{currentUser.username}</span>}
          {currentUser? <span onClick={handleSubmit}>Logout</span> : <Link to="/login" className='link'>Login</Link>}
        </div>
      </div>
    </div>
  )
}

export default Navbar;
