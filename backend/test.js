import chai from 'chai';
import chaiHttp from 'chai-http';
import app from './index.js';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Login Module', () => {
    it('should return success if valid credentials are provided', (done) => {
        chai.request(app)
            .get('/login?username=user1&password=pass1')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.message).to.equal('Login successful');
                expect(res.body.user).to.be.an('object');
                done();
            });
    });

    it('should return failure if invalid credentials are provided', (done) => {
        chai.request(app)
            .get('/login?username=user1&password=wrongpassword')
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body.success).to.be.false;
                expect(res.body.message).to.equal('Invalid username or password');
                done();
            });
    });
});

describe('Registration', () => {
    it('should register a new user', (done) => {
        chai.request(app)
            .post('/register')
            .send({ username: 'testuser', password: 'testpassword', confirmPassword: 'testpassword' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.message).to.equal('Registration successful');
                done();
            });
    });

    it('should fail registration if passwords do not match', (done) => {
        chai.request(app)
            .post('/register')
            .send({ username: 'testuser', password: 'testpassword', confirmPassword: 'wrongpassword' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                expect(res.body.message).to.equal('Passwords do not match');
                done();
            });
    });
});

describe('Profile Management Module', () => {
    it('should update the profile of a user', (done) => {
        chai.request(app)
            .put('/profile/0')
            .send({ firstName: 'UpdatedFirstName', lastName: 'UpdatedLastName', address: 'UpdatedAddress', city: 'UpdatedCity', zipCode: 'UpdatedZipCode' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.message).to.equal('Profile updated successfully');
                done();
            });
    });

    it('should return 404 if user does not exist while updating profile', (done) => {
        chai.request(app)
            .put('/profile/100')
            .send({ firstName: 'UpdatedFirstName', lastName: 'UpdatedLastName', address: 'UpdatedAddress', city: 'UpdatedCity', zipCode: 'UpdatedZipCode' })
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body.success).to.be.false;
                expect(res.body.message).to.equal('User not found');
                done();
            });
    });
});

describe('Fuel Quote Module', () => {
    it('should add a fuel quote successfully', (done) => {
        chai.request(app)
            .post('/fuel-quote/0')
            .send({ gallonsRequested: 100, deliveryAddress: 'TestAddress', deliveryDate: '2024-04-10' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.message).to.equal('Fuel quote added successfully');
                done();
            });
    });

    it('should return 404 if user does not exist while adding fuel quote', (done) => {
        chai.request(app)
            .post('/fuel-quote/100')
            .send({ gallonsRequested: 100, deliveryAddress: 'TestAddress', deliveryDate: '2024-04-10' })
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body.success).to.be.false;
                expect(res.body.message).to.equal('User not found');
                done();
            });
    });

    it('should fetch fuel quote history successfully', (done) => {
        chai.request(app)
            .get('/fuel-quote/0')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.userQuotes).to.be.an('array');
                done();
            });
    });

    it('should return 404 if user does not exist while fetching fuel quote history', (done) => {
        chai.request(app)
            .get('/fuel-quote/100')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body.success).to.be.false;
                expect(res.body.message).to.equal('User not found');
                done();
            });
    });
});