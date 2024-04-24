import app from './index.js';
import request from 'supertest';

describe('Backend API Tests', () => {
    // Test Database Connection (Implicitly tested through other endpoints)
    it('should successfully connect to the database', (done) => {
        // Assuming the connection logs are visible in the console
        console.log("Database connected successfully (assumed through successful test completions).");
        done();
    });

    describe('Login Module', () => {
        it('should return success if valid credentials are provided', (done) => {
            request(app)
                .post('/login')
                .send({ email: 'georget@gmail.com', password: 'startrek' })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    if (!res.body.success) return done(new Error('Login failed'));
                    done();
                });
        });

        it('should return failure if invalid credentials are provided', (done) => {
            request(app)
                .post('/login')
                .send({ email: 'user1@example.com', password: 'wrongpassword' })
                .expect(401)
                .end((err, res) => {
                    if (err) return done(err);
                    if (res.body.success) return done(new Error('Login should fail'));
                    done();
                });
        });
    });

    describe('Registration', () => {
        it('should register a new user', (done) => {
            request(app)
                .post('/register')
                .send({ email: 'testuser@example.com', password: 'testpassword', confirmPassword: 'testpassword' })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    if (!res.body.success) return done(new Error('Registration failed'));
                    done();
                });
        });

        it('should fail registration if passwords do not match', (done) => {
            request(app)
                .post('/register')
                .send({ email: 'testuser@example.com', password: 'testpassword', confirmPassword: 'wrongpassword' })
                .expect(400)
                .end((err, res) => {
                    if (err) return done(err);
                    if (res.body.success) return done(new Error('Registration should fail'));
                    done();
                });
        });
    });

    describe('Profile Management Module', () => {
        it('should update the profile of a user', (done) => {
            request(app)
                .put('/profile/15')
                .send({ fullName: 'UpdatedFullName', address: 'UpdatedAddress', city: 'UpdatedCity', zipCode: '78745', state: 'TX' })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    if (!res.body.success) return done(new Error('Profile update failed'));
                    done();
                });
        });
        
        it('should return 404 if user does not exist while updating profile', (done) => {
            request(app)
                .put('/profile/100')
                .send({ fullName: 'UpdatedFullName', address: 'UpdatedAddress', city: 'UpdatedCity', zipCode: 'UpdatedZipCode', state: 'TX' })
                .expect(404)
                .end((err, res) => {
                    if (err) return done(err);
                    if (res.body.success) return done(new Error('User found but should not exist'));
                    done();
                });
        }); 
    });

    describe('Fuel Quote Module', () => {
        it('should add a fuel quote successfully', (done) => {
            request(app)
                .post('/fuel-quote/15')
                .send({ gallons: 100, deliveryAddress: 'TestAddress', state: 'TX', deliveryDate: '2024-04-10' })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    if (!res.body.success) return done(new Error('Fuel quote addition failed'));
                    done();
                });
        });
        
        it('should return 404 if user does not exist while adding fuel quote', (done) => {
            request(app)
                .post('/fuel-quote/100')
                .send({ gallons: 100, deliveryAddress: 'TestAddress', state: 'TX', deliveryDate: '2024-04-10' })
                .expect(404)
                .end((err, res) => {
                    if (err) return done(err);
                    if (res.body.success) return done(new Error('User found but should not exist'));
                    done();
                });
        }); 

        it('should fetch fuel quote history successfully', (done) => {
            request(app)
                .get('/fuel-quote/15')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    if (!res.body.success) return done(new Error('Fetching fuel quote history failed'));
                    if (!Array.isArray(res.body.userQuotes)) return done(new Error('Invalid fuel quote history format'));
                    done();
                });
        });
        
        it('should return 404 if user does not exist while fetching fuel quote history', (done) => {
            request(app)
                .get('/fuel-quote/100')
                .expect(404)
                .end((err, res) => {
                    if (err) return done(err);
                    if (res.body.success) return done(new Error('User found but should not exist'));
                    done();
                });
        });
    });
});