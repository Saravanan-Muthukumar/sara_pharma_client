import { useState, useEffect } from "react";
import axios from 'axios';
import { useParams, Link, useNavigate } from "react-router-dom";

const AddEditStationary = () => {

    const initialState = {
        invoice_number: "",
        invoice_date: "",
        supplier_name: "",
        invoice_amnt: "",
        stationary_name:""

    }

    const [state, setState] = useState(initialState);
    const {invoice_number, invoice_date, supplier_name, invoice_amnt, stationary_name} = state;

    const navigate = useNavigate();

    const {id} = useParams();

    useEffect(()=>{
        axios.get(`https://octopus-app-l59s5.ondigitalocean.app/stationary/${id}`).then((resp)=>setState({...resp.data}));
    },[id]);
    console.log(state)

    const handleSubmit = (e)=>{
        e.preventDefault();
        if(!invoice_number || !invoice_date || !supplier_name || !invoice_amnt ) {
            console.log("Enter values");
        } else {
            if(!id){
                axios.post ('https://octopus-app-l59s5.ondigitalocean.app/addstationary', {
                    invoice_number,
                    invoice_date,
                    supplier_name,
                    invoice_amnt,
                    stationary_name
                }).then(()=>{
                    setState({invoice_number: '', invoice_date: '', supplier_name: '', invoice_amnt: ''})
                    navigate('/stationary')
                }).catch((err)=>{
                    console.log(err.message);
                })
                
            } else {
                console.log('put');
                console.log(state)
                axios.put (`https://octopus-app-l59s5.ondigitalocean.app/editstationary/${id}`, {
                    invoice_number,
                    invoice_date,
                    supplier_name,
                    invoice_amnt,
                    stationary_name
                }).then(()=>{
                    setState({invoice_number: '', invoice_date: '', supplier_name: '', invoice_amnt: ''})
                    navigate('/stationary')
                }).catch((err)=>{
                    console.log(err.message);
                })
                
            }
        
    }
}

    const handleInputChange = (e)=>{
        const {name, value} =e.target;
        setState({...state, [name]:value});
    }

    const formatDateForInput = (date) => {
        const adjustedDate = new Date(date);
        adjustedDate.setDate(adjustedDate.getDate() + 0); // Adjusting the date by adding 1 day
        return adjustedDate.toISOString().substr(0, 10);
      };

    return ( 
        <div className="addedit">
            <h2>{id ? "Edit Invoice" : "Add Invoice"}</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text"
                    id="invoice_number"
                    name="invoice_number"
                    placeholder="Invoice Number"
                    value={invoice_number || ''}
                    onChange={handleInputChange}
                 />

                 {!invoice_date && <input 
                    type="date" 
                    id="invoice_date"
                    name="invoice_date"
                    placeholder="Date"
                    onChange={handleInputChange}
                 />}
             
                 {invoice_date && <input 
                    type="date" 
                    id="invoice_date"
                    name="invoice_date"
                    defaultValue={formatDateForInput(invoice_date)}
                    placeholder="Date"
                    onChange={handleInputChange}
                 />}

                 <input 
                    type="text" 
                    id="supplier_name"
                    name="supplier_name"
                    placeholder="Supplier Name"
                    value={supplier_name || ''}
                    onChange={handleInputChange}
                 />
                 <input 
                    type="text" 
                    id="stationary_name)"
                    name="stationary_name"
                    placeholder="Stationary Name"
                    value={stationary_name || ''}
                    onChange={handleInputChange}
                 />
                 <input 
                    type="text" 
                    id="invoice_amnt"
                    name="invoice_amnt"
                    placeholder="Invoice Amount"
                    value={invoice_amnt || ''}
                    onChange={handleInputChange}
                 />
                 <div className="btn-area">
                    <input type="submit" value={id ? "Update" : "Save"} className="btn"/>
                    <Link to="/stationary">
                        <input type="button" value="Go Back" className="btn" />
                    </Link>
                 </div>

            </form>
        </div>
     );
}
 
export default AddEditStationary;