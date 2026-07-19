import prisma from '../../config/db.js';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class ReportsService {
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads', 'reports');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Main entry point to generate a report asynchronously.
   */
  async generateReport(reportId) {
    try {
      // 1. Update report status to PROCESSING
      await prisma.report.update({
        where: { id: reportId },
        data: { status: 'PROCESSING' }
      });

      // 2. Fetch report settings
      const report = await prisma.report.findUnique({
        where: { id: reportId }
      });

      const filters = JSON.parse(report.filters || '{}');
      
      // 3. Fetch data based on type
      const data = await this.fetchReportData(report.type, filters);

      // 4. Generate file buffer based on fileType
      let buffer;
      const filename = `report_${reportId}_${Date.now()}.${report.fileType.toLowerCase()}`;
      const filePath = path.join(this.uploadDir, filename);

      if (report.fileType === 'CSV') {
        buffer = this.generateCSVBuffer(data);
        fs.writeFileSync(filePath, buffer);
      } else if (report.fileType === 'XLSX') {
        buffer = this.generateXLSXBuffer(data);
        fs.writeFileSync(filePath, buffer);
      } else if (report.fileType === 'PDF') {
        await this.generatePDFFile(filePath, report.title, data);
      } else {
        throw new Error(`Unsupported export format: ${report.fileType}`);
      }

      // 5. Update status to COMPLETED and save file URL
      const fileUrl = `/uploads/reports/${filename}`;
      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'COMPLETED',
          fileUrl
        }
      });

    } catch (e) {
      console.error('Error generating report:', e);
      await prisma.report.update({
        where: { id: reportId },
        data: { status: 'FAILED' }
      });
    }
  }

  /**
   * Query matching records based on filters.
   */
  async fetchReportData(type, filters) {
    const where = {};

    // Apply Date Range filter
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    switch (type.toUpperCase()) {
      case 'RIDE': {
        if (filters.driverId) {
          where.driverId = parseInt(filters.driverId);
        }
        if (filters.rideStatus) {
          where.rideStatus = filters.rideStatus;
        }
        const rides = await prisma.ride.findMany({
          where,
          include: {
            driver: { select: { name: true, email: true } },
            vehicle: { select: { model: true, registrationNumber: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        return rides.map(r => ({
          'Ride ID': r.id,
          'Driver Name': r.driver?.name || 'N/A',
          'Driver Email': r.driver?.email || 'N/A',
          'Vehicle': `${r.vehicle?.model} (${r.vehicle?.registrationNumber || 'N/A'})`,
          'Pickup Point': r.pickupName,
          'Destination': r.destinationName,
          'Departure Time': r.departureTime,
          'Available Seats': r.availableSeats,
          'Fare (INR)': parseFloat(r.farePerSeat),
          'Distance (km)': parseFloat(r.distanceKm || 0),
          'Status': r.rideStatus,
          'Created At': r.createdAt
        }));
      }

      case 'PAYMENT': {
        if (filters.paymentStatus) {
          where.status = filters.paymentStatus;
        }
        if (filters.passengerId) {
          where.payerId = parseInt(filters.passengerId);
        }
        const payments = await prisma.payment.findMany({
          where,
          include: {
            payer: { select: { name: true, email: true } },
            receiver: { select: { name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        return payments.map(p => ({
          'Payment ID': p.id,
          'Booking ID': p.bookingId,
          'Payer': p.payer?.name || 'N/A',
          'Payer Email': p.payer?.email || 'N/A',
          'Receiver': p.receiver?.name || 'N/A',
          'Method': p.paymentMethod,
          'Amount (INR)': parseFloat(p.amount),
          'Status': p.status,
          'Created At': p.createdAt
        }));
      }

      case 'USER': {
        if (filters.organizationId) {
          where.organizationId = parseInt(filters.organizationId);
        }
        if (filters.department) {
          where.department = filters.department;
        }
        const users = await prisma.user.findMany({
          where,
          include: { organizationObj: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        });
        return users.map(u => ({
          'User ID': u.id,
          'Employee ID': u.employeeId,
          'Name': u.name,
          'Email': u.email,
          'Phone': u.phone || 'N/A',
          'Organization': u.organizationObj?.name || 'N/A',
          'Department': u.department || 'N/A',
          'Designation': u.designation || 'N/A',
          'Role': u.role,
          'Status': u.status,
          'Created At': u.createdAt
        }));
      }

      case 'DRIVER': {
        const drivers = await prisma.user.findMany({
          where: {
            OR: [
              { vehicles: { some: {} } },
              { rides: { some: {} } }
            ]
          },
          include: {
            rides: { select: { id: true, rideStatus: true } },
            vehicles: { select: { model: true } }
          }
        });
        return drivers.map(d => {
          const completed = d.rides.filter(r => r.rideStatus === 'Completed').length;
          const cancelled = d.rides.filter(r => r.rideStatus === 'Cancelled').length;
          return {
            'Driver ID': d.id,
            'Name': d.name,
            'Email': d.email,
            'Phone': d.phone || 'N/A',
            'Department': d.department || 'N/A',
            'Vehicles Owned': d.vehicles.length,
            'Total Offered Rides': d.rides.length,
            'Completed Rides': completed,
            'Cancelled Rides': cancelled
          };
        });
      }

      case 'PASSENGER': {
        const passengers = await prisma.user.findMany({
          where: {
            passengerBookings: { some: {} }
          },
          include: {
            passengerBookings: { select: { id: true, status: true } },
            paymentsPaid: { select: { amount: true, status: true } }
          }
        });
        return passengers.map(p => {
          const completed = p.passengerBookings.filter(b => b.status === 'COMPLETED').length;
          const totalSpent = p.paymentsPaid
            .filter(py => py.status === 'SUCCESS')
            .reduce((sum, py) => sum + parseFloat(py.amount), 0);
          return {
            'Passenger ID': p.id,
            'Name': p.name,
            'Email': p.email,
            'Total Bookings': p.passengerBookings.length,
            'Completed Trips': completed,
            'Total Spent (INR)': totalSpent
          };
        });
      }

      case 'REVENUE': {
        const payments = await prisma.payment.findMany({
          where: { ...where, status: 'SUCCESS' },
          include: {
            payer: { select: { department: true, organizationId: true } }
          }
        });

        // Group by Date & Department or Organization
        const revenueMap = {};
        payments.forEach(p => {
          const dateKey = p.createdAt.toISOString().split('T')[0];
          const deptKey = p.payer?.department || 'General';
          const key = `${dateKey}_${deptKey}`;

          if (!revenueMap[key]) {
            revenueMap[key] = {
              'Date': dateKey,
              'Department': deptKey,
              'Total Payments': 0,
              'Revenue (INR)': 0
            };
          }
          revenueMap[key]['Total Payments'] += 1;
          revenueMap[key]['Revenue (INR)'] += parseFloat(p.amount);
        });

        return Object.values(revenueMap);
      }

      case 'BOOKING': {
        if (filters.rideStatus) {
          where.status = filters.rideStatus;
        }
        const bookings = await prisma.booking.findMany({
          where,
          include: {
            ride: { select: { pickupName: true, destinationName: true } },
            passenger: { select: { name: true, email: true } },
            driver: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        return bookings.map(b => ({
          'Booking ID': b.id,
          'Ride ID': b.rideId,
          'Passenger': b.passenger?.name || 'N/A',
          'Passenger Email': b.passenger?.email || 'N/A',
          'Driver': b.driver?.name || 'N/A',
          'Route': `${b.ride?.pickupName} ➔ ${b.ride?.destinationName}`,
          'Seats Booked': b.requestedSeats,
          'Status': b.status,
          'Booking Date': b.bookingDate,
          'Created At': b.createdAt
        }));
      }

      case 'RATING': {
        const reviews = await prisma.rideReview.findMany({
          include: {
            reviewer: { select: { name: true } },
            reviewee: { select: { name: true } },
            ride: { select: { pickupName: true, destinationName: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        return reviews.map(r => ({
          'Review ID': r.id,
          'Ride ID': r.rideId,
          'Route': `${r.ride?.pickupName} ➔ ${r.ride?.destinationName}`,
          'Reviewer': r.reviewer?.name || 'N/A',
          'Reviewee': r.reviewee?.name || 'N/A',
          'Rating (Stars)': r.rating,
          'Comments': r.review,
          'Date': r.createdAt
        }));
      }

      default:
        return [];
    }
  }

  /**
   * Exporters.
   */
  generateCSVBuffer(data) {
    if (data.length === 0) return Buffer.from('No records found');
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(header => {
        const val = row[header];
        const stringVal = val instanceof Date ? val.toISOString() : String(val ?? '');
        // Escape quotes
        const escaped = stringVal.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    return Buffer.from(csvRows.join('\n'), 'utf-8');
  }

  generateXLSXBuffer(data) {
    if (data.length === 0) {
      data = [{ Message: 'No records found' }];
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  generatePDFFile(filePath, title, data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header Title
        doc.fontSize(20).fillColor('#047857').text(title, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#4b5563').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(1.5);

        if (data.length === 0) {
          doc.fontSize(12).fillColor('#ef4444').text('No records match your selected criteria.', { align: 'center' });
          doc.end();
          stream.on('finish', resolve);
          return;
        }

        // Output basic list structure for simplicity and clean visualization
        data.slice(0, 100).forEach((item, index) => {
          doc.fontSize(11).fillColor('#0f172a').text(`Record #${index + 1}:`, { underline: true });
          doc.moveDown(0.2);

          Object.entries(item).forEach(([key, val]) => {
            const displayVal = val instanceof Date ? val.toLocaleString() : String(val ?? 'N/A');
            doc.fontSize(9).fillColor('#334155').text(`  • ${key}: ${displayVal}`);
          });

          doc.moveDown(0.8);

          // Add page check
          if (doc.y > 700) {
            doc.addPage();
          }
        });

        if (data.length > 100) {
          doc.moveDown(1);
          doc.fontSize(10).fillColor('#6b7280').text(`... and ${data.length - 100} more records (truncated for PDF limit).`, { align: 'center' });
        }

        doc.end();
        stream.on('finish', resolve);
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default new ReportsService();
