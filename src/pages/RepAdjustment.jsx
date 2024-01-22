import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'


const RepAdjustment = () => {
    const [data, setData] = useState([])

    const loadData = async () => {
        const response = await axios.get('https://deployserver-production-e464.up.railway.app/getrepadjustments')
        setData(response.data)
        console.log(data)
    }

    useEffect(()=>{
        loadData();
    },[])
  return (
    
    <div>
      <div className="repAdjustment">
        <table>
            <thead>
                <tr>
                    <td>S.No</td>
                    <td>P.No</td>
                    <td>Date</td>
                    <td>Bill Amount</td>
                    <td>Supplier Name</td>
                    <td>Product</td>
                    <td>Adjustment Amount</td>
                    <td>Status</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>2355</td>
                    <td>23/12/2023</td>
                    <td>5688</td>
                    <td>Shanmuga</td>
                    <td>Rosuvas</td>
                    <td>1255</td>
                    <td>Pending</td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  )
}

export default RepAdjustment
