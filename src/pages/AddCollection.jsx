import { useState, useContext, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import moment from "moment";

const AddCollection = () => {

const navigate = useNavigate();

const initialState = {
    recorded_by: "",
    date_recorded: "",
    followup_date: "",
    customer_name: "",
    status: "",

}

const [state, setState] = useState(initialState);
const {recorded_by, date_recorded, customer_name, followup_date, status} = state;

const { currentUser } = useContext(AuthContext);
console.log("current user is ", currentUser)

const handleInputChange = (e)=>{
  const {name, value} =e.target;
  setState({...state, [name]:value});
}

const {id} = useParams();
console.log("id for purchase issue edit", id)


useEffect(()=>{
  axios.get(`https://deployserver-production-e464.up.railway.app/getcollection/${id}`).then((resp)=>setState({...resp.data}));
},[id]);

console.log(state)

const formatDateForInput = (date) => {
  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() + 0); // Adjusting the date by adding 1 day
  return adjustedDate.toISOString().substr(0, 10);
};

const handleSubmit = (e)=>{
  e.preventDefault();
  if(!date_recorded || !customer_name || !status ) {
      console.log("Enter values");
  } else {
      if(!id){
          console.log("state is ", state)
          axios.post ('https://deployserver-production-e464.up.railway.app/addcollection', {
            recorded_by,
            date_recorded,
            customer_name,
            followup_date,
            status
          }).then(()=>{
              setState({recorded_by: '', date_recorded: '', supplier_name: '', product_name: '', qty:'',issue: '', status: '', description: '', assigned_to: ''  })
              setTimeout(() => {
                navigate('/collection');
              }, 500);
          }).catch((err)=>{
              console.log(err.message);
          })
          
      } else {
          console.log(state)
          axios.put (`https://deployserver-production-e464.up.railway.app/editcollection/${id}`, {
            recorded_by,
            date_recorded : moment(date_recorded).format('YYYY-MM-D'),
            customer_name,
            followup_date : moment(followup_date).format('YYYY-MM-D'),
            status
          }).then(()=>{
              setState({recorded_by: '', date_recorded: '', customer_name: '', followup_date: '', status: ''})
              navigate('/collection')
          }).catch((err)=>{
              console.log(err);
          })  
      }}
}
  return (
    <div className="addpurchaseissue" >
    <h2>{id ? "Edit Collection" : "Add Collection"}</h2>
       
      <div className="purchase-issue-form">
        <form onSubmit={handleSubmit}>
          <label htmlFor="">Date Recorded</label>
          {!date_recorded && <input 
          type="Date" 
          id="date_recorded"
          name="date_recorded"
          required
          onChange={handleInputChange}
          />}
          {date_recorded && <input 
          type="Date" 
          id="date_recorded"
          name="date_recorded"
          defaultValue={formatDateForInput(date_recorded)}
          placeholder="Date"
          onChange={handleInputChange}
          />}
          <label htmlFor="">Follow up Date</label>
          {! followup_date && <input 
          type="Date" 
          id="followup_date"
          name="followup_date"
          required
          onChange={handleInputChange}
          
          />}
          { followup_date &&
          <input 
          type="Date" 
          id="followup_date"
          name="followup_date"
          defaultValue={formatDateForInput(followup_date)}
          placeholder="Date"
          onChange={handleInputChange}
          
          />}
          
          <input 
          type="text" 
          placeholder="Customer Name" 
          id="customer_name"
          name="customer_name"
          value={customer_name || ''}
          onChange={handleInputChange}
          />

          <select name="status" id="status" value={status || "" } onChange={handleInputChange} >
           <option value="Select">Select a Status</option>
            <option value="No Response">No Response</option>
            <option value="Need Direct Visit">Need Direct Visit</option>
            <option value="Follow Up">Follow Up</option>
            <option value="Payment Received">Payment Received</option>
            <option value="Payment Not Tally">Payment Not Tally</option>
            <option value="Cheque Bounced">Cheque Bounced</option>
          </select>
          <input 
            type="text" 
            id="recorded_by"
            name="recorded_by"
            placeholder="Medical Incharge"
            value={recorded_by || ''}
            onChange={handleInputChange}
           />
          <button type="submit" >Submit</button>
          <button onClick={()=>navigate('/collection')} >Cancel</button>
        </form>
      </div>
    </div>
  );
}
export default AddCollection;
