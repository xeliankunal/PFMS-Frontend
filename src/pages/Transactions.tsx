
import React, { useState, useEffect } from "react";
import { useFinance } from "@/api/context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Transaction } from "@/api/models";
import { IndianRupee, Plus, Filter, Edit, Trash2, ArrowUpCircle, ArrowDownCircle, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const Transactions = () => {
  const { transactions, accounts, categories, createTransaction, updateTransaction, deleteTransaction, getAccountById, getCategoryById } = useFinance();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    accountId: "",
    categoryId: "",
    amount: 0,
    date: new Date(),
    description: ""
  });
  
  // Filters
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [accountFilter, setAccountFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");

  useEffect(() => {
    applyFilters();
  }, [transactions, dateFilter, categoryFilter, accountFilter, typeFilter]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Math.abs(amount));
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getFullYear() === filterDate.getFullYear() &&
          transactionDate.getMonth() === filterDate.getMonth() &&
          transactionDate.getDate() === filterDate.getDate()
        );
      });
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(transaction => transaction.categoryId === categoryFilter);
    }

    // Apply account filter
    if (accountFilter) {
      filtered = filtered.filter(transaction => transaction.accountId === accountFilter);
    }

    // Apply type filter (income/expense)
    if (typeFilter === "income") {
      filtered = filtered.filter(transaction => transaction.amount > 0);
    } else if (typeFilter === "expense") {
      filtered = filtered.filter(transaction => transaction.amount < 0);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredTransactions(filtered);
  };

  const resetFilters = () => {
    setDateFilter(undefined);
    setCategoryFilter("");
    setAccountFilter("");
    setTypeFilter("all");
  };

  const handleAddTransaction = async () => {
    // Ensure amount is negative for expenses if category type is expense
    const selectedCategory = categories.find(c => c.id === newTransaction.categoryId);
    const finalAmount = selectedCategory?.type === "expense" 
      ? Math.abs(newTransaction.amount) * -1 
      : Math.abs(newTransaction.amount);

    await createTransaction({
      ...newTransaction,
      amount: finalAmount,
    });
    setNewTransaction({
      accountId: "",
      categoryId: "",
      amount: 0,
      date: new Date(),
      description: ""
    });
    setIsAddDialogOpen(false);
  };

  const handleEditTransaction = async () => {
    if (selectedTransaction) {
      // Ensure amount is negative for expenses if category type is expense
      const selectedCategory = categories.find(c => c.id === selectedTransaction.categoryId);
      const finalAmount = selectedCategory?.type === "expense" 
        ? Math.abs(selectedTransaction.amount) * -1 
        : Math.abs(selectedTransaction.amount);

      await updateTransaction(selectedTransaction.id, {
        accountId: selectedTransaction.accountId,
        categoryId: selectedTransaction.categoryId,
        amount: finalAmount,
        date: selectedTransaction.date,
        description: selectedTransaction.description
      });
      setIsEditDialogOpen(false);
      setSelectedTransaction(null);
    }
  };

  const handleSelectTransactionForEdit = (transaction: Transaction) => {
    setSelectedTransaction({...transaction});
    setIsEditDialogOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(id);
    }
  };

  const getCategoryNameById = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    return category?.name || "Uncategorized";
  };

  const getAccountNameById = (id: string) => {
    const account = accounts.find(acc => acc.id === id);
    return account?.name || "Unknown Account";
  };

  const getFilterStats = () => {
    const total = filteredTransactions.reduce(
      (sum, transaction) => sum + transaction.amount, 
      0
    );
    
    const income = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    return { total, income, expenses };
  };

  const stats = getFilterStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-finance-primary hover:bg-finance-secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Select 
                  value={newTransaction.accountId}
                  onValueChange={(value) => setNewTransaction({...newTransaction, accountId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newTransaction.categoryId}
                  onValueChange={(value) => setNewTransaction({...newTransaction, categoryId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="" disabled>
                      Income Categories
                    </SelectItem>
                    {categories
                      .filter(category => category.type === "income")
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    <SelectItem value="" disabled>
                      Expense Categories
                    </SelectItem>
                    {categories
                      .filter(category => category.type === "expense")
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (INR)</Label>
                <div className="relative">
                  <div className="absolute left-2.5 top-2.5">
                    <IndianRupee className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    className="pl-9"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTransaction.date ? format(newTransaction.date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTransaction.date}
                      onSelect={(date) => date && setNewTransaction({...newTransaction, date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="Enter transaction details..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleAddTransaction} 
                disabled={!newTransaction.accountId || !newTransaction.categoryId}
                className="bg-finance-primary hover:bg-finance-secondary"
              >
                Add Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Transaction Dialog */}
      {selectedTransaction && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editAccount">Account</Label>
                <Select 
                  value={selectedTransaction.accountId}
                  onValueChange={(value) => setSelectedTransaction({...selectedTransaction, accountId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editCategory">Category</Label>
                <Select 
                  value={selectedTransaction.categoryId}
                  onValueChange={(value) => setSelectedTransaction({...selectedTransaction, categoryId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="" disabled>
                      Income Categories
                    </SelectItem>
                    {categories
                      .filter(category => category.type === "income")
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    <SelectItem value="" disabled>
                      Expense Categories
                    </SelectItem>
                    {categories
                      .filter(category => category.type === "expense")
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editAmount">Amount (INR)</Label>
                <div className="relative">
                  <div className="absolute left-2.5 top-2.5">
                    <IndianRupee className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    id="editAmount"
                    type="number"
                    className="pl-9"
                    value={Math.abs(selectedTransaction.amount)}
                    onChange={(e) => setSelectedTransaction({...selectedTransaction, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(new Date(selectedTransaction.date), "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(selectedTransaction.date)}
                      onSelect={(date) => date && setSelectedTransaction({...selectedTransaction, date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={selectedTransaction.description}
                  onChange={(e) => setSelectedTransaction({...selectedTransaction, description: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleEditTransaction}
                className="bg-finance-primary hover:bg-finance-secondary"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/5">
              <Label htmlFor="dateFilter" className="mb-2 block">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-full md:w-1/5">
              <Label htmlFor="categoryFilter" className="mb-2 block">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/5">
              <Label htmlFor="accountFilter" className="mb-2 block">Account</Label>
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Accounts</SelectItem>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/5">
              <Label htmlFor="typeFilter" className="mb-2 block">Type</Label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as typeof typeFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expense">Expenses Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/5 flex items-end">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics for filtered transactions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{formatAmount(stats.total)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600">Income</CardDescription>
            <CardTitle className="text-2xl text-green-600">{formatAmount(stats.income)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-600">Expenses</CardDescription>
            <CardTitle className="text-2xl text-red-600">{formatAmount(stats.expenses)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Transactions List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
              <Button 
                variant="link" 
                className="mt-2 text-finance-primary"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add your first transaction
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center p-4 border rounded-md hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      {transaction.amount >= 0 ? (
                        <ArrowUpCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <div>
                        <p className="font-semibold">{transaction.description}</p>
                        <div className="flex text-xs text-muted-foreground gap-2">
                          <span>{format(new Date(transaction.date), "MMM dd, yyyy")}</span>
                          <span>•</span>
                          <span>{getCategoryNameById(transaction.categoryId)}</span>
                          <span>•</span>
                          <span>{getAccountNameById(transaction.accountId)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatAmount(transaction.amount)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSelectTransactionForEdit(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
