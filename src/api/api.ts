import { db, User, Account, Category, Transaction, Budget } from './models';

// Mock API service to interact with our database
class API {
  // Auth APIs
  async login(email: string, password: string): Promise<User | null> {
    // In a real app, you would hash the password before comparing
    const user = db.getUserByEmail(email);
    if (user && user.password === password) {
      // Don't return the password in a real app
      return { ...user, password: '********' };
    }
    return null;
  }

  async register(email: string, password: string, name: string): Promise<User | null> {
    // Check if user already exists
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return null;
    }

    // In a real app, you would hash the password before storing
    const newUser = db.createUser({ email, password, name });
    return { ...newUser, password: '********' };
  }

  // Account APIs
  async getAccounts(userId: string): Promise<Account[]> {
    return db.getAccountsByUserId(userId);
  }

  async createAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    return db.createAccount(account);
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account | null> {
    const updatedAccount = db.updateAccount(id, updates);
    return updatedAccount || null;
  }

  async deleteAccount(id: string): Promise<boolean> {
    return db.deleteAccount(id);
  }

  // Category APIs
  async getCategories(userId: string): Promise<Category[]> {
    return db.getCategoriesByUserId(userId);
  }

  async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    return db.createCategory(category);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const updatedCategory = db.updateCategory(id, updates);
    return updatedCategory || null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return db.deleteCategory(id);
  }

  // Transaction APIs
  async getTransactions(userId: string): Promise<Transaction[]> {
    return db.getTransactionsByUserId(userId);
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    return db.createTransaction(transaction);
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    const updatedTransaction = db.updateTransaction(id, updates);
    return updatedTransaction || null;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return db.deleteTransaction(id);
  }

  // Budget APIs
  async getBudgets(userId: string): Promise<Budget[]> {
    return db.getBudgetsByUserId(userId);
  }

  async createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    return db.createBudget(budget);
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget | null> {
    const updatedBudget = db.updateBudget(id, updates);
    return updatedBudget || null;
  }

  async deleteBudget(id: string): Promise<boolean> {
    return db.deleteBudget(id);
  }

  // CSV Import/Export
  parseCSV(csvString: string): Partial<Transaction>[] {
    // Implementation depends on the CSV format, this is a simplified example
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',');
    const dateIndex = headers.indexOf('date');
    const amountIndex = headers.indexOf('amount');
    const descriptionIndex = headers.indexOf('description');
    const categoryIndex = headers.indexOf('category');
    
    const transactions: Partial<Transaction>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const date = new Date(values[dateIndex]);
      const amount = parseFloat(values[amountIndex]);
      const description = values[descriptionIndex];
      const categoryName = values[categoryIndex];
      
      transactions.push({
        date,
        amount,
        description,
        // Other fields would be filled in by the client
      });
    }
    
    return transactions;
  }

  generateCSV(transactions: Transaction[]): string {
    // Simple CSV generation
    const headers = ['id', 'date', 'amount', 'description', 'account', 'category'];
    const rows = transactions.map(transaction => {
      const account = db.getAccountById(transaction.accountId);
      const category = db.getCategoryById(transaction.categoryId);
      return [
        transaction.id,
        transaction.date.toISOString().split('T')[0],
        transaction.amount.toString(),
        transaction.description,
        account?.name || '',
        category?.name || ''
      ].join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
  }

  // Dashboard data
  async getDashboardData(userId: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    accounts: Account[];
    recentTransactions: Transaction[];
  }> {
    const transactions = db.getTransactionsByUserId(userId);
    const accounts = db.getAccountsByUserId(userId);
    
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const netBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    const recentTransactions = transactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
      
    return {
      totalIncome,
      totalExpenses,
      netBalance,
      accounts,
      recentTransactions
    };
  }
  
  // Budget reporting
  async getBudgetReport(userId: string, month: number, year: number): Promise<{
    categoryId: string;
    categoryName: string;
    budgetAmount: number;
    spentAmount: number;
    remainingAmount: number;
    percentage: number;
  }[]> {
    const budgets = db.getBudgetsByUserId(userId)
      .filter(budget => budget.month === month && budget.year === year);
      
    const transactions = db.getTransactionsByUserId(userId)
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() + 1 === month &&
          transactionDate.getFullYear() === year
        );
      });
      
    const categories = db.getCategoriesByUserId(userId);
    
    return budgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      const transactionsInCategory = transactions.filter(t => t.categoryId === budget.categoryId);
      const spentAmount = transactionsInCategory.reduce((sum, t) => sum + Math.abs(t.amount < 0 ? t.amount : 0), 0);
      const remainingAmount = budget.amount - spentAmount;
      const percentage = (spentAmount / budget.amount) * 100;
      
      return {
        categoryId: budget.categoryId,
        categoryName: category?.name || 'Unknown',
        budgetAmount: budget.amount,
        spentAmount,
        remainingAmount,
        percentage
      };
    });
  }
}

export const api = new API();
