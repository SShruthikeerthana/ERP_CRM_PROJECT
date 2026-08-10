import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';

const PORT = parseInt(env.PORT, 10) || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Mini ERP + CRM Operations Portal API Server running on port ${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/v1/health`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('🛑 HTTP Server closed & Database disconnected cleanly.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
