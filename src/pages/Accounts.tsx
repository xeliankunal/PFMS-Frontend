
import React, { useState } from "react";
import { useFinance } from "@/api/context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Account } from "@/api/models";
import { IndianRupee, Plus, Edit, Trash2, CreditCard, Wallet } from "lucide-react";

const Accounts = () => {
  const { accounts, createAccount, updateAccount, deleteAccount } = useFinance();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newAccount, setNewAccount] = useState({
    name: "",
    balance: 0,
    type: "checking" as "checking" | "savings" | "credit" | "investment" | "cash" | "other"
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleAddAccount = async () => {
    await createAccount(newAccount);
    setNewAccount({
      name: "",
      balance: 0,
      type: "checking"
    });
    setIsAddDialogOpen(false);
  };

  const handleEditAccount = async () => {
    if (selectedAccount) {
      await updateAccount(selectedAccount.id, {
        name: selectedAccount.name,
        balance: selectedAccount.balance,
        type: selectedAccount.type
      });
      setIsEditDialogOpen(false);
      setSelectedAccount(null);
    }
  };

  const handleSelectAccountForEdit = (account: Account) => {
    setSelectedAccount({...account});
    setIsEditDialogOpen(true);
  };

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this account? This will remove all associated transactions.")) {
      await deleteAccount(id);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "checking":
      case "savings":
      case "credit":
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Accounts</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-finance-primary hover:bg-finance-secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  placeholder="e.g. HDFC Savings"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select
                  value={newAccount.type}
                  onValueChange={(value) => setNewAccount({...newAccount, type: value as typeof newAccount.type})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Initial Balance (INR)</Label>
                <div className="relative">
                  <div className="absolute left-2.5 top-2.5">
                    <IndianRupee className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    id="balance"
                    type="number"
                    className="pl-9"
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({...newAccount, balance: parseFloat(e.target.value)})}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddAccount} className="bg-finance-primary hover:bg-finance-secondary">Create Account</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Account Dialog */}
      {selectedAccount && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Account Name</Label>
                <Input
                  id="editName"
                  value={selectedAccount.name}
                  onChange={(e) => setSelectedAccount({...selectedAccount, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAccountType">Account Type</Label>
                <Select
                  value={selectedAccount.type}
                  onValueChange={(value) => setSelectedAccount({...selectedAccount, type: value as typeof selectedAccount.type})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editBalance">Current Balance (INR)</Label>
                <div className="relative">
                  <div className="absolute left-2.5 top-2.5">
                    <IndianRupee className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    id="editBalance"
                    type="number"
                    className="pl-9"
                    value={selectedAccount.balance}
                    onChange={(e) => setSelectedAccount({...selectedAccount, balance: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditAccount} className="bg-finance-primary hover:bg-finance-secondary">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {accounts.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-finance-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Accounts Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first account to start tracking your finances.
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-finance-primary hover:bg-finance-secondary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getAccountIcon(account.type)}
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <CardDescription className="capitalize">
                        {account.type} Account
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mt-2">
                  <span className="text-2xl font-bold">{formatAmount(account.balance)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSelectAccountForEdit(account)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteAccount(account.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Accounts;
