import React, { useContext } from 'react'
import { useState } from 'react'
import {AiOutlineMinus, AiOutlinePlus, AiTwotoneDelete} from "react-icons/ai"
import moment from 'moment';
import { AuthContext } from '../context/authContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CollectionComment from './CollectionComment';

const SingleCollection = ({issue, loadData}) => {

const { currentUser } = useContext(AuthContext);
console.log("current user is ", currentUser)

const [showInfo, setShowInfo] = useState(false);

const handleClick = () => {
    setShowInfo(!showInfo);
};

const handleDelete = (id) =>{
    if(window.confirm('Confirm Delete', id)) {
        axios.get(`https://deployserver-production-e464.up.railway.app/deletecollection/${id}`);
        setTimeout(()=>loadData(),500);
    }
}

  return (
        <div className='collection'>
            <header>
                <div className="border"></div>
                <div className="summary">
                    <div className="supplier"> 
                        <h4>{issue.customer_name}</h4>
                        <h6>{moment(issue.date_recorded).format('D MMMM YYYY, h:mm a')}</h6>
                        <h6>{issue.recorded_by}</h6>
                    </div>
                    <div className="description-issue">
                                    <h4>Follow up on</h4>
                                    <div className="product-issue">
                                        <h6>{moment(issue.followup_date).format('D MMMM YYYY')}</h6>
                                    </div>
                                </div>
                    <h3>{issue.status}</h3>  
                </div>
                <div className="edit">
                    <Link to={`/editcollection/${issue.col_id}`}>
                        <h3>Edit</h3>
                    </Link>
                    
                </div>
                <button className='btn btn-delete' onClick={()=>handleDelete(issue.col_id)} >
                                <AiTwotoneDelete/>
                            </button>
                <button className='btn btn-open' onClick={handleClick} >
                    
                    {showInfo ? <AiOutlineMinus/> : <AiOutlinePlus/> }
                </button>
            </header>
            {showInfo && 
                 <CollectionComment  col_id = {issue.col_id} loadCollection = {loadData}/>
            }
        </div>
  )
}
export default SingleCollection;
