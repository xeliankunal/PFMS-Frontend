// Mock database models for our finance application
// In a real application, these would connect to an actual database

export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed
  name: string;
  createdAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  balance: number; // Stored in INR
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  color: string; // Hex color code
  budgetEnabled: boolean; // New field to track if category can be used in budgets
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string; 
  amount: number; // Positive for income, negative for expenses
  date: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  month: number; // 1-12
  year: number; // e.g., 2023
  amount: number; // Budget amount in INR
  createdAt: Date;
  updatedAt: Date;
}

// Mock database
export class MockDatabase {
  private users: User[] = [];
  private accounts: Account[] = [];
  private categories: Category[] = [];
  private transactions: Transaction[] = [];
  private budgets: Budget[] = [];

  // Initialize with default data
  constructor() {
    // Default categories
    const defaultCategories: Partial<Category>[] = [
      { name: 'Salary', type: 'income', color: '#4CAF50', budgetEnabled: true },
      { name: 'Food & Dining', type: 'expense', color: '#FF5722', budgetEnabled: true },
      { name: 'Transportation', type: 'expense', color: '#2196F3', budgetEnabled: true },
      { name: 'Housing', type: 'expense', color: '#673AB7', budgetEnabled: true },
      { name: 'Entertainment', type: 'expense', color: '#E91E63', budgetEnabled: false },
      { name: 'Shopping', type: 'expense', color: '#9C27B0', budgetEnabled: true },
      { name: 'Utilities', type: 'expense', color: '#FF9800', budgetEnabled: true },
      { name: 'Healthcare', type: 'expense', color: '#00BCD4', budgetEnabled: true },
      { name: 'Personal Care', type: 'expense', color: '#795548', budgetEnabled: false },
      { name: 'Education', type: 'expense', color: '#607D8B', budgetEnabled: true },
      { name: 'Gifts & Donations', type: 'expense', color: '#F44336', budgetEnabled: false },
      { name: 'Investments', type: 'income', color: '#4CAF50', budgetEnabled: true },
      { name: 'Other Income', type: 'income', color: '#8BC34A', budgetEnabled: true },
      { name: 'Other Expenses', type: 'expense', color: '#9E9E9E', budgetEnabled: false },
    ];

    this.users.push({
      id: '1',
      email: 'demo@example.com',
      password: 'password123', // In a real app, this would be hashed
      name: 'Demo User',
      createdAt: new Date(),
    });

    // Add default categories for demo user
    defaultCategories.forEach((category, index) => {
      this.categories.push({
        id: String(index + 1),
        userId: '1',
        name: category.name!,
        type: category.type!,
        color: category.color!,
        budgetEnabled: category.budgetEnabled!,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  // User methods
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      id: String(this.users.length + 1),
      ...user,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // Account methods
  getAccountsByUserId(userId: string): Account[] {
    return this.accounts.filter(account => account.userId === userId);
  }

  getAccountById(id: string): Account | undefined {
    return this.accounts.find(account => account.id === id);
  }

  createAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Account {
    const newAccount: Account = {
      id: String(this.accounts.length + 1),
      ...account,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.accounts.push(newAccount);
    return newAccount;
  }

  updateAccount(id: string, updates: Partial<Account>): Account | undefined {
    const accountIndex = this.accounts.findIndex(account => account.id === id);
    if (accountIndex === -1) return undefined;
    
    const updatedAccount = {
      ...this.accounts[accountIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.accounts[accountIndex] = updatedAccount;
    return updatedAccount;
  }

  deleteAccount(id: string): boolean {
    const initialLength = this.accounts.length;
    this.accounts = this.accounts.filter(account => account.id !== id);
    return this.accounts.length !== initialLength;
  }

  // Category methods
  getCategoriesByUserId(userId: string): Category[] {
    return this.categories.filter(category => category.userId === userId);
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find(category => category.id === id);
  }

  createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
    const newCategory: Category = {
      id: String(this.categories.length + 1),
      ...category,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | undefined {
    const categoryIndex = this.categories.findIndex(category => category.id === id);
    if (categoryIndex === -1) return undefined;
    
    const updatedCategory = {
      ...this.categories[categoryIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.categories[categoryIndex] = updatedCategory;
    return updatedCategory;
  }

  deleteCategory(id: string): boolean {
    const initialLength = this.categories.length;
    this.categories = this.categories.filter(category => category.id !== id);
    return this.categories.length !== initialLength;
  }

  // Transaction methods
  getTransactionsByUserId(userId: string): Transaction[] {
    return this.transactions.filter(transaction => transaction.userId === userId);
  }

  getTransactionById(id: string): Transaction | undefined {
    return this.transactions.find(transaction => transaction.id === id);
  }

  createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const newTransaction: Transaction = {
      id: String(this.transactions.length + 1),
      ...transaction,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.push(newTransaction);
    
    // Update account balance
    const account = this.getAccountById(transaction.accountId);
    if (account) {
      this.updateAccount(account.id, { balance: account.balance + transaction.amount });
    }
    
    return newTransaction;
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | undefined {
    const transactionIndex = this.transactions.findIndex(transaction => transaction.id === id);
    if (transactionIndex === -1) return undefined;
    
    const oldTransaction = this.transactions[transactionIndex];
    const updatedTransaction = {
      ...oldTransaction,
      ...updates,
      updatedAt: new Date(),
    };
    this.transactions[transactionIndex] = updatedTransaction;
    
    // Update account balance if amount changed
    if (updates.amount !== undefined && updates.amount !== oldTransaction.amount) {
      const account = this.getAccountById(oldTransaction.accountId);
      if (account) {
        const amountDiff = updates.amount - oldTransaction.amount;
        this.updateAccount(account.id, { balance: account.balance + amountDiff });
      }
    }
    
    return updatedTransaction;
  }

  deleteTransaction(id: string): boolean {
    const transaction = this.getTransactionById(id);
    if (!transaction) return false;
    
    const initialLength = this.transactions.length;
    this.transactions = this.transactions.filter(transaction => transaction.id !== id);
    
    // Update account balance
    const account = this.getAccountById(transaction.accountId);
    if (account) {
      this.updateAccount(account.id, { balance: account.balance - transaction.amount });
    }
    
    return this.transactions.length !== initialLength;
  }

  // Budget methods
  getBudgetsByUserId(userId: string): Budget[] {
    return this.budgets.filter(budget => budget.userId === userId);
  }

  getBudgetById(id: string): Budget | undefined {
    return this.budgets.find(budget => budget.id === id);
  }

  getBudgetsByCategoryId(categoryId: string): Budget[] {
    return this.budgets.filter(budget => budget.categoryId === categoryId);
  }

  createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Budget {
    const newBudget: Budget = {
      id: String(this.budgets.length + 1),
      ...budget,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.budgets.push(newBudget);
    return newBudget;
  }

  updateBudget(id: string, updates: Partial<Budget>): Budget | undefined {
    const budgetIndex = this.budgets.findIndex(budget => budget.id === id);
    if (budgetIndex === -1) return undefined;
    
    const updatedBudget = {
      ...this.budgets[budgetIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.budgets[budgetIndex] = updatedBudget;
    return updatedBudget;
  }

  deleteBudget(id: string): boolean {
    const initialLength = this.budgets.length;
    this.budgets = this.budgets.filter(budget => budget.id !== id);
    return this.budgets.length !== initialLength;
  }
}

// Create a singleton instance of the database
export const db = new MockDatabase();
