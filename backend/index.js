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
app.post("/fuel-quote/:id", async (req, res)=>{
    const { id } = req.params;
    const { gallons, deliveryAddress, state, deliveryDate } = req.body;
    const gallonsRequested = parseInt(gallons); // Parse gallonsRequested as a number

    try {
        const hasHistory = await checkFuelQuoteHistory(id);
        const { suggestedPricePerGallon, totalPrice } = PricingModule.calculatePrice(gallonsRequested, state, hasHistory);

        const q = 'INSERT INTO quote (userID, gallons, address, state, date, pricePerGallon, totalPrice) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const values = [id, gallonsRequested, deliveryAddress, state, deliveryDate, suggestedPricePerGallon, totalPrice];
        
        db.query(q, values, (err, result) => {
            if (err) {
                console.error('Error adding fuel quote to database:', err);
                res.status(500).json({ success: false, message: "Error adding fuel quote to database" });
                return;
            }
            res.json({ success: true, message: "Fuel quote added successfully" });
        });
    } catch (error) {
        console.error('Error checking fuel quote history:', error);
        res.status(500).json({ success: false, message: "Error adding fuel quote to database" });
    }
});

// Helper function to check if fuel quote history exists
async function checkFuelQuoteHistory(userID) {
    return new Promise((resolve, reject) => {
        const q = 'SELECT COUNT(*) AS count FROM quote WHERE userID = ?';
        db.query(q, [userID], (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(results[0].count > 0);
        });
    });
}

  // Fetching Quote History from Database
app.get("/fuel-quote/:id", (req, res) => {
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


//LARRY New Code Here
// Pricing Module

app.post("/calculate-price", (req, res) => {
    const { gallonsRequested, state, hasHistory } = req.body;

    try {
        const totalPrice = PricingModule.calculatePrice(gallonsRequested, state, hasHistory).totalPrice;
        res.json({ success: true, totalPrice });
    } catch (error) {
        console.error("Error calculating price:", error);
        res.status(500).json({ success: false, message: "Error calculating price" });
    }
});

class PricingModule {
    static calculatePrice(gallonsRequested, state, hasHistory) {
        const currentPrice = 1.50;
        const locationFactor = state === 'TX' ? 0.02 : 0.04;
        const rateHistoryFactor = hasHistory ? 0.01 : 0;
        const gallonsRequestedFactor = gallonsRequested > 1000 ? 0.02 : 0.03;
        const companyProfitFactor = 0.10;

        const margin = (locationFactor - rateHistoryFactor + gallonsRequestedFactor + companyProfitFactor) * currentPrice;
        const suggestedPricePerGallon = currentPrice + margin;
        const totalPrice = suggestedPricePerGallon * gallonsRequested;

        return {
            suggestedPricePerGallon,
            totalPrice
        };
    }
}


app.listen(80, ()=>{
    console.log("Connected to the backend!");
});
