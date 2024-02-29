import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_URL from './apiConfig'; // Adjust the path based on your project structure
import Sidebar from './Sidebar';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';
function AdminTransactionMethodPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
    const [transactionMethod, setTransactionMethod] = useState({
      coinPrice: '',
      interestRate: '',
      upi: '',
      bitcoinWallet: '',
      usdtDetails: '',
      referralCommission: ''
    });
  
    useEffect(() => {
      const fetchTransactionMethod = async () => {
        const jwt = localStorage.getItem('admintoken');
        const response = await axios.get(`${API_URL}/admin/transaction-method`, {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        });
        setTransactionMethod(response.data);
      };
  
      fetchTransactionMethod();
    }, []);
  
    const handleChange = (event) => {
      setTransactionMethod({
        ...transactionMethod,
        [event.target.name]: event.target.value
      });
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      const jwt = localStorage.getItem('admintoken');
      const response = await axios.put(`${API_URL}/admin/transaction-method`, transactionMethod, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
  
      if (response.status === 200) {
        // alert('Transaction method details updated successfully!');
        toast.success('Transaction method details updated successfully!');

      } else {
        // alert('Failed to update transaction method details.');
        toast.error('Failed to update transaction method details.');

      }
    };
  
    return (
      <>    <ToastContainer />

      <div className="d-flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="container-fluid">
        <h1 className="text-center my-4">Admin Transaction Method Page</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Coin Price</label>
            <input type="number" className="form-control" name="coinPrice" value={transactionMethod.coinPrice} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Interest Rate</label>
            <input type="number" className="form-control" name="interestRate" value={transactionMethod.interestRate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>UPI</label>
            <input type="text" className="form-control" name="upi" value={transactionMethod.upi} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Bitcoin Wallet</label>
            <input type="text" className="form-control" name="bitcoinWallet" value={transactionMethod.bitcoinWallet} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>USDT Details</label>
            <input type="text" className="form-control" name="usdtDetails" value={transactionMethod.usdtDetails} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Referral Commission</label>
            <input type="number" className="form-control" name="referralCommission" value={transactionMethod.referralCommission} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      </div>
      </div>
    </>
    );
  }
  

export default AdminTransactionMethodPage;
