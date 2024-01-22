import React, { useContext } from 'react'
import { useState } from 'react'
import moment from 'moment';
import { AuthContext } from '../context/authContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {AiFillDownCircle} from "react-icons/ai"
import Popup from './PopUp';

const CollectionComment = ({col_id, loadCollection}) => {

console.log("col_id", col_id)

const { currentUser } = useContext(AuthContext);
console.log("current user is ", currentUser)

const navigate = useNavigate();

const [comment, setComment] = useState('');
const [data, setData] = useState([]);
const [popUp, setPopUp] = useState(false);


const handleSubmit = (e)=>{
    e.preventDefault();
    if(!comment ) {
        console.log("Enter values");
    } else {
            console.log(comment, col_id, currentUser.username)
            axios.post ('https://deployserver-production-e464.up.railway.app/addcollectioncomment', {
                comment,
                recorded_date : moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                recorded_by: currentUser.username,
                col_id: col_id
            }).then(()=>{
                setComment('')
                navigate('/collection')
                setTimeout(() => {
                    loadData();
                }, 500);
                setPopUp(true)
            }).catch((err)=>{
                console.log(err);
            })
        }
}

const loadData = async () => {
    console.log(col_id)
    const response = await axios.get(`https://deployserver-production-e464.up.railway.app/getcollectioncomments/${col_id}`);
    setData(response.data);
    
}

  return (
        <div className='comments'>
                <div className="comment">
                    <div className="heading">
                     <h3>Follow ups</h3>
                     <Popup trigger={popUp} setTrigger={setPopUp} id={col_id} loadCollection={loadCollection}/>
                     <button onClick={loadData}><AiFillDownCircle/></button> 
                    </div>
                    {data && <div className='comment-section'>
                        {data.map((comment)=>{
                        return (
                        <div className="comments-map" key={comment.comment_id}>
                            <div className="single-comment">
                                <p>{comment.comment}</p>
                            </div>
                            <div className="user-details">
                                <p>{comment.recorded_by}</p>
                                <p>{moment(comment.recorded_date).format('D MMMM YYYY, dddd')}</p>
                            </div>
                        </div>
                        )
                        })}
                    </div>}
                 <form action="">
                    <textarea 
                    name="comment" 
                    value={comment}
                    id="comment" 
                    cols="67" 
                    rows="1"
                    placeholder="Comment"
                    onChange={(e)=>{setComment(e.target.value)}} 
                     />
                    <button onClick={handleSubmit}>Submit</button>         
                 </form>
                 </div>            
        </div>
  )
}
export default CollectionComment;
