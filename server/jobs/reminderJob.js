import cron from 'node-cron';
import prisma from '../config/db.js';
import triggerService from '../services/notification/notificationTriggerService.js';
import logger from '../utils/logger.js';

/**
 * Ride reminder cron job
 * Runs every minute. Checks for rides departing in 5, 15, and 30 minutes.
 * Uses metadata to prevent duplicate reminders.
 */
const startReminderJob = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const reminderWindows = [
        { minutes: 30, lowerBound: 29, upperBound: 31 },
        { minutes: 15, lowerBound: 14, upperBound: 16 },
        { minutes: 5,  lowerBound: 4,  upperBound: 6  },
      ];

      for (const window of reminderWindows) {
        const fromTime = new Date(now.getTime() + window.lowerBound * 60000);
        const toTime = new Date(now.getTime() + window.upperBound * 60000);

        // Find rides departing in this window that are still scheduled
        const rides = await prisma.ride.findMany({
          where: {
            departureTime: { gte: fromTime, lte: toTime },
            rideStatus: 'Scheduled'
          },
          select: {
            id: true,
            driverId: true,
            pickupName: true,
            destinationName: true,
            departureTime: true,
            driver: { select: { id: true, name: true, email: true } },
            bookings: {
              where: { status: { in: ['ACCEPTED', 'PENDING'] } },
              select: {
                passenger: { select: { id: true, name: true, email: true } }
              }
            }
          }
        });

        for (const ride of rides) {
          const rideDetails = {
            rideId: ride.id,
            pickup: ride.pickupName,
            destination: ride.destinationName,
            date: ride.departureTime.toISOString()
          };

          // Check if we already sent this reminder for this ride + window
          const alreadySent = await prisma.notification.count({
            where: {
              userId: ride.driverId,
              category: 'REMINDER',
              AND: [
                {
                  metadata: {
                    path: ['rideId'],
                    equals: ride.id
                  }
                },
                {
                  metadata: {
                    path: ['minutesBefore'],
                    equals: window.minutes
                  }
                }
              ]
            }
          });

          if (alreadySent === 0) {
            // Notify driver
            await triggerService.notifyRideReminder({
              userId: ride.driver.id,
              userName: ride.driver.name,
              userEmail: ride.driver.email,
              rideDetails,
              minutesBefore: window.minutes
            });
          }

          // Notify passengers
          for (const booking of ride.bookings) {
            const passengerAlreadySent = await prisma.notification.count({
              where: {
                userId: booking.passenger.id,
                category: 'REMINDER',
                AND: [
                  {
                    metadata: {
                      path: ['rideId'],
                      equals: ride.id
                    }
                  },
                  {
                    metadata: {
                      path: ['minutesBefore'],
                      equals: window.minutes
                    }
                  }
                ]
              }
            });

            if (passengerAlreadySent === 0) {
              await triggerService.notifyRideReminder({
                userId: booking.passenger.id,
                userName: booking.passenger.name,
                userEmail: booking.passenger.email,
                rideDetails,
                minutesBefore: window.minutes
              });
            }
          }
        }
      }
    } catch (error) {
      logger.error('Reminder job error:', error.message);
    }
  });

  logger.info('Ride reminder cron job started (runs every minute).');
};

export default startReminderJob;
