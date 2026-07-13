import { db } from './index.ts';
import { users, userTransactions, userStakingPools, userNfts, userInscriptions } from './schema.ts';
import { eq, and } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Failed to get or create user.', { cause: error });
  }
}

export async function getUserData(uid: string) {
  try {
    const userTx = await db.select().from(userTransactions).where(eq(userTransactions.userId, uid));
    const userStake = await db.select().from(userStakingPools).where(eq(userStakingPools.userId, uid));
    const nfts = await db.select().from(userNfts).where(eq(userNfts.userId, uid));
    const inscriptions = await db.select().from(userInscriptions).where(eq(userInscriptions.userId, uid));

    return {
      transactions: userTx,
      stakingPools: userStake,
      nfts,
      inscriptions,
    };
  } catch (error) {
    console.error('Error in getUserData:', error);
    throw new Error('Failed to get user data.', { cause: error });
  }
}

export async function saveUserTransaction(uid: string, tx: any) {
  try {
    const result = await db.insert(userTransactions)
      .values({
        userId: uid,
        type: tx.type,
        chain: tx.chain,
        details: tx.details,
        amount: tx.amount,
        status: tx.status,
        timestamp: tx.timestamp,
        txHash: tx.txHash,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in saveUserTransaction:', error);
    throw new Error('Failed to save transaction.', { cause: error });
  }
}

export async function saveUserStakingPool(uid: string, pool: any) {
  try {
    const result = await db.insert(userStakingPools)
      .values({
        userId: uid,
        tokenSymbol: pool.tokenSymbol,
        poolName: pool.poolName,
        apy: pool.apy,
        staked: pool.staked,
        rewards: pool.rewards,
        chain: pool.chain,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in saveUserStakingPool:', error);
    throw new Error('Failed to save staking pool.', { cause: error });
  }
}

export async function updateUserStakingPool(uid: string, poolId: number, staked: number, rewards: number) {
  try {
    const result = await db.update(userStakingPools)
      .set({ staked, rewards })
      .where(and(eq(userStakingPools.userId, uid), eq(userStakingPools.id, poolId)))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in updateUserStakingPool:', error);
    throw new Error('Failed to update staking pool.', { cause: error });
  }
}

export async function saveUserNFT(uid: string, nft: any) {
  try {
    const result = await db.insert(userNfts)
      .values({
        userId: uid,
        name: nft.name,
        collection: nft.collection,
        imageGradient: nft.imageGradient,
        rarity: nft.rarity,
        powerRating: nft.powerRating,
        mintedAt: nft.mintedAt,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in saveUserNFT:', error);
    throw new Error('Failed to save NFT.', { cause: error });
  }
}

export async function deleteUserNFT(uid: string, nftId: number) {
  try {
    const result = await db.delete(userNfts)
      .where(and(eq(userNfts.userId, uid), eq(userNfts.id, nftId)))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in deleteUserNFT:', error);
    throw new Error('Failed to delete NFT.', { cause: error });
  }
}

export async function saveUserInscription(uid: string, inscription: any) {
  try {
    const result = await db.insert(userInscriptions)
      .values({
        userId: uid,
        number: inscription.number,
        contentType: inscription.contentType,
        sat: inscription.sat,
        sizeBytes: inscription.sizeBytes,
        feeRate: inscription.feeRate,
        name: inscription.name,
        timestamp: inscription.timestamp,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in saveUserInscription:', error);
    throw new Error('Failed to save inscription.', { cause: error });
  }
}
