const pool = require("../config/db");
const tables = require("../config/tables");

// ADD TRANSACTION
const addTransaction = async (req, res) => {
  try {
    const userId = req.user;

    const { title, amount, type, category } = req.body;

    // Validation
    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Insert transaction
    const newTransaction = await pool.query(
      `
      INSERT INTO ${tables.transactions}
      (user_id, title, amount, type, category)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [userId, title, amount, type, category],
    );

    res.status(201).json(newTransaction.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GET USER TRANSACTIONS
const getTransactions = async (req, res) => {
  try {
    const userId = req.user;

    const transactions = await pool.query(
      `
      SELECT *
      FROM ${tables.transactions}
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId],
    );

    res.status(200).json(transactions.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// DELETE TRANSACTION
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user;

    const { id } = req.params;

    // Check transaction
    const transaction = await pool.query(
      `
      SELECT *
      FROM ${tables.transactions}
      WHERE id = $1 AND user_id = $2
      `,
      [id, userId],
    );

    if (transaction.rows.length === 0) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    // Delete
    await pool.query(
      `
      DELETE FROM ${tables.transactions}
      WHERE id = $1
      `,
      [id],
    );

    res.status(200).json({
      message: "Transaction deleted",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// UPDATE TRANSACTION
const updateTransaction = async (req, res) => {
  try {
    const userId = req.user;

    const { id } = req.params;

    const { title, amount, type, category } = req.body;

    // Check ownership
    const transaction = await pool.query(
      `
      SELECT *
      FROM ${tables.transactions}
      WHERE id = $1 AND user_id = $2
      `,
      [id, userId],
    );

    if (transaction.rows.length === 0) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    // Update
    const updatedTransaction = await pool.query(
      `
      UPDATE ${tables.transactions}
      SET title = $1,
          amount = $2,
          type = $3,
          category = $4
      WHERE id = $5
      RETURNING *
      `,
      [title, amount, type, category, id],
    );

    res.status(200).json(updatedTransaction.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// MONTHLY SUMMARY
const getSummary = async (req, res) => {
  try {
    const userId = req.user;

    const result = await pool.query(
      `
      SELECT
        type,
        SUM(amount) as total
      FROM ${tables.transactions}
      WHERE user_id = $1
      GROUP BY type
      `,
      [userId],
    );

    let income = 0;
    let expense = 0;

    result.rows.forEach((item) => {
      if (item.type === "income") {
        income = Number(item.total);
      } else {
        expense = Number(item.total);
      }
    });

    const balance = income - expense;

    res.status(200).json({
      income,
      expense,
      balance,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getSummary,
};
