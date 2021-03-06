import pool from '../db';

export default class AccountModel {
  static async create(req, res, userId) {
    const owner = userId;
    const status = (+req.body.openingBalance) > 0 ? 'active' : 'draft';
    const allowedTypes = ['savings', 'current'];
    const accountNo = Math.random().toString().slice(2, 11);
    const createdOn = new Date();
    const { type, openingBalance } = req.body;
    const createQuery = `INSERT INTO accounts(accountNo, createdOn, owner, type, status, openingBalance)
                            VALUES ($1, $2, $3, $4, $5, $6) 
                            RETURNING accountNo, createdOn, owner, type, openingBalance, status`;
    const values = [accountNo, createdOn, owner, type.trim(), status, openingBalance];
    if (!allowedTypes.includes(type)) {
      return res.status(403).send({
        status: 403,
        error: 'Forbidden, type must either be "savings" or "current"',
      });
    }
    try {
      const { rows } = await pool.query(createQuery, values);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getAccount(req, res) {
    const query = 'SELECT * FROM accounts WHERE accountNo = $1';
    const values = [req.params.accountNumber];
    try {
      const { rows } = await pool.query(query, values);
      if (!rows[0]) {
        return res.status(200).send({
          status: 404,
          error: 'not found',
        });
      }
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getAccountByEmail(req, res) {
    const allAccountsQuery = 'SELECT * FROM accounts WHERE owner = (SELECT user_id FROM users WHERE email = $1)';
    const values = [req.params.userEmail];
    try {
      const { rows } = await pool.query(allAccountsQuery, values);
      if (!rows[0]) {
        return res.status(200).send({
          status: 204,
          data: [],
        });
      }
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(req, res) {
    const deleteQuery = 'DELETE FROM accounts WHERE accountNo = $1';
    const values = [req.params.accountNumber];
    try {
      const { rowCount } = await pool.query(deleteQuery, values);
      if (!rowCount) {
        return res.status(404).send({
          status: 404,
          error: 'Account does not exist',
        });
      }
      return rowCount;
    } catch (error) {
      throw error;
    }
  }

  static async getAllAccounts(req, res) {
    let allAccountsQuery;
    let values = [];
    if (req.query.status) {
      allAccountsQuery = 'SELECT * FROM accounts WHERE status = $1 ORDER BY createdOn DESC';
      values = [req.query.status];
    } else {
      allAccountsQuery = 'SELECT * FROM accounts ORDER BY createdOn DESC';
    }
    try {
      const { rows } = await pool.query(allAccountsQuery, values);
      if (!rows[0]) {
        return res.status(200).send({
          status: 404,
          error: 'notFound',
        });
      }
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async updateAccount(req, res) {
    const { status } = req.body;
    const { accountNumber } = req.params;
    const statusOptions = ['dormant', 'active'];
    const values = [status.trim(), accountNumber];
    const editQuery = 'UPDATE accounts SET status=$1 WHERE accountNo=$2     RETURNING *';
    if (!statusOptions.includes(status)) {
      return res.status(409).json({
        status: 409,
        error: 'Invalid account status field, status should be "dormant" or "active"',
      });
    }
    try {
      const { rows } = await pool.query(editQuery, values);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}
