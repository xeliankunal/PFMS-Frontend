
import React, { useState, useEffect } from "react";
import { useFinance } from "@/api/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, IndianRupee, Wallet, List, CreditCard } from "lucide-react";
import { Transaction } from "@/api/models";
import { format } from "date-fns";

const Dashboard = () => {
  const { accounts, transactions, categories } = useFinance();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    calculateSummary();
    getRecentTransactions();
  }, [accounts, transactions]);

  const calculateSummary = () => {
    let income = 0;
    let expenses = 0;
    let balance = 0;

    // Calculate income and expenses from transactions
    transactions.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      } else {
        expenses += Math.abs(transaction.amount);
      }
    });

    // Calculate total balance from all accounts
    accounts.forEach((account) => {
      balance += account.balance;
    });

    setTotalIncome(income);
    setTotalExpenses(expenses);
    setNetBalance(balance);
  };

  const getRecentTransactions = () => {
    // Get the 5 most recent transactions
    const recent = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    setRecentTransactions(recent);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Uncategorized";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Financial Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="h-5 w-5 text-finance-primary mr-2" />
              <span className="text-2xl font-bold">{formatAmount(netBalance)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all accounts
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowUpCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{formatAmount(totalIncome)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All time income
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowDownCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-2xl font-bold">{formatAmount(totalExpenses)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All time expenses
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-finance-primary mr-2" />
              <span className="text-2xl font-bold">{accounts.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-sm hover:shadow transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <List className="h-5 w-5 text-gray-500" />
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {getCategoryName(transaction.categoryId)} • {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className={`text-${transaction.amount >= 0 ? 'green' : 'red'}-500 font-semibold`}>
                    <div className="flex items-center">
                      <IndianRupee className="h-3.5 w-3.5 mr-1" />
                      {Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              No recent transactions found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
