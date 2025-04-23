import React, { useState, useEffect } from "react";
import { useFinance } from "@/api/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Edit, Trash2 } from "lucide-react";
import { Transaction } from "@/api/models";

const Transactions = () => {
  const { transactions, accounts, categories, createTransaction, updateTransaction, deleteTransaction, getAccountById, getCategoryById } = useFinance();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    accountId: "",
    categoryId: "",
    amount: 0,
    description: "",
    date: new Date()
  });
  
  const [filterAccount, setFilterAccount] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (accounts.length > 0 && newTransaction.accountId === "") {
      setNewTransaction(prev => ({
        ...prev,
        accountId: accounts[0].id
      }));
    }
  }, [accounts]);

  const handleAddTransaction = async () => {
    await createTransaction({
      accountId: newTransaction.accountId,
      categoryId: newTransaction.categoryId,
      amount: newTransaction.amount,
      description: newTransaction.description,
      date: newTransaction.date
    });
    
    setNewTransaction({
      accountId: accounts.length > 0 ? accounts[0].id : "",
      categoryId: "",
      amount: 0,
      description: "",
      date: new Date()
    });
    setIsAddDialogOpen(false);
  };

  const handleEditTransaction = async () => {
    if (selectedTransaction) {
      await updateTransaction(selectedTransaction.id, {
        accountId: selectedTransaction.accountId,
        categoryId: selectedTransaction.categoryId,
        amount: selectedTransaction.amount,
        description: selectedTransaction.description,
        date: selectedTransaction.date
      });
      setIsEditDialogOpen(false);
      setSelectedTransaction(null);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(id);
    }
  };

  const handleSelectTransactionForEdit = (transaction: Transaction) => {
    setSelectedTransaction({...transaction});
    setIsEditDialogOpen(true);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesAccount = !filterAccount || filterAccount === 'all' || transaction.accountId === filterAccount;
    const matchesCategory = !filterCategory || filterCategory === 'all' || transaction.categoryId === filterCategory;
    
    const transactionDate = new Date(transaction.date);
    const matchesDate = !filterDate || 
      (transactionDate.getFullYear() === filterDate.getFullYear() &&
       transactionDate.getMonth() === filterDate.getMonth() &&
       transactionDate.getDate() === filterDate.getDate());
    
    return matchesAccount && matchesCategory && matchesDate;
  });

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const incomeCategories = categories.filter(cat => cat.type === "income");
  const expenseCategories = categories.filter(cat => cat.type === "expense");

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
          <DialogContent>
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
                    <div className="font-semibold p-2 text-xs text-muted-foreground">INCOME</div>
                    {incomeCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                    <div className="font-semibold p-2 text-xs text-muted-foreground">EXPENSE</div>
                    {expenseCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                />
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
                      {format(newTransaction.date, "PP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newTransaction.date}
                      onSelect={(date) => setNewTransaction({...newTransaction, date: date || new Date()})}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleAddTransaction} 
                disabled={!newTransaction.accountId || !newTransaction.categoryId || !newTransaction.description}
                className="bg-finance-primary hover:bg-finance-secondary"
              >
                Add Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filterAccount">Account</Label>
              <Select 
                value={filterAccount || undefined}
                onValueChange={setFilterAccount}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All accounts</SelectItem>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterCategory">Category</Label>
              <Select 
                value={filterCategory || undefined}
                onValueChange={setFilterCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <div className="font-semibold p-2 text-xs text-muted-foreground">INCOME</div>
                  {incomeCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                  <div className="font-semibold p-2 text-xs text-muted-foreground">EXPENSE</div>
                  {expenseCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    {filterDate ? format(filterDate, "PP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filterDate}
                    onSelect={setFilterDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-2 text-left">Date</th>
                  <th className="py-3 px-2 text-left">Description</th>
                  <th className="py-3 px-2 text-left">Category</th>
                  <th className="py-3 px-2 text-left">Account</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No transactions found. Add a transaction to get started.
                    </td>
                  </tr>
                ) : (
                  sortedTransactions.map((transaction) => {
                    const account = getAccountById(transaction.accountId);
                    const category = getCategoryById(transaction.categoryId);
                    const isIncome = category?.type === "income";
                    
                    return (
                      <tr key={transaction.id} className="border-b">
                        <td className="py-3 px-2">
                          {format(new Date(transaction.date), "dd MMM yyyy")}
                        </td>
                        <td className="py-3 px-2">{transaction.description}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center">
                            {category && (
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: category.color }}
                              />
                            )}
                            {category?.name || "Uncategorized"}
                          </div>
                        </td>
                        <td className="py-3 px-2">{account?.name || "Unknown"}</td>
                        <td className={`py-3 px-2 text-right font-medium ${isIncome ? "text-green-500" : "text-red-500"}`}>
                          {isIncome ? "+" : "-"}₹{Math.abs(transaction.amount).toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleSelectTransactionForEdit(transaction)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {selectedTransaction && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
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
                    <div className="font-semibold p-2 text-xs text-muted-foreground">INCOME</div>
                    {incomeCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                    <div className="font-semibold p-2 text-xs text-muted-foreground">EXPENSE</div>
                    {expenseCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editAmount">Amount (₹)</Label>
                <Input
                  id="editAmount"
                  type="number"
                  value={selectedTransaction.amount}
                  onChange={(e) => setSelectedTransaction({...selectedTransaction, amount: Number(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Input
                  id="editDescription"
                  value={selectedTransaction.description}
                  onChange={(e) => setSelectedTransaction({...selectedTransaction, description: e.target.value})}
                />
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
                      {format(new Date(selectedTransaction.date), "PP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(selectedTransaction.date)}
                      onSelect={(date) => setSelectedTransaction({...selectedTransaction, date: date || new Date()})}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleEditTransaction} 
                disabled={!selectedTransaction.accountId || !selectedTransaction.categoryId || !selectedTransaction.description}
                className="bg-finance-primary hover:bg-finance-secondary"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Transactions;
