import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_URL from './apiConfig'; // Adjust the path based on your project structure
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';
import MyNavbar from './MyNavbar';

function BuyPage() {
  const location = useLocation();
  const coins = location.state.coins;
  const [transactionId, setTransactionId] = useState('');
  const [selectedPaymentOption, setSelectedPaymentOption] = useState('upi'); // Default to UPI
  const [transactionMethod, setTransactionMethod] = useState(null);

  useEffect(() => {
    const fetchTransactionMethod = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/transaction-method`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTransactionMethod(response.data);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchTransactionMethod();
  }, []);
  

  const handleSend = async () => {
    const jwt = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/transactions`,
      {
        transactionId,
        coins,
        amount: coins * 500,
        paymentOption: selectedPaymentOption,
      },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (response.status === 200) {
      // alert('Transaction details sent successfully!');
      toast.success('Transaction details sent successfully!');

    } else {
      // alert('Failed to send transaction details.');
      toast.success('Failed to send transaction details.');

    }
  };

  return (
    <>    <ToastContainer />
<div>                 <MyNavbar />
    <div className="container">
      <h1 className="text-center my-4">Buy Page</h1>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h2>Transaction Details</h2>
            </div>
            <div className="card-body">
              <p>Number of coins to buy: {coins}</p>
              <p>Total price: {coins * transactionMethod?.coinPrice} Rupees</p>

              {/* Payment Option Selection */}
              <div className="form-group mb-3">
                <label>Select Payment Option:</label>
                <select
                  className="form-control"
                  value={selectedPaymentOption}
                  onChange={(e) => setSelectedPaymentOption(e.target.value)}
                >
                  <option value="upi">UPI</option>
                  <option value="bitcoin">Bitcoin</option>
                  <option value="usdt">USDT</option>
                  {/* Add more payment options as needed */}
                </select>
              </div>

              <p>{selectedPaymentOption.toUpperCase()} ID: {transactionMethod?.[`${selectedPaymentOption}Details`]}</p>

              <div className="form-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter transaction ID"
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={handleSend}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    </>
  );
}

export default BuyPage;
