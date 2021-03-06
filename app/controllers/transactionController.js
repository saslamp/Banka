import accountModel from '../models/accountModel';
import transactionModel from '../models/transactionModel';

export default class TransactionController {
  static async creditAccount(req, res) {
    try {
      let oldBalance;
      const cashier = req.user.userId;
      const { amount } = req.body;
      const createdOn = new Date();
      const lastTransaction = await transactionModel.getLastTransaction(req, res);
      if (lastTransaction) {
        oldBalance = lastTransaction.accountbalance;
      } else {
        const bankAccount = await accountModel.getAccount(req, res);
        oldBalance = bankAccount[0].openingbalance;
      }
      const accountBalance = ((+oldBalance) + (+amount)).toFixed(2);
      const data = {
        type: 'credit', amount, cashier, accountBalance, createdOn,
      };
      const newTransaction = await transactionModel.create(req, data);
      if (newTransaction.length) {
        return res.status(200).json({
          status: 200,
          message: `The account ${req.params.accountNumber} has been credited with ${amount} on ${createdOn}`,
          data: newTransaction[0],
        });
      }
    } catch (error) {
      return res.status(500).send({
        status: 500,
        error: 'Unable to credit account!! Server Error, Please Try Again',
      });
    }
  }

  static async debitAccount(req, res) {
    try {
      let oldBalance;
      const cashier = req.user.userId;
      const { amount } = req.body;
      const createdOn = new Date();
      const lastTransaction = await transactionModel.getLastTransaction(req, res);
      if (lastTransaction) {
        oldBalance = lastTransaction.accountbalance;
      } else {
        const bankAccount = await accountModel.getAccount(req, res);
        oldBalance = bankAccount[0].openingbalance;
      }
      if ((+oldBalance) < (+amount)) {
        return res.status(409).json({
          status: 404,
          message: 'Insufficient funds',
        });
      }
      const accountBalance = ((+oldBalance) - (+amount)).toFixed(2);
      const data = {
        type: 'debit', amount, cashier, accountBalance, createdOn,
      };
      const newTransaction = await transactionModel.create(req, data);
      if (newTransaction.length) {
        return res.status(200).json({
          status: 200,
          message: `The account ${req.params.accountNumber} has been debited with ${amount} on ${createdOn}`,
          data: newTransaction[0],
        });
      }
    } catch (error) {
      return res.status(500).send({
        status: 500,
        error: 'Unable to credit account!! Server Error, Please Try Again',
      });
    }
  }

  static async ActivatOrDeactivateAccct(req, res) {
    try {
      const account = await accountModel.getAccount(req, res);
      if (account.length) {
        const updatedAccount = await accountModel.updateAccount(req, res);
        if (updatedAccount.length) {
          return res.status(200).send({
            status: 200,
            data: updatedAccount[0],
          });
        }
      }
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }

  static async getAllAccounts(req, res) {
    try {
      const allAccounts = await accountModel.getAllAccounts(req, res);
      if (allAccounts.length) {
        return res.status(200).send({
          status: 200,
          data: allAccounts,
        });
      }
    } catch (error) {
      return res.status(500).send({
        status: 500,
        error: 'Unable to get all account details!! Server Error, Please Try Again',
      });
    }
  }

  static async getUserAccounts(req, res) {
    try {
      const allAccounts = await accountModel.getAccountByEmail(req, res);
      if (allAccounts.length) {
        return res.status(200).send({
          status: 200,
          data: allAccounts,
        });
      }
    } catch (error) {
      return res.status(500).send({
        status: 500,
        error: 'Unable to get all account details!! Server Error, Please Try Again',
      });
    }
  }

  static async deleteAccount(req, res) {
    try {
      const isDeleted = await accountModel.delete(req, res);
      if (isDeleted > 0) {
        return res.status(200).send({
          status: 204,
          message: 'Seleted account successfully deleted',
        });
      }
    } catch (error) {
      return res.status(500).send({
        status: 500,
        error: 'Account delete not completed!! Server Error, Please Try Again',
        message: error.message,
      });
    }
  }
}
