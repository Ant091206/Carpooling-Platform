import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';

class VehicleService {
  /**
   * Helper to format vehicle response with backwards-compatible aliases
   */
  _formatVehicle(v) {
    if (!v) return null;
    return {
      ...v,
      plateNumber: v.registrationNumber,
      capacity: v.seatCapacity,
      userId: v.ownerId,
      isDefault: v.isDefault,
      vehicleImage: v.vehicleImage,
      images: v.images,
    };
  }

  /**
   * Helper to trigger automatic expiry and verification notifications
   */
  async _triggerVehicleNotifications(userId, vehicle, type, extraInfo = '') {
    try {
      let title = 'Vehicle Alert';
      let message = '';
      let category = 'SYSTEM';

      if (type === 'VERIFIED') {
        title = 'Vehicle Verification Completed';
        message = `Your vehicle ${vehicle.model} (${vehicle.registrationNumber}) has been verified and approved by system administrators.`;
        category = 'SYSTEM';
      } else if (type === 'REJECTED') {
        title = 'Vehicle Verification Rejected';
        message = `Your vehicle ${vehicle.model} (${vehicle.registrationNumber}) verification was rejected. ${extraInfo || 'Please check documents.'}`;
        category = 'SYSTEM';
      } else if (type === 'STATUS_CHANGE') {
        title = 'Vehicle Status Updated';
        message = `Your vehicle ${vehicle.model} (${vehicle.registrationNumber}) status was updated to ${vehicle.status}.`;
        category = 'SYSTEM';
      } else if (type === 'EXPIRY_ALERT') {
        title = 'Vehicle Document Expiry Reminder';
        message = `Attention: ${extraInfo} for vehicle ${vehicle.model} (${vehicle.registrationNumber}) is approaching expiry.`;
        category = 'REMINDER';
      }

      await prisma.notification.create({
        data: {
          userId: parseInt(userId, 10),
          title,
          message,
          category,
          type: type === 'REJECTED' ? 'WARNING' : 'INFO',
        },
      });
    } catch (err) {
      console.error('Failed to trigger vehicle notification:', err.message);
    }
  }

