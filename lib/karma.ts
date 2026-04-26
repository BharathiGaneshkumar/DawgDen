import { prisma } from "./prisma";

export async function calculateKarma(userId: string): Promise<number> {
  const [reviewCount, postAgg, soldCount] = await Promise.all([
    prisma.review.count({ where: { userId } }),
    prisma.post.aggregate({ where: { userId }, _sum: { upvotes: true } }),
    prisma.marketplaceItem.count({ where: { userId, isSold: true } }),
  ]);

  return reviewCount * 10 + (postAgg._sum.upvotes ?? 0) + soldCount * 5;
}
