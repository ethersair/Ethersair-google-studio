import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, real } from 'drizzle-orm/pg-core';

// Define the 'users' table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'user_transactions' table
export const userTransactions = pgTable('user_transactions', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid)
    .notNull(),
  type: text('type').notNull(),
  chain: text('chain').notNull(),
  details: text('details').notNull(),
  amount: text('amount').notNull(),
  status: text('status').notNull(),
  timestamp: text('timestamp').notNull(),
  txHash: text('tx_hash').notNull(),
});

// Define the 'user_staking_pools' table
export const userStakingPools = pgTable('user_staking_pools', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid)
    .notNull(),
  tokenSymbol: text('token_symbol').notNull(),
  poolName: text('pool_name').notNull(),
  apy: real('apy').notNull(),
  staked: real('staked').notNull(),
  rewards: real('rewards').notNull(),
  chain: text('chain').notNull(),
});

// Define the 'user_nfts' table
export const userNfts = pgTable('user_nfts', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid)
    .notNull(),
  name: text('name').notNull(),
  collection: text('collection').notNull(),
  imageGradient: text('image_gradient').notNull(),
  rarity: text('rarity').notNull(),
  powerRating: integer('power_rating').notNull(),
  mintedAt: text('minted_at').notNull(),
});

// Define the 'user_inscriptions' table
export const userInscriptions = pgTable('user_inscriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid)
    .notNull(),
  number: text('number').notNull(),
  contentType: text('content_type').notNull(),
  sat: text('sat').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  feeRate: real('fee_rate').notNull(),
  name: text('name').notNull(),
  timestamp: text('timestamp').notNull(),
});

// Define relations for 'users'
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(userTransactions),
  stakingPools: many(userStakingPools),
  nfts: many(userNfts),
  inscriptions: many(userInscriptions),
}));

// Define relations for tables back to 'users'
export const userTransactionsRelations = relations(userTransactions, ({ one }) => ({
  user: one(users, {
    fields: [userTransactions.userId],
    references: [users.uid],
  }),
}));

export const userStakingPoolsRelations = relations(userStakingPools, ({ one }) => ({
  user: one(users, {
    fields: [userStakingPools.userId],
    references: [users.uid],
  }),
}));

export const userNftsRelations = relations(userNfts, ({ one }) => ({
  user: one(users, {
    fields: [userNfts.userId],
    references: [users.uid],
  }),
}));

export const userInscriptionsRelations = relations(userInscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userInscriptions.userId],
    references: [users.uid],
  }),
}));