  /**
   * POST /api/vehicles
   * Register a new vehicle
   */
  async createVehicle(ownerId, data) {
    // Map snake_case to camelCase
    if (data.registration_brand === undefined && data.brand) data.manufacturer = data.brand;
    if (data.registration_number && !data.registrationNumber) data.registrationNumber = data.registration_number;
    if (data.plate_number && !data.plateNumber) data.plateNumber = data.plate_number;
    if (data.seat_capacity && !data.seatCapacity) data.seatCapacity = data.seat_capacity;
    if (data.fuel_type && !data.fuelType) data.fuelType = data.fuel_type;

    if (data.fuelType) {
      const ft = data.fuelType.toUpperCase();
      if (ft === 'ELECTRIC') data.fuelType = 'EV';
      else data.fuelType = ft;
    }

    const regNum = (data.registrationNumber || data.plateNumber || '').trim().toUpperCase();

    if (!regNum) {
      throw new ApiError(400, 'Registration number is required.');
    }

    // Uniqueness check
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: regNum },
    });

    if (existing) {
      throw new ApiError(409, `Vehicle with registration number "${regNum}" is already registered.`);
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        ownerId: parseInt(ownerId, 10),
        registrationNumber: regNum,
        manufacturer: data.manufacturer || null,
        model: data.model || 'Standard Model',
        variant: data.variant || null,
        vehicleType: data.vehicleType || 'CAR',
        fuelType: data.fuelType || 'PETROL',
        color: data.color || 'Silver',
        year: data.year ? parseInt(data.year, 10) : null,
        seatCapacity: data.seatCapacity || data.capacity ? parseInt(data.seatCapacity || data.capacity, 10) : 4,
        insuranceNumber: data.insuranceNumber || null,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
        pollutionCertificateExpiry: data.pollutionCertificateExpiry ? new Date(data.pollutionCertificateExpiry) : null,
        registrationExpiry: data.registrationExpiry ? new Date(data.registrationExpiry) : null,
        status: data.status || 'ACTIVE',
        isVerified: false,
      },
    });

    // Check expiry dates within 30 days
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (newVehicle.insuranceExpiry && newVehicle.insuranceExpiry <= in30Days) {
      await this._triggerVehicleNotifications(ownerId, newVehicle, 'EXPIRY_ALERT', 'Insurance');
    }
    if (newVehicle.registrationExpiry && newVehicle.registrationExpiry <= in30Days) {
      await this._triggerVehicleNotifications(ownerId, newVehicle, 'EXPIRY_ALERT', 'Registration');
    }

    return this._formatVehicle(newVehicle);
  }

  /**
   * GET /api/vehicles
   * Get vehicles owned by logged-in user
   */
  async getUserVehicles(ownerId) {
    const vehicles = await prisma.vehicle.findMany({
      where: { ownerId: parseInt(ownerId, 10) },
      orderBy: { createdAt: 'desc' },
      include: {
        documents: true,
        _count: { select: { rides: true } },
      },
    });

    return vehicles.map((v) => this._formatVehicle(v));
  }

  /**
   * GET /api/vehicles/:id
   * Get single vehicle details
   */
  async getVehicleById(vehicleId, currentUserId, currentUserRole) {
    const id = parseInt(vehicleId, 10);
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true, department: true } },
        documents: true,
        rides: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { id: true, pickupName: true, destinationName: true, departureTime: true, rideStatus: true },
        },
        _count: { select: { rides: true } },
      },
    });

    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found.');
    }

    if (currentUserRole !== 'ADMIN' && vehicle.ownerId !== parseInt(currentUserId, 10)) {
      throw new ApiError(403, 'Access denied. You do not own this vehicle.');
    }

    return this._formatVehicle(vehicle);
  }

  /**
   * PUT /api/vehicles/:id
   * Update vehicle details
   */
  async updateVehicle(vehicleId, ownerId, data) {
    const id = parseInt(vehicleId, 10);
    const existing = await prisma.vehicle.findUnique({ where: { id } });

    if (!existing) {
      throw new ApiError(404, 'Vehicle not found.');
    }

    if (existing.ownerId !== parseInt(ownerId, 10)) {
      throw new ApiError(403, 'Access denied. You can only update your own vehicles.');
    }

    // Map snake_case to camelCase
    if (data.registration_number && !data.registrationNumber) data.registrationNumber = data.registration_number;
    if (data.plate_number && !data.plateNumber) data.plateNumber = data.plate_number;
    if (data.seat_capacity && !data.seatCapacity) data.seatCapacity = data.seat_capacity;
    if (data.fuel_type && !data.fuelType) data.fuelType = data.fuel_type;
    if (data.brand && !data.manufacturer) data.manufacturer = data.brand;

    if (data.fuelType) {
      const ft = data.fuelType.toUpperCase();
      if (ft === 'ELECTRIC') data.fuelType = 'EV';
      else data.fuelType = ft;
    }

    if (data.registrationNumber || data.plateNumber) {
      const regNum = (data.registrationNumber || data.plateNumber).trim().toUpperCase();
      if (regNum !== existing.registrationNumber) {
        const checkConflict = await prisma.vehicle.findUnique({ where: { registrationNumber: regNum } });
        if (checkConflict) {
          throw new ApiError(409, `Registration number "${regNum}" is already in use by another vehicle.`);
        }
        data.registrationNumber = regNum;
      }
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(data.registrationNumber && { registrationNumber: data.registrationNumber }),
        ...(data.manufacturer !== undefined && { manufacturer: data.manufacturer }),
        ...(data.model && { model: data.model }),
        ...(data.variant !== undefined && { variant: data.variant }),
        ...(data.vehicleType && { vehicleType: data.vehicleType }),
        ...(data.fuelType && { fuelType: data.fuelType }),
        ...(data.color && { color: data.color }),
        ...(data.year && { year: parseInt(data.year, 10) }),
        ...((data.seatCapacity || data.capacity) && { seatCapacity: parseInt(data.seatCapacity || data.capacity, 10) }),
        ...(data.insuranceNumber !== undefined && { insuranceNumber: data.insuranceNumber }),
        ...(data.insuranceExpiry && { insuranceExpiry: new Date(data.insuranceExpiry) }),
        ...(data.pollutionCertificateExpiry && { pollutionCertificateExpiry: new Date(data.pollutionCertificateExpiry) }),
        ...(data.registrationExpiry && { registrationExpiry: new Date(data.registrationExpiry) }),
        ...(data.status && { status: data.status }),
      },
      include: { documents: true },
    });

    return this._formatVehicle(updated);
  }

  /**
   * Set primary (default) vehicle for owner
   */
  async setDefaultVehicle(ownerId, vehicleId) {
    const userId = parseInt(ownerId, 10);
    const id = parseInt(vehicleId, 10);

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found.');
    }
    if (vehicle.ownerId !== userId) {
      throw new ApiError(403, 'Access denied.');
    }

    await prisma.$transaction([
      prisma.vehicle.updateMany({
        where: { ownerId: userId },
        data: { isDefault: false }
      }),
      prisma.vehicle.update({
        where: { id },
        data: { isDefault: true }
      })
    ]);

    const updated = await prisma.vehicle.findUnique({
      where: { id },
      include: { documents: true }
    });
    return this._formatVehicle(updated);
  }

  /**
   * Upload and append vehicle image
   */
  async uploadVehicleImage(vehicleId, ownerId, filename) {
    const id = parseInt(vehicleId, 10);
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found.');
    }

    if (vehicle.ownerId !== parseInt(ownerId, 10)) {
      throw new ApiError(403, 'Access denied.');
    }

    let imagesList = [];
    if (vehicle.images) {
      try {
        imagesList = Array.isArray(vehicle.images) ? vehicle.images : JSON.parse(vehicle.images);
      } catch (e) {
        imagesList = [];
      }
    }
    imagesList.push(filename);

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        vehicleImage: filename,
        images: imagesList
      }
    });

    return this._formatVehicle(updated);
  }

  /**
   * DELETE /api/vehicles/:id
   */
  async deleteVehicle(vehicleId, currentUserId, currentUserRole) {
    const id = parseInt(vehicleId, 10);
    const existing = await prisma.vehicle.findUnique({ where: { id } });

    if (!existing) {
      throw new ApiError(404, 'Vehicle not found.');
    }

    if (currentUserRole !== 'ADMIN' && existing.ownerId !== parseInt(currentUserId, 10)) {
      throw new ApiError(403, 'Access denied. You can only delete your own vehicles.');
    }

    await prisma.vehicle.delete({ where: { id } });
    return { message: 'Vehicle deleted successfully.' };
  }

  /**
   * POST /api/vehicles/:id/documents
   */
  async uploadDocument(vehicleId, ownerId, { documentType, documentUrl, expiryDate }) {
    const id = parseInt(vehicleId, 10);
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found.');
    }

    if (vehicle.ownerId !== parseInt(ownerId, 10)) {
      throw new ApiError(403, 'Access denied. You can only upload documents for your own vehicles.');
    }

    if (!documentType || !documentUrl) {
      throw new ApiError(400, 'Document type and URL are required.');
    }

    const doc = await prisma.vehicleDocument.create({
      data: {
        vehicleId: id,
        documentType,
        documentUrl,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        verificationStatus: 'PENDING',
      },
    });

    return doc;
  }

  /**
   * GET /api/vehicles/:id/documents
   */
  async getDocuments(vehicleId) {
    return await prisma.vehicleDocument.findMany({
      where: { vehicleId: parseInt(vehicleId, 10) },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  /**
   * DELETE /api/vehicles/documents/:id
   */
  async deleteDocument(docId, ownerId, currentUserRole) {
    const id = parseInt(docId, 10);
    const doc = await prisma.vehicleDocument.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!doc) {
      throw new ApiError(404, 'Document not found.');
    }

    if (currentUserRole !== 'ADMIN' && doc.vehicle.ownerId !== parseInt(ownerId, 10)) {
      throw new ApiError(403, 'Access denied.');
    }

    await prisma.vehicleDocument.delete({ where: { id } });
    return { message: 'Document deleted successfully.' };
  }

  /**
   * PATCH /api/vehicles/:id/availability
   */
  async toggleAvailability(vehicleId, ownerId, { status }) {
    const id = parseInt(vehicleId, 10);
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found.');
    }

    if (vehicle.ownerId !== parseInt(ownerId, 10)) {
      throw new ApiError(403, 'Access denied.');
    }

    const validStatuses = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Allowed: ${validStatuses.join(', ')}`);
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: { status },
    });

    return this._formatVehicle(updated);
  }

  /**
   * ADMIN: PATCH /api/admin/vehicles/:id/verify
   */
  async verifyVehicle(adminId, vehicleId, { isVerified, rejectionReason }) {
    const id = parseInt(vehicleId, 10);
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found.');
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: { isVerified: Boolean(isVerified) },
    });

    // Notify owner
    const eventType = isVerified ? 'VERIFIED' : 'REJECTED';
    await this._triggerVehicleNotifications(vehicle.ownerId, updated, eventType, rejectionReason);

    return this._formatVehicle(updated);
  }

  /**
   * ADMIN: PATCH /api/admin/vehicles/:id/status
   */
  async updateVehicleStatusByAdmin(adminId, vehicleId, { status }) {
    const id = parseInt(vehicleId, 10);
    const validStatuses = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'BLOCKED'];

    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Allowed: ${validStatuses.join(', ')}`);
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found.');
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: { status },
    });

    await this._triggerVehicleNotifications(vehicle.ownerId, updated, 'STATUS_CHANGE');

    return this._formatVehicle(updated);
  }

  /**
   * ADMIN: GET /api/admin/vehicles
   */
  async getAdminFleet({ page = 1, limit = 20, search = '', status, isVerified, fuelType, vehicleType }) {
    const pageNum  = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip     = (pageNum - 1) * limitNum;

    const where = {};

    if (search) {
      where.OR = [
        { registrationNumber: { contains: search } },
        { model:              { contains: search } },
        { manufacturer:       { contains: search } },
        { owner: { name:      { contains: search } } },
        { owner: { email:     { contains: search } } },
      ];
    }

    if (status)                            where.status      = status;
    if (isVerified !== undefined && isVerified !== '') where.isVerified  = isVerified === 'true' || isVerified === true;
    if (fuelType)                          where.fuelType    = fuelType;
    if (vehicleType)                        where.vehicleType = vehicleType;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, email: true, phone: true, department: true } },
          documents: true,
          _count: { select: { rides: true } },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      vehicles: vehicles.map((v) => this._formatVehicle(v)),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}

export default new VehicleService();
