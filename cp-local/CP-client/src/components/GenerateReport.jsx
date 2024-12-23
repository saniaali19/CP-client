import React from 'react';
import { Button } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

const GenerateReport = ({ glucoseReadings, medications }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    
    doc.setFontSize(20);
    doc.text('Glucose Monitoring Report', pageWidth/2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'MM/dd/yyyy HH:mm')}`, pageWidth/2, 25, { align: 'center' });
    
    //latest reading section
    if (glucoseReadings.length > 0) {
      const latestReading = glucoseReadings.reduce((latest, current) => 
        new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
      );
      
      doc.setFontSize(14);
      doc.text('Latest Reading', 14, 40);
      doc.setFontSize(12);
      doc.text(`Level: ${latestReading.level} mg/dL`, 14, 50);
      doc.text(`Time: ${format(new Date(latestReading.timestamp), 'MM/dd/yyyy HH:mm')}`, 14, 57);
      doc.text(`Status: ${latestReading.mealStatus.replace('_', ' ')}`, 14, 64);
    }
    
    //glucose readings table
    doc.setFontSize(14);
    doc.text('Glucose Readings History', 14, 80);
    
    const glucoseData = glucoseReadings
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(reading => [
        format(new Date(reading.timestamp), 'MM/dd/yyyy HH:mm'),
        `${reading.level} mg/dL`,
        reading.mealStatus.replace('_', ' '),
        reading.notes || ''
      ]);
    
    doc.autoTable({
      startY: 85,
      head: [['Date/Time', 'Level', 'Meal Status', 'Notes']],
      body: glucoseData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [33, 150, 243] }
    });
    
    //new page for medications
    doc.addPage();
    
    //medications section
    doc.setFontSize(14);
    doc.text('Current Medications', 14, 15);
    
    let yPos = 25;
    medications.forEach(med => {
      doc.setFontSize(12);
      doc.text(`${med.name} (${med.type})`, 14, yPos);
      yPos += 7;
      
      if (med.schedules && med.schedules.length > 0) {
        doc.setFontSize(10);
        doc.text('Schedule:', 20, yPos);
        yPos += 7;
        
        med.schedules.forEach(schedule => {
          doc.text(`• ${schedule.time} - ${schedule.dosage}`, 25, yPos);
          yPos += 5;
          doc.text(`  Days: ${schedule.daysOfWeek.join(', ')}`, 25, yPos);
          yPos += 7;
        });
      }
      
      if (med.notes) {
        doc.text(`Notes: ${med.notes}`, 20, yPos);
        yPos += 10;
      }
      
      yPos += 5;
    });
    
    //statistics section
    if (glucoseReadings.length > 0) {
      const levels = glucoseReadings.map(r => r.level);
      const avgLevel = (levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(1);
      const maxLevel = Math.max(...levels);
      const minLevel = Math.min(...levels);
      
      doc.setFontSize(14);
      doc.text('Statistics', 14, yPos + 10);
      doc.setFontSize(12);
      doc.text(`Average Level: ${avgLevel} mg/dL`, 14, yPos + 20);
      doc.text(`Highest Level: ${maxLevel} mg/dL`, 14, yPos + 27);
      doc.text(`Lowest Level: ${minLevel} mg/dL`, 14, yPos + 34);
    }
    
    //save
    doc.save('glucose-monitoring-report.pdf');
  };
  
  return (
    <Button
      variant="contained"
      onClick={generatePDF}
      sx={{ 
        borderRadius: 2,
        px: 4,
        py: 1.5,
        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
        backgroundColor: 'primary.main',
        '&:hover': {
          backgroundColor: 'primary.dark',
          boxShadow: '0 6px 16px rgba(33, 150, 243, 0.3)'
        }
      }}
    >
      Generate Report
    </Button>
  );
};


GenerateReport.propTypes = {
  glucoseReadings: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.string.isRequired,
      level: PropTypes.number.isRequired,
      mealStatus: PropTypes.string.isRequired,
      notes: PropTypes.string,
      _id: PropTypes.string.isRequired
    })
  ).isRequired,
  medications: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      schedules: PropTypes.arrayOf(
        PropTypes.shape({
          time: PropTypes.string.isRequired,
          dosage: PropTypes.string.isRequired,
          daysOfWeek: PropTypes.arrayOf(PropTypes.string).isRequired
        })
      ),
      notes: PropTypes.string,
      _id: PropTypes.string.isRequired
    })
  ).isRequired
};

export default GenerateReport;