import pool from '../db';
import auth from '../middleware/auth';

class Account {
  static async createAccount(req, res) {
    const user = auth.tokenBearer(req);

    // check the status of user ADMIN or USER
    if (!user.isAdmin && user.type.toLowerCase() === 'user') {
      const owner = user.userId;
      const accountNo = Math.floor(Math.random() * 1000000000);
      const createdOn = new Date();

      const { type, status, openingBalance } = req.body;
      const createQuery = `INSERT INTO accounts(accountNo, createdOn, owner, type, status, openingBalance)
                            VALUES ($1, $2, $3, $4, $5, $6) 
                            RETURNING accountNo, createdOn, owner, type, openingBalance, status`;
      const values = [accountNo, createdOn, owner, type.trim(), status.trim(), openingBalance];


      try {
        const { rows } = await pool.query(createQuery, values);
        return res.status(201).send({
          status: 201,
          message: 'Account created successfully',
          data: rows[0],
        });
      } catch (error) {
        return res.status(500).send({
          status: 500,
          error: 'Unable to Create Account!! Server Error, Try Again',
        });
      }
    }
    return res.status(401).json({
      status: 401,
      error: 'you must be a user to perform this task',
    });
  }

}

export default Account;