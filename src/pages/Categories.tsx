import React, { useState } from "react";
import { useFinance } from "@/api/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from "@/api/models";
import { Plus, Edit, Trash2, Tags, Circle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

const Categories = () => {
  const { categories, createCategory, updateCategory, deleteCategory } = useFinance();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<"income" | "expense">("expense");
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    color: "#9b87f5", // Default color
    budgetEnabled: false
  });

  const colorOptions = [
    { value: "#9b87f5", label: "Purple" },
    { value: "#4CAF50", label: "Green" },
    { value: "#2196F3", label: "Blue" },
    { value: "#FF5722", label: "Orange" },
    { value: "#E91E63", label: "Pink" },
    { value: "#673AB7", label: "Deep Purple" },
    { value: "#3F51B5", label: "Indigo" },
    { value: "#00BCD4", label: "Cyan" },
    { value: "#009688", label: "Teal" },
    { value: "#8BC34A", label: "Light Green" },
    { value: "#CDDC39", label: "Lime" },
    { value: "#FFC107", label: "Amber" },
    { value: "#FF9800", label: "Deep Orange" },
    { value: "#795548", label: "Brown" },
    { value: "#607D8B", label: "Blue Grey" },
  ];

  const handleAddCategory = async () => {
    await createCategory(newCategory);
    setNewCategory({
      name: "",
      type: "expense",
      color: "#9b87f5",
      budgetEnabled: false
    });
    setIsAddDialogOpen(false);
  };

  const handleEditCategory = async () => {
    if (selectedCategory) {
      await updateCategory(selectedCategory.id, {
        name: selectedCategory.name,
        type: selectedCategory.type,
        color: selectedCategory.color,
        budgetEnabled: selectedCategory.budgetEnabled
      });
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  const handleSelectCategoryForEdit = (category: Category) => {
    setSelectedCategory({...category});
    setIsEditDialogOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category? Any transactions with this category will be uncategorized.")) {
      await deleteCategory(id);
    }
  };

  const incomeCategories = categories.filter(cat => cat.type === "income");
  const expenseCategories = categories.filter(cat => cat.type === "expense");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-finance-primary hover:bg-finance-secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="e.g. Groceries"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Category Type</Label>
                <Select
                  value={newCategory.type}
                  onValueChange={(value) => setNewCategory({...newCategory, type: value as "income" | "expense"})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetEnabled">Budget Tracking</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="budgetEnabled"
                    checked={newCategory.budgetEnabled}
                    onCheckedChange={(checked) => setNewCategory({...newCategory, budgetEnabled: checked})}
                  />
                  <Label htmlFor="budgetEnabled">Enable budget tracking for this category</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select
                  value={newCategory.color}
                  onValueChange={(value) => setNewCategory({...newCategory, color: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: newCategory.color }}
                        />
                        {colorOptions.find(c => c.value === newCategory.color)?.label}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleAddCategory}
                disabled={!newCategory.name}
                className="bg-finance-primary hover:bg-finance-secondary"
              >
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {selectedCategory && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Category Name</Label>
                <Input
                  id="editName"
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({...selectedCategory, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editType">Category Type</Label>
                <Select
                  value={selectedCategory.type}
                  onValueChange={(value) => setSelectedCategory({...selectedCategory, type: value as "income" | "expense"})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editBudgetEnabled">Budget Tracking</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editBudgetEnabled"
                    checked={selectedCategory?.budgetEnabled}
                    onCheckedChange={(checked) => setSelectedCategory(prev => ({...prev!, budgetEnabled: checked}))}
                  />
                  <Label htmlFor="editBudgetEnabled">Enable budget tracking for this category</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editColor">Color</Label>
                <Select
                  value={selectedCategory.color}
                  onValueChange={(value) => setSelectedCategory({...selectedCategory, color: value})}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                        {colorOptions.find(c => c.value === selectedCategory.color)?.label || "Custom"}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleEditCategory}
                className="bg-finance-primary hover:bg-finance-secondary"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="expense" 
            onValueChange={(value) => setActiveTab(value as "income" | "expense")}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="expense">Expenses</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>
            <TabsContent value="expense">
              {expenseCategories.length === 0 ? (
                <div className="text-center py-8">
                  <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No expense categories yet</p>
                  <Button 
                    variant="link" 
                    className="mt-2 text-finance-primary"
                    onClick={() => {
                      setNewCategory({...newCategory, type: "expense"});
                      setIsAddDialogOpen(true);
                    }}
                  >
                    Add your first expense category
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {expenseCategories.map(category => (
                    <Card key={category.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-3" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSelectCategoryForEdit(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="income">
              {incomeCategories.length === 0 ? (
                <div className="text-center py-8">
                  <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No income categories yet</p>
                  <Button 
                    variant="link" 
                    className="mt-2 text-finance-primary"
                    onClick={() => {
                      setNewCategory({...newCategory, type: "income"});
                      setIsAddDialogOpen(true);
                    }}
                  >
                    Add your first income category
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {incomeCategories.map(category => (
                    <Card key={category.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-3" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSelectCategoryForEdit(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Categories;
