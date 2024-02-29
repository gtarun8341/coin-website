import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_URL from './apiConfig'; // Adjust the path based on your project structure
import MyNavbar from './MyNavbar';
import { Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';
function HomePage() {
  const [userData, setUserData] = useState(null);
  const [coinsToBuy, setCoinsToBuy] = useState('');
  const [referCode, setReferCode] = useState('');
  const [coinsToShare, setCoinsToShare] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [referrals, setReferrals] = useState([]);
  const navigate = useNavigate();
  const [transactionMethod, setTransactionMethod] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [interestTransactions, setInterestTransactions] = useState([]);
  const [referralCommissions, setReferralCommissions] = useState([]); // New state for referral commissions
  const [userTransactions, setUserTransactions] = useState([]);
// Add these state variabless
const [mobileNumber, setMobileNumber] = useState('');
const [selectedUser, setSelectedUser] = useState(null);
const [shareAmount, setShareAmount] = useState(0);
const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data)
        setUserData(response.data);
        setNewUsername(response.data.username);

        // Fetch referrals when user data is available
        fetchReferrals(response.data.referrals);
        fetchReferralCommissions(response.data.referralCommission);
        fetchUserTransactions();

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);
  const fetchUserTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch user transactions
      const userTransactionsResponse = await axios.get(`${API_URL}/user-transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(userTransactionsResponse.data)
      setUserTransactions(userTransactionsResponse.data);
    } catch (error) {
      console.error(error);
    }
  };
  

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
  
  useEffect(() => {
    const fetchInterestTransactions = async () => {
      console.log(`${API_URL}/interest-transactions/${userData?._id}`)

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/interest-transactions/${userData?._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInterestTransactions(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchInterestTransactions();
  }, [userData]);

  const fetchReferrals = async (referralIds) => {
    try {
      const token = localStorage.getItem('token');
  
      const referralPromises = referralIds.map(async (referralId) => {
        const referralResponse = await axios.get(`${API_URL}/referral/${referralId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return referralResponse.data;
      });
  
      const referralData = await Promise.all(referralPromises);
      setReferrals(referralData);
    } catch (error) {
      console.error(error);
    }
  };
  const fetchReferralCommissions = async (referralCommissionIds) => {
    try {
      const token = localStorage.getItem('token');
  
      const commissionPromises = referralCommissionIds.map(async (commissionId) => {
        const commissionResponse = await axios.get(`${API_URL}/referral-commission/${commissionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return commissionResponse.data;
      });
  
      const commissionData = await Promise.all(commissionPromises);
      setReferralCommissions(commissionData);
    } catch (error) {
      console.error(error);
    }
  };

  const buyCoins = () => {
    navigate('/buy', { state: { coins: coinsToBuy } });
  };

  // const shareCoins = async () => {
  //   const jwt = localStorage.getItem('token');
  //   const response = await axios.post(
  //     `${API_URL}/share`,
  //     {
  //       referCode,
  //       coins: coinsToShare,
  //     },
  //     {
  //       headers: {
  //         Authorization: `Bearer ${jwt}`,
  //       },
  //     }
  //   );

  //   if (response.status === 200) {
  //     // alert('Coins shared successfully!');
  //     toast.success('Coins shared successful!');

  //   } else {
  //     // alert('Failed to share coins.');
  //     toast.success('Failed to share coins.');
      
  //   }
  // };
  const validateMobileNumber = async () => {
    try {
      // Reset selectedUser state to null before making the request
      setSelectedUser(null);
  
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/validate-mobile/${mobileNumber}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data) {
        setSelectedUser(response.data);
      } else {
        toast.error('User not found. Please enter a valid mobile number.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error validating mobile number.');
    }
  };
  
  const shareCoins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/share`,
        {
          recipientId: selectedUser.userId,
          coins: shareAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        toast.success('Coins shared successfully!');
      } else {
        toast.error('Failed to share coins.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error sharing coins.');
    }
  };
    
  const saveChanges = async () => {
    const jwt = localStorage.getItem('token');
    const response = await axios.put(
      `${API_URL}/user`,
      {
        username: newUsername,
        password: newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (response.status === 200) {
      setUserData({ ...userData, username: newUsername });
      setEditMode(false);
      // alert('Profile updated successfully!');
      toast.success('Profile updated successful!');

    } else {
      // alert('Failed to update profile.');
      toast.error('Failed to update profile.');

    }
  };

  const copyToClipboard = () => {
    const referralLink = `${window.location.origin}/register?referCode=${userData.referCode}`;
    navigator.clipboard.writeText(referralLink)
      .then(() => setCopySuccess('Copied to clipboard!'))
      .catch(() => setCopySuccess('Copy to clipboard failed!'));
  };
  if (!userData) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
        <p className="mt-3">Loading user data...</p>
      </div>
    );
  }

  return (
    <>    <ToastContainer />

    <div> 
                 <MyNavbar />
    <div className="container">
      <h1 className="text-center my-4">Home Page</h1>
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h2>User Details</h2>
            </div>
            <div className="card-body">
              {editMode ? (
                <>
                  <div className="form-group mb-3">
                    <input type="text" className="form-control" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                  </div>
                  <div className="form-group mb-3">
                    <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
                  </div>
                  <button className="btn btn-primary" onClick={saveChanges}>
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                <p style={{ marginBottom: '10px' }}>Username: {userData.username}</p>
                <p style={{ marginBottom: '10px' }}>Email: {userData.email}</p>
                <p style={{ marginBottom: '10px' }}>Mobile Number: {userData.mobileNumber}</p>
                <p style={{ marginBottom: '10px' }}>Used Refer Code: {userData.usedReferCode}</p>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <p style={{ marginBottom: '0' }}>My Refer Code: {userData.referCode}</p>
                  {userData.referCode && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span
                        role="button"
                        onClick={copyToClipboard}
                        style={{ cursor: 'pointer', padding: '5px', verticalAlign: 'middle' }}
                      >
                        📋
                      </span>
                      {copySuccess && (
                        <p style={{ marginLeft: '5px', marginBottom: '0', verticalAlign: 'middle' }}>{copySuccess}</p>
                      )}
                    </div>
                  )}
                </div>
                {referrals.length > 0 && (
                  <>
                    <p style={{ marginBottom: '10px' }}>Referrals:</p>
                    <ul style={{ marginBottom: '10px' }}>
                      {referrals.map((referral) => (
                        <li key={referral._id}>{referral.username}</li>
                      ))}
                    </ul>
                  </>
                )}
                <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                  Edit Profile
                </button>
              </>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h2>Coin Details</h2>
            </div>
            <div className="card-body">
              <p>Coin Price: 1 Coin = {transactionMethod?.coinPrice} Rupees</p>
              <p>INTRESTRATE = {transactionMethod?.interestRate} </p>
              <p>YOUR TARGETCOIN : {userData.coins} TC</p>
              <div className="form-group mb-3">
  <input
    type="number"
    className="form-control"
    value={coinsToBuy}
    onChange={(e) => setCoinsToBuy(Math.max(0, e.target.value))}
    placeholder={coinsToBuy === 0 ? 'Enter the number of coins to buy' : ''}
  />
</div>
{coinsToBuy === 0 && (
  <p style={{ color: 'red' }}>Please enter a value greater than 0.</p>
)}
<button
  className="btn btn-primary mb-3"
  onClick={buyCoins}
  disabled={coinsToBuy === 0} // Disable the button if coinsToBuy is 0
>
  Buy Coins
</button>

              {/* <div className="form-group mb-3">
                <input type="text" className="form-control" value={referCode} onChange={(e) => setReferCode(e.target.value)} placeholder="Refer code of the user to share coins with" />
              </div>
              <div className="form-group mb-3">
                <input type="number" className="form-control" value={coinsToShare} onChange={(e) => setCoinsToShare(e.target.value)} placeholder="Number of coins to share" />
              </div>
              <button className="btn btn-primary" onClick={shareCoins}>
                Share Coins
              </button> */}
              <div className="form-group mb-3">
  <label>Enter Mobile Number to Share Coins:</label>
  <div className="input-group">
    <input type="text" className="form-control" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
    <button className="btn btn-outline-secondary" onClick={validateMobileNumber}>Validate</button>
  </div>
</div>

{selectedUser ? (
  <>
    <div>
      <p>Name: {selectedUser.username}</p>
      <p>Mobile: {selectedUser.mobileNumber}</p>
    </div>
    <div className="form-group mb-3">
      <input
        type="number"
        className="form-control"
        value={shareAmount}
        onChange={(e) => setShareAmount(e.target.value)}
        placeholder="Enter Amount to Share"
      />
    </div>
    <button className="btn btn-primary" onClick={shareCoins}>
      Share Coins
    </button>
  </>
) : (
  <p>User not found. Please enter a valid mobile number.</p>
)}
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h2>Interest Transactions</h2>
            </div>
            <div className="card-body">
              {interestTransactions.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Coins</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interestTransactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td>{transaction.coins}</td>
                        <td>{transaction.amount}</td>
                        <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No interest transactions found.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h2>Referral Commissions</h2>
            </div>
            <div className="card-body">
              {referralCommissions.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      {/* Add more headers as needed */}
                    </tr>
                  </thead>
                  <tbody>
                    {referralCommissions.map((commission) => (
                      <tr key={commission._id}>
                        <td>{commission.username}</td>
                        {/* Add more columns as needed */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No referral commissions found.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h2>User Transactions</h2>
            </div>
            <div className="card-body">
              {userTransactions.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Coins</th>
                      <th>Amount</th>
                      <th>Approved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userTransactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td>{transaction.transactionId}</td>
                        <td>{transaction.coins}</td>
                        <td>{transaction.amount}</td>
                        <td>{transaction.approved ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No transactions found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
</>
  );
}

export default HomePage;
