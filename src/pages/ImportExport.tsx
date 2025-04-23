
import React, { useState } from "react";
import { useFinance } from "@/api/context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Download, Upload, AlertCircle } from "lucide-react";

const ImportExport = () => {
  const { accounts, transactions, importTransactionsFromCSV, exportTransactionsToCSV } = useFinance();
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [csvData, setCsvData] = useState("");
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string }>({});

  const handleExport = () => {
    if (transactions.length === 0) {
      setImportStatus({
        success: false,
        message: "No transactions to export",
      });
      return;
    }

    const csv = exportTransactionsToCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `transactions-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setImportStatus({
      success: true,
      message: `Successfully exported ${transactions.length} transactions`,
    });
  };

  const handleImport = async () => {
    if (!selectedAccountId) {
      setImportStatus({
        success: false,
        message: "Please select an account",
      });
      return;
    }

    if (!csvData.trim()) {
      setImportStatus({
        success: false,
        message: "Please enter CSV data",
      });
      return;
    }

    try {
      await importTransactionsFromCSV(csvData, selectedAccountId);
      setCsvData("");
      setImportStatus({
        success: true,
        message: "Transactions imported successfully",
      });
    } catch (error) {
      console.error("Import error:", error);
      setImportStatus({
        success: false,
        message: "Error importing transactions. Please check the CSV format.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Import/Export</h1>
      </div>

      {importStatus.message && (
        <Alert variant={importStatus.success ? "default" : "destructive"} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{importStatus.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Import */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Import Transactions
            </CardTitle>
            <CardDescription>
              Import transactions from a CSV file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account">Target Account</Label>
                <Select
                  value={selectedAccountId}
                  onValueChange={setSelectedAccountId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="csvData">CSV Data</Label>
                <Textarea
                  id="csvData"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="date,amount,description,category"
                  className="h-48 font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Format: date,amount,description,category (one transaction per line)
                </p>
              </div>
              <Button
                onClick={handleImport}
                disabled={!selectedAccountId || !csvData.trim()}
                className="w-full bg-finance-primary hover:bg-finance-secondary"
              >
                Import Transactions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export Transactions
            </CardTitle>
            <CardDescription>
              Export all your transactions to a CSV file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <div className="ml-4">
                    <h3 className="font-medium">Transactions Export</h3>
                    <p className="text-sm text-muted-foreground">
                      {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} available to export
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleExport}
                disabled={transactions.length === 0}
                className="w-full bg-finance-primary hover:bg-finance-secondary"
              >
                Export All Transactions
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                The CSV file will include all transaction details
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportExport;
