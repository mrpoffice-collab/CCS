import { pgTable, uuid, varchar, text, boolean, timestamp, integer, decimal, pgEnum, jsonb, inet, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'starter', 'growth', 'scale'])
export const campaignStatusEnum = pgEnum('campaign_status', ['draft', 'pending_review', 'active', 'paused', 'completed', 'failed'])
export const campaignPlatformEnum = pgEnum('campaign_platform', ['twitter', 'linkedin', 'seo', 'cross_promo'])
export const espProviderEnum = pgEnum('esp_provider', ['beehiiv', 'convertkit', 'mailchimp', 'custom'])
export const adStatusEnum = pgEnum('ad_status', ['draft', 'pending', 'approved', 'rejected', 'active', 'paused'])
export const landingPageStatusEnum = pgEnum('landing_page_status', ['draft', 'published', 'archived'])

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: boolean('email_verified').default(false),
  passwordHash: varchar('password_hash', { length: 255 }),
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).unique(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  subscriptionCurrentPeriodEnd: timestamp('subscription_current_period_end', { withTimezone: true }),
  monthlyAdSpendLimitCents: integer('monthly_ad_spend_limit_cents').default(0),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
}))

// OAuth Accounts
export const oauthAccounts = pgTable('oauth_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  providerAccountUnique: uniqueIndex('oauth_provider_account_unique').on(table.provider, table.providerAccountId),
}))

// Sessions
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).unique().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Newsletters
export const newsletters = pgTable('newsletters', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  websiteUrl: text('website_url'),
  logoUrl: text('logo_url'),
  primaryColor: varchar('primary_color', { length: 7 }).default('#6366f1'),
  espProvider: espProviderEnum('esp_provider'),
  espApiKeyEncrypted: text('esp_api_key_encrypted'),
  espListId: varchar('esp_list_id', { length: 255 }),
  espWebhookSecret: varchar('esp_webhook_secret', { length: 255 }),
  currentSubscriberCount: integer('current_subscriber_count').default(0),
  niche: varchar('niche', { length: 100 }),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Campaigns
export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  newsletterId: uuid('newsletter_id').notNull().references(() => newsletters.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  platform: campaignPlatformEnum('platform').notNull(),
  status: campaignStatusEnum('status').default('draft'),
  objective: varchar('objective', { length: 100 }),
  dailyBudgetCents: integer('daily_budget_cents'),
  totalBudgetCents: integer('total_budget_cents'),
  spentCents: integer('spent_cents').default(0),
  targeting: jsonb('targeting').default({}),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  externalCampaignId: varchar('external_campaign_id', { length: 255 }),
  externalAdSetId: varchar('external_ad_set_id', { length: 255 }),
  aiGeneratedCopy: jsonb('ai_generated_copy').default({}),
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),
  costPerConversionCents: integer('cost_per_conversion_cents'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Ads
export const ads = pgTable('ads', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }),
  status: adStatusEnum('status').default('draft'),
  headline: varchar('headline', { length: 280 }),
  bodyCopy: text('body_copy'),
  imageUrl: text('image_url'),
  ctaText: varchar('cta_text', { length: 50 }),
  destinationUrl: text('destination_url'),
  externalAdId: varchar('external_ad_id', { length: 255 }),
  aiModelUsed: varchar('ai_model_used', { length: 50 }),
  aiPromptVersion: varchar('ai_prompt_version', { length: 20 }),
  aiVariationsTested: integer('ai_variations_tested').default(0),
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),
  ctr: decimal('ctr', { precision: 5, scale: 4 }),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 4 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Landing Pages
export const landingPages = pgTable('landing_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  newsletterId: uuid('newsletter_id').notNull().references(() => newsletters.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  metaDescription: varchar('meta_description', { length: 320 }),
  status: landingPageStatusEnum('status').default('draft'),
  targetKeyword: varchar('target_keyword', { length: 255 }),
  secondaryKeywords: text('secondary_keywords').array(),
  seoScore: integer('seo_score'),
  content: jsonb('content').notNull().default({}),
  aiGenerated: boolean('ai_generated').default(false),
  aiOptimizationSuggestions: jsonb('ai_optimization_suggestions'),
  views: integer('views').default(0),
  uniqueVisitors: integer('unique_visitors').default(0),
  conversions: integer('conversions').default(0),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 4 }),
  avgTimeOnPageSeconds: integer('avg_time_on_page_seconds'),
  bounceRate: decimal('bounce_rate', { precision: 5, scale: 4 }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  newsletterSlugUnique: uniqueIndex('landing_page_newsletter_slug').on(table.newsletterId, table.slug),
}))

// Subscribers
export const subscribers = pgTable('subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  newsletterId: uuid('newsletter_id').notNull().references(() => newsletters.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  espSubscriberId: varchar('esp_subscriber_id', { length: 255 }),
  source: campaignPlatformEnum('source'),
  sourceCampaignId: uuid('source_campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
  sourceLandingPageId: uuid('source_landing_page_id').references(() => landingPages.id, { onDelete: 'set null' }),
  utmSource: varchar('utm_source', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 255 }),
  acquisitionCostCents: integer('acquisition_cost_cents'),
  isActive: boolean('is_active').default(true),
  subscribedAt: timestamp('subscribed_at', { withTimezone: true }).defaultNow(),
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  newsletterEmailUnique: uniqueIndex('subscriber_newsletter_email').on(table.newsletterId, table.email),
}))

// Analytics Daily
export const analyticsDaily = pgTable('analytics_daily', {
  id: uuid('id').primaryKey().defaultRandom(),
  newsletterId: uuid('newsletter_id').notNull().references(() => newsletters.id, { onDelete: 'cascade' }),
  date: timestamp('date', { withTimezone: true }).notNull(),
  newSubscribers: integer('new_subscribers').default(0),
  unsubscribes: integer('unsubscribes').default(0),
  netGrowth: integer('net_growth').default(0),
  totalSubscribers: integer('total_subscribers').default(0),
  twitterSubscribers: integer('twitter_subscribers').default(0),
  linkedinSubscribers: integer('linkedin_subscribers').default(0),
  seoSubscribers: integer('seo_subscribers').default(0),
  crossPromoSubscribers: integer('cross_promo_subscribers').default(0),
  otherSubscribers: integer('other_subscribers').default(0),
  twitterSpendCents: integer('twitter_spend_cents').default(0),
  linkedinSpendCents: integer('linkedin_spend_cents').default(0),
  totalSpendCents: integer('total_spend_cents').default(0),
  avgCpaCents: integer('avg_cpa_cents'),
  landingPageViews: integer('landing_page_views').default(0),
  landingPageConversions: integer('landing_page_conversions').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  newsletterDateUnique: uniqueIndex('analytics_newsletter_date').on(table.newsletterId, table.date),
}))

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  newsletters: many(newsletters),
  campaigns: many(campaigns),
  oauthAccounts: many(oauthAccounts),
  sessions: many(sessions),
}))

export const newslettersRelations = relations(newsletters, ({ one, many }) => ({
  user: one(users, { fields: [newsletters.userId], references: [users.id] }),
  campaigns: many(campaigns),
  landingPages: many(landingPages),
  subscribers: many(subscribers),
}))

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, { fields: [campaigns.userId], references: [users.id] }),
  newsletter: one(newsletters, { fields: [campaigns.newsletterId], references: [newsletters.id] }),
  ads: many(ads),
}))

export const adsRelations = relations(ads, ({ one }) => ({
  campaign: one(campaigns, { fields: [ads.campaignId], references: [campaigns.id] }),
}))
