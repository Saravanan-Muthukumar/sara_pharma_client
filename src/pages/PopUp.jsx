import axios from 'axios';
import React from 'react'
import { useState } from 'react';
import { Navigate } from 'react-router-dom';


const Popup = (props) => {

    const initialState = {
        followup_date: ""
    }

    const [followUp, setFollowUp] = useState(false)
    const [confirmation, setConfirmation] = useState(true)
    const [payment, setPayment] = useState(false)
    const [state, setState] = useState(initialState);
    const {followup_date} = state;

    const handleInputChange = (e)=>{
        const {name, value} =e.target;
        setState({...state, [name]:value});
      }

    const handleClickYes = ()=>{
        console.log("yes")
        setFollowUp(true)
        setConfirmation(false)
        setPayment(false)
    }
    const handleClickNo = ()=>{
        console.log("No")
        setFollowUp(false)
        setConfirmation(false)
        setPayment(true)
    }

    const handleClose = () =>{
        props.setTrigger(false)
        setFollowUp(false)
        setConfirmation(true)
        setFollowUp(false)
        setPayment(false)
    }

    const handleSubmitFollowUp = (e)=>{
        e.preventDefault();
                  axios.put (`https://deployserver-production-e464.up.railway.app/editcollectionFollowUp/${props.id}`, {
                  followup_date 
                }).then(()=>{
                    handleClose()
                    props.loadCollection();
                    Navigate('/collection')
                }).catch((err)=>{
                    console.log(err);
                }) 
      }
    const handleSubmitStatus = (e)=>{
                 e.preventDefault();
                  axios.put (`https://deployserver-production-e464.up.railway.app/editcollectionStatus/${props.id}`, {
                  status : "Payment Received"
                }).then(()=>{
                    handleClose()
                    props.loadCollection();
                    Navigate('/collection')
                }).catch((err)=>{
                    console.log(err);
                }) 
      }

  return ( props.trigger) ? (
    <div className='popup'>
      <div className="popup-inner">
        
        {confirmation &&
        <form action="" class="confirmation">
          <label htmlFor="" >Follow up needed</label>
            <button class = 'btn-yes' onClick={handleClickYes}>Yes</button>
            <button class= 'btn-yes' onClick={handleClickNo}>No</button>
        </form>}
        {followUp && 
        <form onSubmit={handleSubmitFollowUp} class="followup">
            <label htmlFor="">Next follow up on</label>
            <input 
          type="Date" 
          id="followup_date"
          name="followup_date"
          required
          onChange={handleInputChange}
          />
            <button class= 'btn-yes' type='submit'>Submit</button>

        </form>}
        {payment && 
        <form class="status">
            <label htmlFor="">Payment received</label>
            <button class= 'btn-yes' onClick={handleSubmitStatus}>Yes</button>
            <button class= 'btn-yes' onClick={handleClickYes}>No</button>
        </form>}
        {props.children}
      </div>
    </div>
  ) : "";
}
export default Popup;
