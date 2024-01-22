import { useState, useEffect } from "react";
import { Link} from "react-router-dom";
import './Cheques.css'
import axios from "axios";
import Edit from '../img/edit.png'
import Delete from '../img/delete.png'
import moment from 'moment';


const Cheques = () => {
    const [data, setData] = useState([]);

    const loadData = async () => {
        const response = await axios.get('https://deployserver-production-e464.up.railway.app/getcheques');
        setData(response.data);
    }

    const handleDelete = (id) =>{
        if(window.confirm('Confirm Delete')) {
            axios.post(`https://deployserver-production-e464.up.railway.app/deletecheque/${id}`);
            setTimeout(()=>loadData(),500);
        }
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
            <div className="add-staff">
                <Link to="/addcheque">
                    <button className="btn btn-staff">Add Cheque</button>
                </Link>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <td text-align="center">S.No</td>
                        <td text-align="center">Cheque Number</td>
                        <td text-align="center">Cheque Date</td>
                        <td text-align="center">Supplier Name</td>
                        <td text-align="center">Amount</td>
                        <td text-align="center">Edit</td>
                    </tr>
                </thead>
                <tbody>
                    {data.sort(byDate).map((item, index)=>{
                        return (
                            <tr key={item.id}>
                                <th scope="row">{index+1}</th>
                                <td>{item.chq_no}</td>
                                <td>{moment(item.chq_date).format('D MMMM YYYY, dddd')}</td>
                                
                                <td>{item.supplier_name}</td>
                                <td>{item.chq_amnt}</td>
                                <td>
                                    <Link to={`/editcheque/${item.chq_issue_id}` }>
                                        <img src={Edit} alt="" />
                                    </Link>
                                    <button className="btn btn-delete" onClick={()=>handleDelete(item.chq_issue_id)}><img src={Delete} alt="" /></button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
     );
}
 
export default Cheques;