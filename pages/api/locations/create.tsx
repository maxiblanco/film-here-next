import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const prisma = new PrismaClient({ log: ['query'] });

  //TODO ADD REQUIRED FIELDS
  try {
    const { location: locationData } = req.body;
    const location = await prisma.location.create({
      data: {
        latitude: locationData.latitude,
        longitude: locationData.longitude
      }
    });
    res.status(201);
    res.json({ location });
  } catch (err) {
    res.status(500);
    res.json({ error: 'Sorry unable to save location to database' });
  } finally {
    await prisma.$disconnect();
  }
}
