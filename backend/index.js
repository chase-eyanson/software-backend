import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

// Set up users such that each user has username, password, first name, last name, address, city, and zip code
let users = [
    { username: "user1", password: "pass1", firstName: "John", lastName: "Doe", address: "123 Main St", city: "Houston", zipCode: "77001" },
    { username: "user2", password: "pass2", firstName: "Jane", lastName: "Smith", address: "456 Elm St", city: "Austin", zipCode: "78701" }
];

// Set up quoteHistory to contain an array of objects, each representing a fuel quote
let quoteHistory = [
    {
        userId: 0,
        quotes: [
            { gallonsRequested: 100, price: 250, date: "2024-03-28", deliveryAddress: "123 Main St", deliveryDate: "2024-04-05" }
        ]
    },
    {
        userId: 1,
        quotes: [
            { gallonsRequested: 150, price: 375, date: "2024-03-27", deliveryAddress: "456 Elm St", deliveryDate: "2024-04-10" }
        ]
    }
];

// Login Module
app.get("/login", (req, res)=>{
    const { username, password } = req.query;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, message: "Login successful", user });
    } else {
        res.status(401).json({ success: false, message: "Invalid username or password" });
    }
});

// Registration
app.post("/register", (req, res)=>{
    const { username, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        res.status(400).json({ success: false, message: "Passwords do not match" });
    } else {
        users.push({ username, password, firstName: "", lastName: "", address: "", city: "", zipCode: "" });
        res.json({ success: true, message: "Registration successful" });
    }
});

// Profile Management Module
app.put("/profile/:id", (req, res)=>{
    const { id } = req.params;
    const { firstName, lastName, address, city, zipCode } = req.body;
    if (users[id]) {
        users[id] = { ...users[id], firstName, lastName, address, city, zipCode };
        res.json({ success: true, message: "Profile updated successfully" });
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
});

// Fuel Quote Module
app.post("/fuel-quote/:id", (req, res)=>{
    const { id } = req.params;
    const { gallonsRequested, deliveryAddress, deliveryDate } = req.body;
    const price = 2.5 * gallonsRequested;
    
    const userIndex = parseInt(id);
    if (userIndex >= 0 && userIndex < users.length) {
        quoteHistory[userIndex].quotes.push({
            gallonsRequested,
            price,
            date: new Date().toISOString().split('T')[0],
            deliveryAddress,
            deliveryDate
        });
        res.json({ success: true, message: "Fuel quote added successfully" });
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
});

app.get("/fuel-quote/:id", (req, res)=>{
    const { id } = req.params;
    const userIndex = parseInt(id);
    if (userIndex >= 0 && userIndex < quoteHistory.length) {
        res.json({ success: true, userQuotes: quoteHistory[userIndex].quotes });
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
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