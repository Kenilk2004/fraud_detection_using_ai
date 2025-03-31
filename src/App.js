import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate
} from 'react-router-dom';
import './App.css';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement, // Add this for pie charts
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { v4 as uuidv4 } from 'uuid';

// Mock data for transactions
const mockTransactions = [
];

// Mock categories for transactions
const categories = ['Salary', 'Shopping', 'Food', 'Entertainment', 'Transfer', 'Bills', 'Health', 'Travel', 'Other'];

function App() {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    isAdmin: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Logout function to clear user data and reset auth state
  const logout = () => {
    setAuthState({ isLoggedIn: false, isAdmin: false });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Check authentication state on app load
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (user && token) {
      setAuthState({
        isLoggedIn: true,
        isAdmin: user.role === 'admin',
      });
    }
    setIsLoading(false); // Authentication check is complete
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        {/* Sidebar is only visible when the user is logged in */}
        {authState.isLoggedIn && (
          <Sidebar logout={logout} isAdmin={authState.isAdmin} />
        )}
        <div className="content">
          <Routes>
            {/* Routes for unauthenticated users */}
            {!authState.isLoggedIn ? (
              <>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login setAuthState={setAuthState} />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            ) : (
              <>
                {/* Routes for admin users */}
                {authState.isAdmin ? (
                  <>
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/admin/transactions" element={<AdminTransactions />} />
                    <Route path="/admin/suspicious-transactions" element={<AdminSuspiciousTransactions />} />
                    <Route path="/admin/fraud-transactions" element={<AdminFraudTransactions />} />
                    <Route path="/admin/block-user" element={<AdminBlockUser />} />
                    <Route path="*" element={<Navigate to="/admin" />} />
                  </>
                ) : (
                  <>
                    {/* Routes for regular users */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/add-transaction" element={<AddTransaction />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </>
                )}
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function Sidebar({ logout, isAdmin }) {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>SecureBank</h2>
      </div>
      <nav>
        <ul>
          {isAdmin ? (
            <>
              <li><Link to="/admin/transactions">Transactions</Link></li>
              <li><Link to="/admin/suspicious-transactions">Suspicious Transactions</Link></li>
              <li><Link to="/admin/fraud-transactions">Fraud Transactions</Link></li>
              <li><Link to="/admin/block-user">Block User</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/transactions">Transactions</Link></li>
              <li><Link to="/add-transaction">Add Transaction</Link></li>
              <li><Link to="/settings">Settings</Link></li>
            </>
          )}
          <li><button onClick={logout}>Logout</button></li>
        </ul>
      </nav>
    </div>
  );
}

function AdminPanel() {
  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <p>Welcome to the admin panel. Use the sidebar to navigate through admin functionalities.</p>
    </div>
  );
}

function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/transactions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        } else {
          console.error('Failed to fetch transactions');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="admin-transactions">
      <h1>All Transactions</h1>
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Recipient</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>{transaction.recipient}</td>
              <td>${transaction.amount.toFixed(2)}</td>
              <td>{transaction.merchantCategory}</td>
              <td>{transaction.type}</td>
              <td>{transaction.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminSuspiciousTransactions() {
  const [suspiciousTransactions, setSuspiciousTransactions] = useState([]);

  useEffect(() => {
    const fetchSuspiciousTransactions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/transactions/suspicious', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSuspiciousTransactions(data);
        } else {
          console.error('Failed to fetch suspicious transactions');
        }
      } catch (error) {
        console.error('Error fetching suspicious transactions:', error);
      }
    };

    fetchSuspiciousTransactions();
  }, []);

  return (
    <div className="admin-suspicious-transactions">
      <h1>Suspicious Transactions</h1>
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Recipient</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {suspiciousTransactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>{transaction.recipient}</td>
              <td>${transaction.amount.toFixed(2)}</td>
              <td>{transaction.merchantCategory}</td>
              <td>{transaction.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminFraudTransactions() {
  const [fraudTransactions, setFraudTransactions] = useState([]);

  useEffect(() => {
    const fetchFraudTransactions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/transactions/fraud', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFraudTransactions(data);
        } else {
          console.error('Failed to fetch fraud transactions');
        }
      } catch (error) {
        console.error('Error fetching fraud transactions:', error);
      }
    };

    fetchFraudTransactions();
  }, []);

  return (
    <div className="admin-fraud-transactions">
      <h1>Fraud Transactions</h1>
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Recipient</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {fraudTransactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>{transaction.recipient}</td>
              <td>${transaction.amount.toFixed(2)}</td>
              <td>{transaction.merchantCategory}</td>
              <td>{transaction.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminBlockUser() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const blockUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/block/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        alert('User blocked successfully');
        setUsers(users.filter((user) => user._id !== userId));
      } else {
        console.error('Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  return (
    <div className="admin-block-user">
      <h1>Block User</h1>
      <table className="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => blockUser(user._id)}>Block</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FraudDetectionModal({ transaction, onClose }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Transaction Details</h2>
        <p><strong>Transaction ID:</strong> {transaction.id}</p>
        <p><strong>Date:</strong> {transaction.date}</p>
        <p><strong>Recipient:</strong> {transaction.recipient}</p>
        <p><strong>Amount:</strong> ${transaction.amount.toFixed(2)}</p>
        <p><strong>Category:</strong> {transaction.merchantCategory}</p>
        <p><strong>Type:</strong> {transaction.type}</p>
        <p><strong>Status:</strong> {transaction.status}</p>
        <p><strong>Description:</strong> {transaction.description}</p>

        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
          <button className="approve-btn">Approve</button>
          <button className="reject-btn">Reject</button>
        </div>
      </div>
    </div>
  );
}

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function Dashboard({ transactions = [] }) {
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    flaggedTransactions: 0,
  });

  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Retrieve the user's name from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.username) {
      setUserName(user.username);
    }
  }, []);

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      return;
    }

    // Calculate dashboard statistics
    const income = transactions
      .filter((t) => t.transactionType === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.transactionType === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const flagged = transactions.filter((t) => t.Fraudulent_probability > 0.5).length;

    setStats({
      totalBalance: income - expenses,
      totalIncome: income,
      totalExpenses: expenses,
      flaggedTransactions: flagged,
    });
  }, [transactions]);

  // Prepare data for the pie chart
  const categories = [
    'Groceries',
    'Gaming',
    'Travel',
    'Luxury Goods',
    'Electronics',
    'Retail',
  ];

  const CategoryData = categories.map((Category) => {
    return transactions
      .filter((transaction) => transaction.merchantCategory === Category)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  });

  const pieChartData = {
    labels: categories,
    datasets: [
      {
        label: 'Transaction Amount ($)',
        data: CategoryData,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Transaction Amounts by Category',
      },
    },
  };

  if (!transactions || transactions.length === 0) {
    return <p>No transactions available.</p>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {userName}!</h1>

      {/* Statistics Section */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Balance</h3>
          <p className="stat-value">${stats.totalBalance.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Total Income</h3>
          <p className="stat-value">${stats.totalIncome.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <p className="stat-value">${stats.totalExpenses.toFixed(2)}</p>
        </div>
        <div className="stat-card warning">
          <h3>Flagged Transactions</h3>
          <p className="stat-value">{stats.flaggedTransactions}</p>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="recent-transactions">
        <div className="section-header">
          <h2>Recent Transactions</h2>
          <Link to="/transactions" className="view-all">
            View All
          </Link>
        </div>
        <div className="transactions-list">
          {transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.transactionId}
              className={`transaction-item ${
                transaction.Fraudulent_probability > 0.5 ? 'flagged' : ''
              }`}
            >
              <div className="transaction-icon">
                {transaction.transactionType === 'credit' ? '+' : '-'}
              </div>
              <div className="transaction-details">
                <h4>{transaction.receiverId}</h4>
                <p>{transaction.merchantCategory}</p>
                <small>
                  {new Date(transaction.timestamp).toLocaleString()} • {transaction.city}
                </small>
              </div>
              <div className="transaction-amount">
                <p
                  className={
                    transaction.transactionType === 'credit' ? 'credit' : 'debit'
                  }
                >
                  {transaction.transactionType === 'credit' ? '+' : '-'}$
                  {transaction.amount.toFixed(2)}
                </p>
                {transaction.Fraudulent_probability > 0.5 && (
                  <span className="flag-indicator">⚠️ Flagged</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pie Chart Section */}
      <div className="pie-chart">
        <h2>Transaction Summary by Category</h2>
        <Pie data={pieChartData} options={pieChartOptions} />
      </div>
    </div>
  );
}
function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // Default sorting order

  // Fetch transactions from the backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/transactions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTransactions(data); // Set the transactions from the backend
          setFilteredTransactions(data); // Initialize filtered transactions
        } else {
          console.error('Failed to fetch transactions');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  // Filter and sort transactions based on search and filter criteria
  useEffect(() => {
    let results = transactions;

    // Apply search
    if (searchTerm) {
      results = results.filter((t) =>
        t.senderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.receiverId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.merchantCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filter
    if (filter !== 'all') {
      if (filter === 'flagged') {
        results = results.filter((t) => t.status === 'flagged');
      } else if (filter === 'credit') {
        results = results.filter((t) => t.transactionType === 'credit');
      } else if (filter === 'debit') {
        results = results.filter((t) => t.transactionType === 'debit');
      }
    }

    // Apply sorting
    results = results.sort((a, b) => {
      if (sortOrder === 'asc') {
        return new Date(a.timestamp) - new Date(b.timestamp);
      } else {
        return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

    setFilteredTransactions(results); // Update filtered transactions
  }, [searchTerm, filter, sortOrder, transactions]);

  return (
    <div className="transactions-page">
      <h1>Transactions</h1>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-options">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Transactions</option>
            <option value="flagged">Flagged</option>
            <option value="credit">Income</option>
            <option value="debit">Expenses</option>
          </select>
        </div>
        <div className="sort-options">
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>City</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr
                key={transaction.transactionId}
                className={transaction.status === 'flagged' ? 'flagged-row' : ''}
              >
                <td>{transaction.transactionId}</td>
                <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                <td>{transaction.senderId}</td>
                <td>{transaction.receiverId}</td>
                <td
                  className={
                    transaction.transactionType === 'credit' ? 'credit' : 'debit'
                  }
                >
                  {transaction.transactionType === 'credit' ? '+' : '-'}$
                  {transaction.amount.toFixed(2)}
                </td>
                <td>{transaction.transactionType}</td>
                <td>{transaction.merchantCategory}</td>
                <td>{transaction.city}</td>
                <td>
                  <span className={`status-badge ${transaction.status}`}>
                    {transaction.status}
                    {transaction.status === 'flagged' && ' ⚠️'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



 // Import UUID for generating unique IDs



 function AddTransaction({ addTransaction }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    transactionId: uuidv4(), // Generate a unique transaction ID
    timestamp: new Date().toISOString(), // Default to current timestamp
    senderId: '', // Will be fetched from localStorage
    receiverId: '',
    recipient: '', // New field for recipient
    amount: '',
    transactionType: 'ATM Withdrawal', // Default transaction type
    location: '',
    device: 'Unknown Device', // Default device
    ipAddress: '',
    merchantCategory: 'Groceries', // Default merchant Category
    city: '',
    accountType: 'Current', // Default account type
    Fraudulent_probability: 0.0, // Default fraud probability
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve userID from localStorage and set it as senderId
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.userId) {
          console.log('Retrieved userID:', user.userId); // Debugging
          setFormData((prevData) => ({ ...prevData, senderId: user.userId }));
        } else {
          console.error('userID not found in localStorage');
        }

        // Fetch user's IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          setFormData((prevData) => ({ ...prevData, ipAddress: ipData.ip }));
        }

        // Fetch user's current location and city
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const locationData = await response.json();
            setFormData((prevData) => ({
              ...prevData,
              location: `${latitude}, ${longitude}`,
              city: locationData.city || 'Unknown',
            }));
          } catch (error) {
            console.error('Error fetching location:', error);
          }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateFormData = () => {
    const requiredFields = {
      transactionId: 'Transaction ID',
      timestamp: 'Timestamp',
      senderId: 'Sender ID',
      receiverId: 'Receiver ID',
      recipient: 'Recipient', // Validate recipient
      amount: 'Amount',
      transactionType: 'Transaction Type',
      merchantCategory: 'Category', // Validate Category
      accountType: 'Account Type',
      Fraudulent_probability: 'Fraudulent Probability',
    };

    for (const [field, fieldName] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        alert(`Please fill in the required field: ${fieldName}`);
        return false;
      }
    }

    if (formData.amount <= 0) {
      alert('Amount must be greater than 0');
      return false;
    }

    if (formData.Fraudulent_probability < 0 || formData.Fraudulent_probability > 1) {
      alert('Fraudulent probability must be between 0 and 1');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormData()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        addTransaction(data.transaction); // Update the state with the new transaction
        alert('Transaction added successfully!');
        navigate('/transactions');
      } else {
        const errorData = await response.json();
        console.error('Validation Error:', errorData);
        alert(`Failed to add transaction: ${errorData.message || 'Validation failed'}`);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="add-transaction">
      <h1>Add New Transaction</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Receiver ID</label>
          <input
            type="text"
            name="receiverId"
            value={formData.receiverId}
            onChange={handleChange}
            placeholder="Enter receiver ID"
            required
          />
        </div>
        <div className="form-group">
          <label>Recipient</label>
          <input
            type="text"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            placeholder="Enter recipient name"
            required
          />
        </div>
        <div className="form-group">
          <label>Amount ($)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Transaction Type</label>
          <select
            name="transactionType"
            value={formData.transactionType}
            onChange={handleChange}
            required
          >
            <option value="Online">Online</option>
            <option value="ATM Withdrawal">ATM Withdrawal</option>
            <option value="POS Payment">POS Payment</option>
            <option value="Cryptocurrency">Cryptocurrency</option>
            <option value="Wire Transfer">Wire Transfer</option>
          </select>
        </div>
        <div className="form-group">
          <label>Device</label>
          <select
            name="device"
            value={formData.device}
            onChange={handleChange}
          >
            <option value="Unknown Device">Unknown Device</option>
            <option value="Mobile">Mobile</option>
            <option value="Desktop">Desktop</option>
            <option value="ATM">ATM</option>
          </select>
        </div>
        <div className="form-group">
          <label>Merchant Category</label>
          <select
            name="merchantCategory"
            value={formData.merchantCategory}
            onChange={handleChange}
          >
            <option value="Groceries">Groceries</option>
            <option value="Gaming">Gaming</option>
            <option value="Travel">Travel</option>
            <option value="Luxury Goods">Luxury Goods</option>
            <option value="Electronics">Electronics</option>
            <option value="Retail">Retail</option>
          </select>
        </div>
        <div className="form-group">
          <label>Fraudulent Probability</label>
          <input
            type="number"
            name="Fraudulent_probability"
            value={formData.Fraudulent_probability}
            onChange={handleChange}
            step="0.01"
            min="0.00"
            max="1.00"
          />
        </div>
        <div className="form-buttons">
          <button type="button" className="cancel-btn" onClick={() => navigate('/transactions')}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Add Transaction
          </button>
        </div>
      </form>
    </div>
  );
}


function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    blocked: false,
    balance: 10000,
    userNumber: 1, // Default value for blocked status
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Signup successful! Your user number is: ${data.user.userNumber}`);
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(`Signup failed: ${errorData.message}`);
      }
    } catch (error) {
      alert('An error occurred during signup. Please try again.');
    }
  };

  return (
    <div className="signup-page">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>
        <div className="form-buttons">
          <button type="submit" className="submit-btn">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}


function Login({ setAuthState }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();

        // Check if the user is blocked
        if (data.user.blocked) {
          alert('Your account is blocked. Please contact support.');
          return;
        }

        alert('Login successful!');

        // Store user and token in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        // Save the userID separately for easy access
        localStorage.setItem('userID', data.user._id);

        // Set auth state based on user role
        setAuthState({ isLoggedIn: true, isAdmin: data.user.role === 'admin' });

        // Navigate to the appropriate page
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>
        <div className="form-buttons">
          <button type="submit" className="submit-btn">
            Login
          </button>
        </div>
      </form>
      <div className="signup-link">
        <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
}
function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    app: true
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false
  });
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications({
      ...notifications,
      [name]: checked
    });
  };
  
  const handleSecurityChange = (e) => {
    const { name, checked } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: checked
    });
  };
  
  return (
    <div className="settings">
      <h1>Settings</h1>
      
      <div className="settings-section">
        <h2>Notification Preferences</h2>
        <div className="settings-option">
          <label>
            <input 
              type="checkbox" 
              name="email" 
              checked={notifications.email} 
              onChange={handleNotificationChange}
            />
            Email Notifications
          </label>
          <p>Receive alerts and summaries to your email</p>
        </div>
        
        <div className="settings-option">
          <label>
            <input 
              type="checkbox" 
              name="sms" 
              checked={notifications.sms} 
              onChange={handleNotificationChange}
            />
            SMS Notifications
          </label>
          <p>Get text alerts for suspicious activities</p>
        </div>
        
        <div className="settings-option">
          <label>
            <input 
              type="checkbox" 
              name="app" 
              checked={notifications.app} 
              onChange={handleNotificationChange}
            />
            In-App Notifications
          </label>
          <p>Receive notifications within the application</p>
        </div>
      </div>
      
      <div className="settings-section">
        <h2>Security Settings</h2>
        <div className="settings-option">
          <label>
            <input 
              type="checkbox" 
              name="twoFactor" 
              checked={securitySettings.twoFactor} 
              onChange={handleSecurityChange}
            />
            Two-Factor Authentication
          </label>
          <p>Add an extra layer of security to your account</p>
        </div>
        
        <div className="settings-button">
          <button>Change Password</button>
        </div>
      </div>
    </div>
  );
}



export default App;