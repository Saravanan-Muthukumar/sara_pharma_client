import axios from 'axios';
import React, { useContext, useEffect } from 'react'
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import SinglePurchaseIssue from './SinglePurchaseIssue';


const PurchaseIssues = () => {
    const { currentUser } = useContext(AuthContext);
    console.log("current user is ", currentUser)
    const [data, setData] = useState([]);

    const loadData = async () => {
        const response = await axios.get('https://deployserver-production-e464.up.railway.app/getpurchaseissues');
        setData(response.data);
        console.log("purchase issue is ", response.data)
    }

    useEffect (()=>{
        loadData();
    },[])

    const byDate =(a, b) =>{
      let d1 = new Date (a.date_recorded);
      let d2 = new Date (b.date_recorded);
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
      <main>
        <div className="container-purchase-issues">
            <Link to="/addpurchaseissue">
                    <button className="btn">Add Purchase Issue</button>
                </Link>
            <section>
                {data.sort(byDate).map((issue)=>{
                 return (
                    <SinglePurchaseIssue issue={issue} loadData={loadData} />
                 )})
                }
            </section>
        </div>
      </main>
    </div>
  )
}

export default PurchaseIssues
