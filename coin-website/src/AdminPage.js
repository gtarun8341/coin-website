import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_URL from './apiConfig'; // Adjust the path based on your project structure
import Sidebar from './Sidebar';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';
function AdminPage() {
  const [transactions, setTransactions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'approved', or 'notApproved'

  useEffect(() => {
    const fetchTransactions = async () => {
      const jwt = localStorage.getItem('admintoken');
      const response = await axios.get(`${API_URL}/admin/transactions`, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
      setTransactions(response.data);
    };

    fetchTransactions();
  }, []);

  const handleApprove = async (transactionId) => {
    const jwt = localStorage.getItem('admintoken');
    const response = await axios.put(`${API_URL}/admin/transactions/${transactionId}/approve`, {}, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    if (response.status === 200) {
      // alert('Transaction approved successfully!');
      toast.success('Transaction approved successfully!');

      setTransactions(transactions.map(transaction =>
        transaction._id === transactionId ? { ...transaction, approved: true } : transaction
      ));
    } else {
      // alert('Failed to approve transaction.');
      toast.error('Failed to approve transaction.');

    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.approved === (filter === 'approved');
  });

  const reversedTransactions = filteredTransactions.slice().reverse();

  return (
    <>    <ToastContainer />

    <div className="d-flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="container-fluid">
        <h1 className="text-center my-4">Admin Page</h1>
        <div className="row">
          <div className="mb-3">
            <label className="form-label">Filter:</label>
            <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Transactions</option>
              <option value="approved">Approved</option>
              <option value="notApproved">Not Approved</option>
            </select>
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Username</th>
                <th>User Transaction ID</th>
                <th>Amount</th>
                <th>Coins</th>
                <th>Payment Option</th> {/* Add this line for the new column */}
                <th>Approved</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reversedTransactions.map(transaction => (
                <tr key={transaction._id}>
                  <td>{transaction._id}</td>
                  <td>{transaction.username}</td>
                  <td>{transaction.transactionId}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.coins}</td>
                  <td>{transaction.paymentOption}</td> {/* Add this line for the new column */}
                  <td>{transaction.approved ? 'Yes' : 'No'}</td>
                  <td>
                    {!transaction.approved && (
                      <button className="btn btn-primary" onClick={() => handleApprove(transaction._id)}>Approve</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}

export default AdminPage;
