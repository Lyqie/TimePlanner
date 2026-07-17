import { PrismaClient } from '@prisma/client';

// 单例，避免热重载（tsx watch）下创建多个连接导致泄漏。
const prisma = new PrismaClient();
export default prisma;
