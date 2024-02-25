import { useState, useEffect, useContext } from "react";
import { Link, Navigate} from "react-router-dom";
import './Cheques.css'
import axios from "axios";
import Edit from '../img/edit.png'
import Delete from '../img/delete.png'
import moment from 'moment';
import Login from "./Login";
import { AuthContext } from "../context/authContext";


const Stationary = () => {
    const [data, setData] = useState([]);
    const {currentUser, logout} = useContext(AuthContext);
    const [editPaid, setEditPaid] = useState('')
    const [datePaid, setDatePaid] = useState('')

    const loadData = async () => {
        // const response = await axios.get('https://deployserver-production-e464.up.railway.app/getcheques');
        const response = await axios.get('https://octopus-app-l59s5.ondigitalocean.app/stationaries/');
        setData(response.data);
    }

    const handleDelete = (id) =>{
        if(window.confirm('Confirm Delete')) {
            axios.post(`https://octopus-app-l59s5.ondigitalocean.app/deletestationary/${id}`);
            setTimeout(()=>loadData(),500);
        }
    }

    const handleEdit = (id) =>{
        setEditPaid(id)
        console.log(id)
    }

    const handleSubmitPaid = (id) =>{
        console.log(id)
        console.log("Paid date is ", datePaid)
        axios.put (`https://octopus-app-l59s5.ondigitalocean.app/editstationarypaid/${id}`, {
                    date_paid: datePaid
                }).then(()=>{
                    setDatePaid('')
                    setEditPaid('')
                    loadData()
                    Navigate('/stationary')
                }).catch((err)=>{
                    console.log(err.message);
                })
    }

    useEffect (()=>{
        loadData();
    },[])

    const byDate =(a, b) =>{
        let d1 = new Date (a.chq_date);
        let d2 = new Date (b.chq_date);
        if (d1.getUTCMonth() > d2.getUTCMonth()) {
            return 1;
        } else if (d1.getUTCMonth() < d2.getUTCMonth()) {
            return 0;
        } else {
           return d1.getUTCDate() - d2.getUTCDate();
        }
    }

    return ( 
        <div>  
        
        {
            currentUser ?
            <div>
            <div className="add-staff">
                <Link to="/addstationary">
                    <button className="btn btn-staff">Add Invoice</button>
                </Link>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <td text-align="center">S.No</td>
                        <td text-align="center">Supplier Name</td>
                        <td text-align="center">Invoice Number</td>
                        <td text-align="center">Invoice Date</td>
                        <td text-align="center">Amount</td>
                        <td text-align="center">Payment</td>
                        <td text-align="center">Edit</td>
                    </tr>
                </thead>
                <tbody>
                    {data.sort(byDate).map((item, index)=>{
                        return (
                            <tr key={item.id}>
                                <th scope="row">{index+1}</th>
                                <td>{item.supplier_name}</td>
                                <td>{item.invoice_number}</td>
                                <td>{moment(item.invoice_date).format('D MMMM YYYY')}</td>
                                <td>{item.invoice_amnt}</td>
                                {editPaid!=item.stationary_id && <td onClick={()=>handleEdit(item.stationary_id)} style={{cursor: "pointer"}}>{item.date_paid?moment(item.date_paid).format('D MMMM YYYY'):"Pending"}</td> }
                                {editPaid===item.stationary_id && <td style={{cursor: "pointer"}}>
                                    <input onChange={e=>setDatePaid(e.target.value)} type="date"></input>
                                    <button onClick={()=>handleSubmitPaid(item.stationary_id)}>Save</button>
                                </td> }
                                
                                <td>
                                    <Link to={`/editstationary/${item.stationary_id}` }>
                                        <img src={Edit} alt="" />
                                    </Link>
                                    <button className="btn btn-delete" onClick={()=>handleDelete(item.stationary_id)}><img src={Delete} alt="" /></button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table> </div> : <Login/>}
            
        </div>
     );
}
 
export default Stationary;