import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function (req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient({ log: ['query'] });

    try {
        const locations = await prisma.location.findMany();
        res.json({ locations });
        res.status(200);
    } catch (err) {
        res.status(500);
        res.json({ error: 'Sorry unable to fetch locations.', message: err.message });
    } finally {
        await prisma.$disconnect();
    }
}
