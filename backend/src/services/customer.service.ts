import { prisma } from '../config/db';
import { NotFoundError } from '../utils/errors';

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerType?: string;
}

export class CustomerService {
  static async getCustomers(params: CustomerQueryParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (params.status) {
      whereClause.status = params.status;
    }

    if (params.customerType) {
      whereClause.customerType = params.customerType;
    }

    if (params.search && params.search.trim() !== '') {
      const searchTerm = params.search.trim();
      whereClause.OR = [
        { name: { contains: searchTerm } },
        { mobile: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { businessName: { contains: searchTerm } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.customer.count({ where: whereClause }),
      prisma.customer.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { followUpNotes: true, challans: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUpNotes: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            challanNumber: true,
            status: true,
            totalQuantity: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundError(`Customer with ID '${id}' not found`);
    }

    return customer;
  }

  static async createCustomer(data: any) {
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email || null,
        businessName: data.businessName,
        gstNumber: data.gstNumber || null,
        customerType: data.customerType,
        address: data.address,
        status: data.status || 'Lead',
        followUpDate: data.followUpDate || null,
        notes: data.notes || null,
      },
    });
    return customer;
  }

  static async updateCustomer(id: string, data: any) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Customer with ID '${id}' not found`);
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.mobile !== undefined && { mobile: data.mobile }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.businessName !== undefined && { businessName: data.businessName }),
        ...(data.gstNumber !== undefined && { gstNumber: data.gstNumber || null }),
        ...(data.customerType !== undefined && { customerType: data.customerType }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.followUpDate !== undefined && { followUpDate: data.followUpDate || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
      },
    });

    return updated;
  }

  static async addFollowUpNote(customerId: string, noteText: string, createdById: string) {
    const existing = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!existing) {
      throw new NotFoundError(`Customer with ID '${customerId}' not found`);
    }

    const newNote = await prisma.followUpNote.create({
      data: {
        customerId,
        note: noteText,
        createdById,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return newNote;
  }
}
