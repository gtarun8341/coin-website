const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');  // Add this line to include the 'node-cron' library
app.use(cors());
app.use(express.json()); // for parsing application/json

// Connect to MongoDB
mongoose.connect('mongodb+srv://jinxforever8341:5Pnd3AUHYTrdh41v@cluster0.yxs991t.mongodb.net/', {useNewUrlParser: true, useUnifiedTopology: true});
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  referCode: {
    type: String,
    required: true,
    unique: true
  },
  usedReferCode: {
    type: String,
    default: null
  },
  coins: {
    type: Number,
    default: 0
  },
  referrals: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  mobileNumber: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstTransactionDate: {
    type: Date,
    default: null
  },
  referralCommission: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
});


const UserTransactionSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transactionId: {
      type: String,
      required: true
    },
    coins: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    approved: {
      type: Boolean,
      default: false
    },
    paymentOption: {
      type: String,
      required: true,
    },
});

const TransactionMethodSchema = new mongoose.Schema({
  coinPrice: Number,
  interestRate: Number,
  upi: String,
  bitcoinWallet: String,
  usdtDetails: String,
  referralCommission: Number
});

const adminSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const InterestTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  transactionId: {
    type: String,
    required: true
  },
  coins: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a new model for interest transactions
const InterestTransaction = mongoose.model('InterestTransaction', InterestTransactionSchema);

// Create Admin model
const Admin = mongoose.model('Admin', adminSchema);

const TransactionMethod = mongoose.model('TransactionMethod', TransactionMethodSchema);

const UserTransaction = mongoose.model('Transaction', UserTransactionSchema);


const User = mongoose.model('User', UserSchema);
// Middleware to authenticate and authorize admin
const authAdmin = async (req, res, next) => {
  try {
    const admintoken = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(admintoken, 'your-secret-key');

    // Check if the token has the isAdmin property
    if (!decoded.isAdmin) {
      return res.status(403).send('Access denied. Not an admin');
    }

    next();
  } catch (error) {
    res.status(400).send('Invalid token');
  }
};
// Function to generate a unique transaction ID
function generateTransactionId() {
  // Generate a timestamp (milliseconds since epoch)
  const timestamp = new Date().getTime();

  // Generate a random string (using Math.random and converting to base36)
  const randomString = Math.random().toString(36).substring(2, 15);

  // Combine timestamp and random string to create a unique ID
  const transactionId = `${timestamp}_${randomString}`;

  return transactionId;
}
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running task...');

    const transactionMethod = await TransactionMethod.findOne();

    if (transactionMethod) {
      const users = await User.find();

      users.forEach(async (user) => {
        // Calculate interest based on the current coin price, user's coins, and interest rate
        const interest = (user.coins * transactionMethod.coinPrice * transactionMethod.interestRate) / 100;
        console.log(`User: ${user.username}, Interest Rate: ${transactionMethod.interestRate}, Interest: ${interest}`);

        // Calculate the new total amount (original amount + interest)
        const newTotalAmount = user.coins * transactionMethod.coinPrice + interest;

        // Calculate the new number of coins based on the updated total amount and current coin price
        const newCoins = newTotalAmount / transactionMethod.coinPrice;
        console.log(`New Coins: ${newCoins}`);

        // Calculate the increase in coins
        const increasedCoins = newCoins - user.coins;
        console.log(`Increased Coins: ${increasedCoins}`);

        user.coins = newCoins;

        // Save the interest transaction with the increased coins
        const interestTransaction = new InterestTransaction({
          user: user._id,
          transactionId: generateTransactionId(),
          coins: increasedCoins, // Store the increased coins
          amount: interest,
        });

        // Save the interest transaction
        await interestTransaction.save();

        // Save the updated user
        await user.save();
      });

      console.log('Task completed successfully.');
    }
  } catch (error) {
    console.error('Error applying interest:', error);
  }
});

app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  // Find the admin by username
  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.status(400).send('Invalid username or password');
  }

  // Check the password
  if (password !== admin.password) {
    return res.status(400).send('Invalid username or password');
  }

  // Generate a JWT token
  const token = jwt.sign({ _id: admin._id, isAdmin: true }, 'your-secret-key');
  res.send(token);
});


