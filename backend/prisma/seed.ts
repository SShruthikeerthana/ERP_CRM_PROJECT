import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Mini ERP + CRM Database...');

  // 1. Clean existing records
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.followUpNote.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const salesPasswordHash = await bcrypt.hash('Sales123!', 10);
  const warehousePasswordHash = await bcrypt.hash('Warehouse123!', 10);
  const accountsPasswordHash = await bcrypt.hash('Accounts123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@operations.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Sarah Sales Manager',
      email: 'sales@operations.com',
      password: salesPasswordHash,
      role: 'SALES',
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Winston Warehouse Officer',
      email: 'warehouse@operations.com',
      password: warehousePasswordHash,
      role: 'WAREHOUSE',
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Arthur Accounts Lead',
      email: 'accounts@operations.com',
      password: accountsPasswordHash,
      role: 'ACCOUNTS',
    },
  });

  console.log('✅ Users created successfully:');
  console.log('   - Admin: admin@operations.com / Admin123!');
  console.log('   - Sales: sales@operations.com / Sales123!');
  console.log('   - Warehouse: warehouse@operations.com / Warehouse123!');
  console.log('   - Accounts: accounts@operations.com / Accounts123!');

  // 3. Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Rajesh Kumar',
      mobile: '+91 98765 43210',
      email: 'rajesh@apextraders.com',
      businessName: 'Apex Wholesale Traders',
      gstNumber: '27AAAAA0000A1Z5',
      customerType: 'Wholesale',
      address: 'Plot 42, Industrial Area Phase II, Mumbai',
      status: 'Active',
      followUpDate: '2026-08-15',
      notes: 'Key distributor for Western region. High order volume.',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Priya Sharma',
      mobile: '+91 91234 56789',
      email: 'priya@retailjunction.in',
      businessName: 'Retail Junction Stores',
      gstNumber: '27BBBCA1111B2Z3',
      customerType: 'Retail',
      address: 'Shop 12, Commercial Complex, MG Road, Pune',
      status: 'Lead',
      followUpDate: '2026-08-12',
      notes: 'Interested in buying bulk copper spools. Awaiting quotation.',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Anil Mehta',
      mobile: '+91 99887 76655',
      email: 'amehta@globallogistics.org',
      businessName: 'Global Distribution Network',
      gstNumber: '27CCCCB2222C3Z1',
      customerType: 'Distributor',
      address: 'Warehouse 4B, Port Logistics Zone, Navi Mumbai',
      status: 'Active',
      followUpDate: '2026-08-20',
      notes: 'Requires delivery challan copy with GST details.',
    },
  });

  // 4. Follow-up Notes
  await prisma.followUpNote.create({
    data: {
      customerId: customer1.id,
      note: 'Called client to discuss quarterly wholesale discount structure. Client agreed to renew contract.',
      createdById: salesUser.id,
    },
  });

  await prisma.followUpNote.create({
    data: {
      customerId: customer2.id,
      note: 'Sent product catalog and pricing sheet via email.',
      createdById: salesUser.id,
    },
  });

  console.log('✅ Customers & Follow-up notes seeded');

  // 5. Create Products
  const product1 = await prisma.product.create({
    data: {
      name: 'Industrial Steel Pipe 2-inch',
      sku: 'PROD-STEEL-01',
      category: 'Hardware & Piping',
      unitPrice: 1250.0,
      currentStock: 120,
      minStockAlert: 25,
      location: 'Rack A-14, Bay 2',
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Heavy Duty Copper Wire Spool (100m)',
      sku: 'PROD-COPPER-02',
      category: 'Electrical Supplies',
      unitPrice: 3400.0,
      currentStock: 4, // Below minStockAlert!
      minStockAlert: 15,
      location: 'Shelf E-03',
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Brass Control Valve 1/2 inch',
      sku: 'PROD-VALVE-03',
      category: 'Hardware & Piping',
      unitPrice: 890.0,
      currentStock: 65,
      minStockAlert: 10,
      location: 'Rack B-08',
    },
  });

  console.log('✅ Products seeded (including copper spool with low stock alert)');

  // 6. Stock Movements
  await prisma.stockMovement.create({
    data: {
      productId: product1.id,
      quantityChanged: 120,
      movementType: 'IN',
      reason: 'Initial Inventory Inward Receiving',
      createdById: warehouseUser.id,
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: product2.id,
      quantityChanged: 20,
      movementType: 'IN',
      reason: 'Batch Stocking',
      createdById: warehouseUser.id,
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: product2.id,
      quantityChanged: 16,
      movementType: 'OUT',
      reason: 'Dispatched to retail outlet',
      createdById: warehouseUser.id,
    },
  });

  // 7. Seed Sample Sales Challan
  const challan1 = await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-00001',
      customerId: customer1.id,
      status: 'Confirmed',
      totalQuantity: 10,
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 10,
            productName: product1.name,
            sku: product1.sku,
            unitPrice: product1.unitPrice,
          },
        ],
      },
    },
  });

  console.log('✅ Sample Sales Challan CH-2026-00001 seeded');
  console.log('🎉 Database Seeding Completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
