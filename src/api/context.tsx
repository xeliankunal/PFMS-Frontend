
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from './api';
import { User, Account, Category, Transaction, Budget } from './models';

// Define the context shape
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

interface FinanceContextType {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  loadAccounts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  loadBudgets: () => Promise<void>;
  createAccount: (account: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  createCategory: (category: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  createBudget: (budget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getAccountById: (id: string) => Account | undefined;
  getCategoryById: (id: string) => Category | undefined;
  getTransactionById: (id: string) => Transaction | undefined;
  importTransactionsFromCSV: (csvString: string, accountId: string) => Promise<void>;
  exportTransactionsToCSV: () => string;
}

// Create the contexts
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('financeUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await api.login(email, password);
      if (user) {
        setUser(user);
        localStorage.setItem('financeUser', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const user = await api.register(email, password, name);
      if (user) {
        setUser(user);
        localStorage.setItem('financeUser', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('financeUser');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Finance provider component
export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Load data when the user changes
  useEffect(() => {
    if (auth.user) {
      loadAccounts();
      loadCategories();
      loadTransactions();
      loadBudgets();
    } else {
      // Clear data when user logs out
      setAccounts([]);
      setCategories([]);
      setTransactions([]);
      setBudgets([]);
    }
  }, [auth.user?.id]);

  // Data loading functions
  const loadAccounts = async () => {
    if (!auth.user) return;
    try {
      const data = await api.getAccounts(auth.user.id);
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadCategories = async () => {
    if (!auth.user) return;
    try {
      const data = await api.getCategories(auth.user.id);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTransactions = async () => {
    if (!auth.user) return;
    try {
      const data = await api.getTransactions(auth.user.id);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadBudgets = async () => {
    if (!auth.user) return;
    try {
      const data = await api.getBudgets(auth.user.id);
      setBudgets(data);
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  // CRUD operations for accounts
  const createAccount = async (accountData: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!auth.user) return;
    try {
      const newAccount = await api.createAccount({
        ...accountData,
        userId: auth.user.id,
      });
      setAccounts([...accounts, newAccount]);
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      const updatedAccount = await api.updateAccount(id, updates);
      if (updatedAccount) {
        setAccounts(accounts.map(account => 
          account.id === id ? updatedAccount : account
        ));
      }
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const success = await api.deleteAccount(id);
      if (success) {
        setAccounts(accounts.filter(account => account.id !== id));
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  // CRUD operations for categories
  const createCategory = async (categoryData: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!auth.user) return;
    try {
      const newCategory = await api.createCategory({
        ...categoryData,
        userId: auth.user.id,
      });
      setCategories([...categories, newCategory]);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const updatedCategory = await api.updateCategory(id, updates);
      if (updatedCategory) {
        setCategories(categories.map(category => 
          category.id === id ? updatedCategory : category
        ));
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const success = await api.deleteCategory(id);
      if (success) {
        setCategories(categories.filter(category => category.id !== id));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // CRUD operations for transactions
  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!auth.user) return;
    try {
      const newTransaction = await api.createTransaction({
        ...transactionData,
        userId: auth.user.id,
      });
      setTransactions([...transactions, newTransaction]);
      // Refresh accounts after creating transaction to update balances
      await loadAccounts();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await api.updateTransaction(id, updates);
      if (updatedTransaction) {
        setTransactions(transactions.map(transaction => 
          transaction.id === id ? updatedTransaction : transaction
        ));
        // Refresh accounts after updating transaction to update balances
        await loadAccounts();
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const success = await api.deleteTransaction(id);
      if (success) {
        setTransactions(transactions.filter(transaction => transaction.id !== id));
        // Refresh accounts after deleting transaction to update balances
        await loadAccounts();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // CRUD operations for budgets
  const createBudget = async (budgetData: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!auth.user) return;
    try {
      const newBudget = await api.createBudget({
        ...budgetData,
        userId: auth.user.id,
      });
      setBudgets([...budgets, newBudget]);
    } catch (error) {
      console.error('Error creating budget:', error);
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const updatedBudget = await api.updateBudget(id, updates);
      if (updatedBudget) {
        setBudgets(budgets.map(budget => 
          budget.id === id ? updatedBudget : budget
        ));
      }
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const success = await api.deleteBudget(id);
      if (success) {
        setBudgets(budgets.filter(budget => budget.id !== id));
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  // Helper functions
  const getAccountById = (id: string) => {
    return accounts.find(account => account.id === id);
  };

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  const getTransactionById = (id: string) => {
    return transactions.find(transaction => transaction.id === id);
  };

  // CSV Import/Export
  const importTransactionsFromCSV = async (csvString: string, accountId: string) => {
    if (!auth.user) return;
    
    try {
      const parsedTransactions = api.parseCSV(csvString);
      
      // Create transactions from CSV data
      for (const transaction of parsedTransactions) {
        if (transaction.amount !== undefined && transaction.description !== undefined && transaction.date !== undefined) {
          // Find or use default category
          const defaultCategory = categories.find(c => c.name === 'Other Expenses') || categories[0];
          
          await createTransaction({
            accountId,
            categoryId: defaultCategory.id,
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.date
          });
        }
      }
      
      // Refresh transactions
      await loadTransactions();
    } catch (error) {
      console.error('Error importing transactions from CSV:', error);
    }
  };

  const exportTransactionsToCSV = () => {
    return api.generateCSV(transactions);
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        categories,
        transactions,
        budgets,
        loadAccounts,
        loadCategories,
        loadTransactions,
        loadBudgets,
        createAccount,
        updateAccount,
        deleteAccount,
        createCategory,
        updateCategory,
        deleteCategory,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        createBudget,
        updateBudget,
        deleteBudget,
        getAccountById,
        getCategoryById,
        getTransactionById,
        importTransactionsFromCSV,
        exportTransactionsToCSV
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

// Custom hooks to use the contexts
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