// Define a new route to retrieve interest transactions
app.get('/interest-transactions/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const interestTransactions = await InterestTransaction.find({ user: userId });
    res.json(interestTransactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Get all admins
app.get('/admin/admins', authAdmin, async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add new admin
app.post('/admin/admins', authAdmin, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const newAdmin = new Admin({ username, email, password });
    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to edit an admin
app.put('/admin/admins/:id', authAdmin, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { username, email, password },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error('Error editing admin:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Delete admin by ID
app.delete('/admin/admins/:id', authAdmin, async (req, res) => {
  const adminId = req.params.id;

  try {
    await Admin.findByIdAndDelete(adminId);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.post('/register', async (req, res) => {
//   const {username, password, referCode, email, mobileNumber} = req.body;

//   // Generate a unique referral code for the new user
//   const newReferCode = Math.random().toString(36).substring(2, 15);

//   const user = new User({username, password, referCode: newReferCode, usedReferCode: referCode, email, mobileNumber});
//   await user.save();

//   // If the new user used someone's referral code, add them to that person's referral system
//   if (referCode) {
//     const referrer = await User.findOne({referCode});
//     if (referrer) {
 
//       // Add the new user to the referrer's referral system
//       referrer.referrals.push(user._id);
//       await referrer.save();
//     }

//   }
//   res.send(user);
// });
app.post('/register', async (req, res) => {
  const {username, password, referCode, email, mobileNumber} = req.body;

  // Generate a unique referral code for the new user
  const newReferCode = Math.random().toString(36).substring(2, 15);

  const user = new User({username, password, referCode: newReferCode, usedReferCode: referCode, email, mobileNumber});
  
  try {
    await user.save();
    res.send(user);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      // Extract field name from the error message
      const fieldName = error.message.split('index: ')[1].split(' dup key')[0].split('_')[0];
      res.status(400).send(`${fieldName} is already in use.`);
    } else {
      res.status(500).send('An error occurred during registration.');
    }
  }
});
app.get('/transaction-method', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, 'your-secret-key', async (err, user) => {
      if (err) {
        console.error(err);
        return res.status(403).json({ message: 'Forbidden' });
      }

      try {
        const transactionMethod = await TransactionMethod.findOne();
        res.json(transactionMethod);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const {username, password} = req.body;
  const user = await User.findOne({username, password});
  if (user) {
      // Generate a JWT with the user's ID
      const token = jwt.sign({ id: user._id }, 'your-secret-key'); // replace 'your-secret-key' with your actual secret key
      res.send({ user, token });
  } else {
      res.status(401).send('Invalid username or password');
  }
});

app.get('/user', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1]; // get the token from the headers
  const payload = jwt.verify(token, 'your-secret-key'); // verify the token and get the payload

  // Find the user with the ID from the token payload and exclude the password
  // const user = await User.findById(payload.id).select('-password');
  const user = await User.findById(payload.id)
  .select('-password')
  .populate({
    path: 'referrals',
    select: 'username email mobileNumber', // You can choose the fields you want to include
  });
  if (user) {
      res.send(user);
  } else {
      res.status(404).send('User not found');
  }
});
// Add a new endpoint to get referral details by ID
app.get('/referral/:id', async (req, res) => {
  console.log(req.params.id)
  const referralId = req.params.id;
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
        jwt.verify(token, 'your-secret-key', async (err, user) => {
      if (err) {
        console.error(err);
        return res.status(403).json({ message: 'Forbidden' });
      }
    const referral = await User.findById(referralId).select('username '); // Adjust the fields as needed
    if (referral) {
      res.json(referral);
    } else {
      res.status(404).json({ message: 'Referral not found' });
    }
  });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/referral-commission/:id', async (req, res) => {
  console.log(req.params.id,"hchdshgfv")
  const referralId = req.params.id;
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
        jwt.verify(token, 'your-secret-key', async (err, user) => {
      if (err) {
        console.error(err);
        return res.status(403).json({ message: 'Forbidden' });
      }
    const referral = await User.findById(referralId).select('username '); // Adjust the fields as needed
    if (referral) {
      console.log(referral)
      res.json(referral);
    } else {
      res.status(404).json({ message: 'Referralcommison not found' });
    }
  });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/user-transactions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id: userId } = jwt.verify(token, 'your-secret-key');

    // Fetch user transactions based on the user ID
    const transactions = await UserTransaction.find({ user: userId });
console.log(transactions)
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.put('/user', async (req, res) => {
const { username, password } = req.body;
const token = req.headers.authorization.split(' ')[1];

try {
  const decoded = jwt.verify(token, 'your-secret-key');
  const user = await User.findById(decoded.id);

  if (username) {
    user.username = username;
  }

  if (password) {
    user.password = password; // Make sure to hash the password before saving it
  }

  await user.save();

  res.status(200).send(user);
} catch (error) {
  console.error(error);
  res.status(500).send('Failed to update profile.');
}
});


app.post('/transactions', async (req, res) => {
  const { transactionId, coins, amount,paymentOption } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'your-secret-key', async (err, user) => {
    if (err) return res.sendStatus(403);
    const userId = user.id;

    try {
      // Check if a transaction with the same ID already exists for the user
      const existingTransaction = await UserTransaction.findOne({
        user: userId,
        transactionId: transactionId,
      });

      if (existingTransaction) {
        return res.status(400).json({ message: 'Found similar transaction ID.' });
      }

      // Create a new transaction
      const newTransaction = new UserTransaction({
        user: userId,
        transactionId,
        coins,
        amount,
        approved: false,
        paymentOption, // Add paymentOption here
      });

      // Save the new transaction
      await newTransaction.save();

      // Update the user's transactions array with the new transaction ID
      const userToUpdate = await User.findById(userId);
      userToUpdate.transactions.push(newTransaction._id);
      await userToUpdate.save();

      res.json({ message: 'Transaction saved successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });
});
  app.get('/admin/users',  authAdmin,async (req, res) => {
    // const token = req.headers.authorization.split(' ')[1];
    // const decoded = jwt.verify(token, 'your-secret-key');
    const users = await User.find();
    res.send(users);
  });
  
  app.put('/admin/users/:id', authAdmin, async (req, res) => {
    // const token = req.headers.authorization.split(' ')[1];
    // const decoded = jwt.verify(token, 'your-secret-key');
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(user);
  });
  
  app.get('/admin/transaction-method', authAdmin, async (req, res) => {
    // const token = req.headers.authorization.split(' ')[1];
    // const decoded = jwt.verify(token, 'your-secret-key');
    const transactionMethod = await TransactionMethod.findOne();
    res.send(transactionMethod);
  });
  
  app.put('/admin/transaction-method', authAdmin, async (req, res) => {
    // const token = req.headers.authorization.split(' ')[1];
    // const decoded = jwt.verify(token, 'your-secret-key');
    let transactionMethod = await TransactionMethod.findOne();
    if (!transactionMethod) {
      transactionMethod = new TransactionMethod(req.body);
    } else {
      Object.assign(transactionMethod, req.body);
    }
    await transactionMethod.save();
    res.send(transactionMethod);
  });
  
//   app.get('/admin/transactions', async (req, res) => {
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(' ')[1];
  
//     if (token == null) return res.sendStatus(401);
  
//     jwt.verify(token,'your-secret-key' , async (err, user) => {
//       if (err) return res.sendStatus(403);
  
//       // Check if the user is an admin
//       if (user.role !== 'admin') return res.sendStatus(403);
  
//       const transactions = await UserTransaction.find();
//       res.json(transactions);
//     });
//   });
app.get('/admin/transactions', authAdmin, async (req, res) => {
  try {
    const transactions = await UserTransaction.find();

    const transformedTransactions = await Promise.all(transactions.map(async transaction => {
      const { _id, transactionId, coins, amount, approved, paymentOption, user } = transaction;

      // Check if user is not null before proceeding
      if (user) {
        const userFromSchema = await User.findById(user);
        if (userFromSchema) {
          return {
            _id,
            transactionId,
            coins,
            amount,
            approved,
            paymentOption,
            username: userFromSchema.username,
          };
        }
      }

      // Return null for username and email if user is not found
      return {
        _id,
        transactionId,
        coins,
        amount,
        approved,
        paymentOption,
        username: null,
      };
    }));

    res.json(transformedTransactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

  app.put('/admin/transactions/:transactionId/approve',  authAdmin,async (req, res) => {
    const { transactionId } = req.params;
  
    // ... existing code to check authorization ...
  
    try {
      const transaction = await UserTransaction.findById(transactionId);
  
      if (!transaction) {
        console.error('Transaction not found:', transactionId);
        return res.status(404).json({ message: 'Transaction not found.' });
      }
  
      // Check if the user used a referral code
      const user = await User.findById(transaction.user);
  
      if (user.usedReferCode) {
        console.log(`User ${user._id} used referral code: ${user.usedReferCode}`);
  
        const referrer = await User.findOne({ referCode: user.usedReferCode });
  
        if (referrer) {
          const transactionMethod = await TransactionMethod.findOne();
  
          if (transactionMethod) {
            // Check if it's the first transaction for the user
            const isFirstTransaction = user.firstTransactionDate === null;
  
            if (isFirstTransaction) {
              const referralCommission =transactionMethod.referralCommission; // Use referrer's ID
  
              // Update referrer's details
              referrer.coins += referralCommission;
              referrer.referralCommission.push(user._id);
              // referrer.referrals.push(transaction.user);
  
              await referrer.save();
              user.firstTransactionDate = new Date();
            await user.save();
              console.log(`Referrer ${referrer._id} credited with referral commission for user ${user._id}`);
            } else {
              console.log(`Not the first transaction for user ${user._id}. Referral commission not added.`);
            }
          } else {
            console.error('Transaction method not found.');
          }
        } else {
          console.error('Referrer not found for code:', user.usedReferCode);
        }
      }
  
      // Mark the transaction as approved
      transaction.approved = true;
      await transaction.save();
  
      console.log(`Transaction ${transaction._id} approved successfully.`);
      // Update the user's coins
      user.coins += transaction.coins;
      await user.save();
      
      res.status(200).json({ message: 'Transaction approved successfully.' });
    } catch (error) {
      console.error('Error approving transaction:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });
  
  app.get('/validate-mobile/:mobileNumber', async (req, res) => {
    const mobileNumber = req.params.mobileNumber;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) return res.sendStatus(401);
  
    jwt.verify(token, 'your-secret-key', async (err, user) => {
      if (err) return res.sendStatus(403);
  
      try {
        const existingUser = await User.findOne({ mobileNumber });
  
        if (existingUser) {
          res.json({ username: existingUser.username, mobileNumber: existingUser.mobileNumber, userId: existingUser._id });
        } else {
          res.json(null); // Return null if user not found
        }
      } catch (error) {
        console.error('Error validating mobile number:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  });
  
  // app.post('/share', async (req, res) => {
  //   const { referCode, coins } = req.body;
  //   const authHeader = req.headers.authorization;
  //   const token = authHeader && authHeader.split(' ')[1];
  
  //   if (token == null) return res.sendStatus(401);
  
  //   jwt.verify(token,'your-secret-key' , async (err, user) => {
  //     if (err) return res.sendStatus(403);
  //     const userId = user.id;
  
  //     // Find the user who is sharing the coins
  //     const fromUser = await User.findById(userId);
  //     if (!fromUser) {
  //       return res.status(404).json({ message: 'User not found.' });
  //     }
  
  //     // Check if the user has enough coins to share
  //     if (fromUser.coins < coins) {
  //       return res.status(400).json({ message: 'Not enough coins to share.' });
  //     }
  
  //     // Find the user who is receiving the coins
  //     const toUser = await User.findOne({ referCode: referCode });
  //     if (!toUser) {
  //       return res.status(404).json({ message: 'User not found.' });
  //     }
  
  //     // Update the users' coins
  //     fromUser.coins -= coins;
  //     toUser.coins += coins;
  //     await fromUser.save();
  //     await toUser.save();
  
  //     res.json({ message: 'Coins shared successfully.' });
  //   });
  // });
    
  
  app.post('/share', async (req, res) => {
    const { recipientId, coins } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, 'your-secret-key', async (err, user) => {
      if (err) return res.sendStatus(403);
      const userId = user.id;
  
      // Find the user who is sharing the coins
      const fromUser = await User.findById(userId);
      if (!fromUser) {
        console.log('From User not found');
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Check if the user has enough coins to share
      if (fromUser.coins < coins) {
        console.log('Not enough coins to share');
        return res.status(400).json({ message: 'Not enough coins to share.' });
      }
  
      // Find the user who is receiving the coins by their ID
      const toUser = await User.findById(recipientId);
      if (!toUser) {
        console.log('To User not found');
        return res.status(404).json({ message: 'Recipient user not found.' });
      }
  
      // Log the current coins for both users
      console.log(`Before sharing - From User Coins: ${fromUser.coins}, To User Coins: ${toUser.coins}`);
  
      // Ensure coins is a valid number
      const coinsToShare = parseFloat(coins);
      if (!isNaN(coinsToShare)) {
        // Update the users' coins
        fromUser.coins -= coinsToShare;
        toUser.coins = (toUser.coins || 0) + coinsToShare;
  
        // Save the changes
        await fromUser.save();
        await toUser.save();
  
        // Log the updated coins for both users
        console.log(`After sharing - From User Coins: ${fromUser.coins}, To User Coins: ${toUser.coins}`);
  
        res.json({ message: 'Coins shared successfully.' });
      } else {
        console.log('Invalid coins value');
        return res.status(400).json({ message: 'Invalid coins value.' });
      }
    });
  });
  
// Start the server
app.listen(5000, () => console.log('Server started on port 5000'));
