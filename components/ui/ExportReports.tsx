import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { VintageItem } from '@/types/VintageItem';

interface ExportReportsProps {
  items: VintageItem[];
}

// Definizione del componente usando function declaration invece di const
function ExportReports({ items }: ExportReportsProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Report Articoli Vintage', 20, 20);
    
    // Add summary
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 20, 30);
    doc.text(`Totale articoli: ${items.length}`, 20, 40);
    
    // Calculate totals
    const totalInvestment = items.reduce((sum, item) => sum + item.purchasePrice, 0);
    const totalCurrentValue = items.reduce((sum, item) => sum + (item.salePrice || item.currentValue), 0);
    const totalProfit = totalCurrentValue - totalInvestment;
    
    doc.text(`Investimento totale: ${totalInvestment.toFixed(2)}€`, 20, 50);
    doc.text(`Valore totale attuale: ${totalCurrentValue.toFixed(2)}€`, 20, 60);
    doc.text(`Profitto/Perdita totale: ${totalProfit.toFixed(2)}€`, 20, 70);
    
    let yPosition = 90;
    const pageHeight = doc.internal.pageSize.height;
    
    items.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`${index + 1}. ${item.name} (${item.year})`, 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.text(`Categoria: ${item.category}`, 25, yPosition);
      yPosition += 7;
      
      doc.text(`Prezzo d'acquisto: ${item.purchasePrice}€`, 25, yPosition);
      yPosition += 7;
      
      doc.text(`Data d'acquisto: ${item.purchaseDate}`, 25, yPosition);
      yPosition += 7;
      
      const currentOrSalePrice = item.salePrice || item.currentValue;
      doc.text(`${item.salePrice ? 'Prezzo di vendita' : 'Valore attuale'}: ${currentOrSalePrice}€`, 25, yPosition);
      yPosition += 7;
      
      if (item.saleDate) {
        doc.text(`Data di vendita: ${item.saleDate}`, 25, yPosition);
        yPosition += 7;
      }
      
      const itemProfit = (item.salePrice || item.currentValue) - item.purchasePrice;
      doc.text(`Profitto/Perdita: ${itemProfit.toFixed(2)}€`, 25, yPosition);
      
      yPosition += 15;
    });
    
    doc.save('report-articoli-vintage.pdf');
  };

  const generateExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Transform data for Excel
    const excelData = items.map(item => ({
      'Nome': item.name,
      'Categoria': item.category,
      'Anno': item.year,
      'Prezzo Acquisto (€)': item.purchasePrice,
      'Data Acquisto': item.purchaseDate,
      'Valore Attuale (€)': item.salePrice ? 'Venduto' : item.currentValue,
      'Prezzo Vendita (€)': item.salePrice || 'Non venduto',
      'Data Vendita': item.saleDate || 'N/A',
      'Profitto/Perdita (€)': (item.salePrice || item.currentValue) - item.purchasePrice
    }));
    
    // Add summary sheet
    const summaryData = [{
      'Metrica': 'Valore',
      'Totale Articoli': items.length,
      'Investimento Totale (€)': items.reduce((sum, item) => sum + item.purchasePrice, 0),
      'Valore Totale Attuale (€)': items.reduce((sum, item) => sum + (item.salePrice || item.currentValue), 0),
      'Articoli Venduti': items.filter(item => item.salePrice).length,
      'Articoli in Possesso': items.filter(item => !item.salePrice).length
    }];
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    
    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Riepilogo');
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Articoli Vintage');
    
    // Save workbook
    XLSX.writeFile(workbook, 'report-articoli-vintage.xlsx');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex-grow">
          <FileDown className="mr-2 h-4 w-4" />
          Esporta Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={generatePDF}>
          <FileDown className="mr-2 h-4 w-4" />
          Esporta come PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generateExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Esporta come Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Assicurati di avere questa riga alla fine del file
export default ExportReports;