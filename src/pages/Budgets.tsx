
import React, { useState, useEffect } from "react";
import { useFinance } from "@/api/context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianRupee, Plus, Edit, BookCheck } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

const Budgets = () => {
  const { categories, budgets, transactions, createBudget, updateBudget, deleteBudget } = useFinance();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any | null>(null);
  const [newBudget, setNewBudget] = useState({
    categoryId: "",
    month: new Date().getMonth() + 1, // 1-12
    year: new Date().getFullYear(),
    amount: 0
  });
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [budgetReports, setBudgetReports] = useState<any[]>([]);
  
  useEffect(() => {
    calculateBudgetReports();
  }, [budgets, transactions, currentMonth, currentYear]);
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };
  
  const calculateBudgetReports = () => {
    const reports: any[] = [];
    
    const expenseCategories = categories.filter(cat => cat.type === "expense");
    
    expenseCategories.forEach(category => {
      // Find budget for this category in the selected month
      const budget = budgets.find(b => 
        b.categoryId === category.id && 
        b.month === currentMonth && 
        b.year === currentYear
      );
      
      // Calculate spent amount
      const categoryTransactions = transactions.filter(t => 
        t.categoryId === category.id && 
        t.amount < 0 &&
        new Date(t.date).getMonth() + 1 === currentMonth &&
        new Date(t.date).getFullYear() === currentYear
      );
      
      const spentAmount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      // Add to reports
      if (budget) {
        const remainingAmount = budget.amount - spentAmount;
        const percentage = (spentAmount / budget.amount) * 100;
        
        reports.push({
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color,
          budgetId: budget.id,
          budgetAmount: budget.amount,
          spentAmount,
          remainingAmount,
          percentage: Math.min(percentage, 100) // Cap at 100%
        });
      } else if (spentAmount > 0) {
        // Categories with expenses but no budget
        reports.push({
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color,
          budgetId: null,
          budgetAmount: 0,
          spentAmount,
          remainingAmount: 0,
          percentage: 100 // 100% of no budget is still 100%
        });
      }
    });
    
    // Sort by percentage (highest first)
    reports.sort((a, b) => b.percentage - a.percentage);
    
    setBudgetReports(reports);
  };
  
  const handleAddBudget = async () => {
    await createBudget(newBudget);
    setNewBudget({
      categoryId: "",
      month: currentMonth,
      year: currentYear,
      amount: 0
    });
    setIsAddDialogOpen(false);
  };
  
  const handleEditBudget = async () => {
    if (selectedBudget?.budgetId) {
      await updateBudget(selectedBudget.budgetId, {
        amount: selectedBudget.budgetAmount
      });
      setIsEditDialogOpen(false);
      setSelectedBudget(null);
    }
  };
  
  const handleSelectBudgetForEdit = (budget: any) => {
    setSelectedBudget({...budget});
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteBudget = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      await deleteBudget(id);
    }
  };
  
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];
  
  const years = Array.from(
    { length: 5 }, 
    (_, i) => new Date().getFullYear() - 2 + i
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Budget Planner</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-finance-primary hover:bg-finance-secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newBudget.categoryId}
                  onValueChange={(value) => setNewBudget({...newBudget, categoryId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
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
              <div className="flex gap-4">
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="month">Month</Label>
                  <Select 
                    value={String(newBudget.month)}
                    onValueChange={(value) => setNewBudget({...newBudget, month: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={String(month.value)}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="year">Year</Label>
                  <Select 
                    value={String(newBudget.year)}
                    onValueChange={(value) => setNewBudget({...newBudget, year: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Budget Amount (INR)</Label>
                <div className="relative">
                  <div className="absolute left-2.5 top-2.5">
                    <IndianRupee className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    className="pl-9"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({...newBudget, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleAddBudget} 
                disabled={!newBudget.categoryId || newBudget.amount <= 0}
                className="bg-finance-primary hover:bg-finance-secondary"
              >
                Create Budget
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Budget Dialog */}
      {selectedBudget && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Budget: {selectedBudget.categoryName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editAmount">Budget Amount (INR)</Label>
                <div className="relative">
                  <div className="absolute left-2.5 top-2.5">
                    <IndianRupee className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    id="editAmount"
                    type="number"
                    className="pl-9"
                    value={selectedBudget.budgetAmount}
                    onChange={(e) => setSelectedBudget({...selectedBudget, budgetAmount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleEditBudget}
                disabled={selectedBudget.budgetAmount <= 0}
                className="bg-finance-primary hover:bg-finance-secondary"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Month & Year Selector */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Budget Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-1/2">
              <Label htmlFor="currentMonth" className="mb-2 block">Month</Label>
              <Select 
                value={String(currentMonth)}
                onValueChange={(value) => setCurrentMonth(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={String(month.value)}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/2">
              <Label htmlFor="currentYear" className="mb-2 block">Year</Label>
              <Select 
                value={String(currentYear)}
                onValueChange={(value) => setCurrentYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Reports */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Budgets for {months.find(m => m.value === currentMonth)?.label} {currentYear}</CardTitle>
          <CardDescription>
            {budgetReports.length} budget{budgetReports.length !== 1 ? "s" : ""} tracked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgetReports.length === 0 ? (
            <div className="text-center py-8">
              <BookCheck className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No budgets found for this period</p>
              <Button 
                variant="link" 
                className="mt-2 text-finance-primary"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Create your first budget
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {budgetReports.map((report) => (
                <div key={report.categoryId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: report.categoryColor }}
                      />
                      <span>{report.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatAmount(report.spentAmount)} / {formatAmount(report.budgetAmount || 0)}
                      </span>
                      {report.budgetId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => handleSelectBudgetForEdit(report)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress 
                      value={report.percentage} 
                      className={`h-2 ${report.percentage > 100 ? "[&>div]:bg-red-500" : ""}`}
                    />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>
                        {report.percentage.toFixed(0)}% 
                        {report.percentage > 100 ? " (Over budget)" : ""}
                      </span>
                      {report.budgetAmount > 0 && (
                        <span>
                          {report.remainingAmount >= 0 ? "Remaining: " : "Overspent: "}
                          {formatAmount(Math.abs(report.remainingAmount))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {categories.filter(c => c.type === "expense").length > budgetReports.length && (
                <div className="pt-4 border-t">
                  <Button 
                    variant="link" 
                    className="text-finance-primary"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add more budgets
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Budgets;
