import express from 'express';
import cors from 'cors';
import mysql from 'mysql';
import bcrypt from 'bcrypt';

const app = express();

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: "swdserver.mysql.database.azure.com",
    user: "adminuser",
    password: "pass12!@",
    database: "oildb"
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database.');
});

// Login Module
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const q = 'SELECT * FROM user WHERE email = ?';
    db.query(q, [email], async (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: "Database error" });
            return;
        }
        const user = results[0];
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                res.json({ success: true, message: "Login successful", user });
            } else {
                res.status(401).json({ success: false, message: "Invalid email or password" });
            }
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    });
});

// Registration
app.post("/register", async (req, res)=>{
    const { email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        res.status(400).json({ success: false, message: "Passwords do not match" });
    } else {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const q = 'INSERT INTO user (email, password) VALUES (?, ?)';
            const values = [email, hashedPassword];
            db.query(q, values, (err, result) => {
                if (err) {
                    console.error('Error registering user:', err);
                    res.status(500).json({ success: false, message: "Error registering user" });
                    return;
                }
                res.json({ success: true, message: "Registration successful" });
            });
        } catch (error) {
            console.error('Error hashing password:', error);
            res.status(500).json({ success: false, message: "Error hashing password" });
        }
    }
});

// Profile Management Module
app.put("/profile/:id", (req, res)=>{
    const { id } = req.params;
    const { fullName, address, city, zipCode, state } = req.body;
    const q = 'UPDATE user SET name=?, address=?, city=?, zipcode=?, state=? WHERE userID=?';
    const values = [fullName, address, city, zipCode, state, id];
    db.query(q, values, (err, result) => {
        if (err) {
            console.error('Error updating profile:', err);
            res.status(500).json({ success: false, message: "Error updating profile" });
            return;
        }
        res.json({ success: true, message: "Profile updated successfully" });
    });
});

// Posting Fuel Quote to Database
app.post("/fuel-quote/:id", (req, res)=>{
    const { id } = req.params;
    const { gallons, address, state, deliveryDate } = req.body;
    const gallonsRequested = parseInt(gallons); // Parse gallonsRequested as a number
    const pricePerGallon = 2.5;
    const totalPrice = pricePerGallon * gallonsRequested;
  
    const q = 'INSERT INTO quote (userID, gallons, address, state, date, pricePerGallon, totalPrice) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [id, gallonsRequested, address, state, deliveryDate, pricePerGallon, totalPrice];
    db.query(q, values, (err, result) => {
      if (err) {
        console.error('Error adding fuel quote to database:', err);
        res.status(500).json({ success: false, message: "Error adding fuel quote to database" });
        return;
      }
      res.json({ success: true, message: "Fuel quote added successfully" });
    });
});
  
  // Fetching Quote History from Database
  app.get("/fuel-quote/:id", (req, res)=>{
    const { id } = req.params;
    const userID = parseInt(id);
  
    const q = 'SELECT gallons, address, date, pricePerGallon, totalPrice FROM quote WHERE userID = ? ORDER BY date DESC';
    db.query(q, [userID], (err, results) => {
      if (err) {
        console.error('Error fetching fuel quote history from database:', err);
        res.status(500).json({ success: false, message: "Error fetching fuel quote history from database" });
        return;
      }
      res.json({ success: true, userQuotes: results });
    });
  });

// Pricing Module
class PricingModule {
    static calculatePrice(gallonsRequested) {
        return 2.5 * gallonsRequested;
    }
}

app.listen(80, ()=>{
    console.log("Connected to the backend!");
});