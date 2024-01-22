import React, { useContext } from 'react'
import { useState } from 'react'
import {AiOutlineMinus, AiOutlinePlus, AiTwotoneDelete} from "react-icons/ai"
import moment from 'moment';
import { AuthContext } from '../context/authContext';
import PurchaseIssueComment from './PurchaseIssueComment';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SinglePurchaseIssue = ({issue, loadData}) => {

const { currentUser } = useContext(AuthContext);
console.log("current user is ", currentUser)

const [showInfo, setShowInfo] = useState(false);

const handleClick = () => {
    setShowInfo(!showInfo);
};

const handleDelete = (id) =>{
    if(window.confirm('Confirm Delete', id)) {
        axios.get(`https://deployserver-production-e464.up.railway.app/deleteissue/${id}`);
        setTimeout(()=>loadData(),500);
    }
}

  return (
        <div className='questions'>
            <header>
                <div className="border"></div>
                <div className="summary">
                    <div className="supplier"> 
                        <h4>{issue.supplier_name}</h4>
                        <h6>{moment(issue.date_recorded).format('D MMMM YYYY, h:mm a')}</h6>
                        <h6>{issue.recorded_by}</h6>
                    </div>
                    <div className="product">
                        <h4>{issue.product_name}</h4>
                        <div className="product-issue">
                            <h6>{issue.qty}</h6>
                            <h6>{issue.issue}</h6>
                        </div>
                    </div>
                    <div className="description-issue">
                                    <h4>Description</h4>
                                    <div className="product-issue">
                                        <h6>{issue.description}</h6>
                                    </div>
                                </div>
                    <h3>{issue.status}</h3>  
                </div>
                <div className="edit">
                    <Link to={`/addpurchaseissue/${issue.pur_issue_id}`}>
                        <h3>Edit</h3>
                    </Link>
                    
                </div>
                <button className='btn btn-delete' onClick={()=>handleDelete(issue.pur_issue_id)} >
                                <AiTwotoneDelete/>
                            </button>
                <button className='btn btn-open' onClick={handleClick} >
                    
                    {showInfo ? <AiOutlineMinus/> : <AiOutlinePlus/> }
                </button>
            </header>
            {showInfo && 
                 <PurchaseIssueComment  pur_issue_id = {issue.pur_issue_id} issue_description={issue.description}/>
            }
        </div>
  )
}
export default SinglePurchaseIssue;
