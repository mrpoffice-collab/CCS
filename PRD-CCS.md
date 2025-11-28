# CCS - Complete Developer-Ready PRD

## Executive Summary

**Product Name:** CCS

**Description:** CCS is a newsletter subscriber acquisition platform that helps creators and businesses grow their email lists through Twitter/X ads, LinkedIn ads, SEO-optimized landing pages, and cross-promotion networks—completely avoiding Meta's advertising ecosystem. The platform uses AI to generate high-converting ad copy and SEO content while providing unified analytics across all growth channels.

**Target Audience:** Newsletter creators, content marketers, solopreneurs, and small media companies with 1K-100K subscribers seeking diversified growth channels.

**Core Value Proposition:** Grow your newsletter 3x faster without touching Facebook or Instagram ads, using AI-optimized campaigns across Twitter, LinkedIn, and organic search.

---

## Problem Statement

Newsletter creators over-rely on Meta ads, facing:
- Rising CPAs ($2-5+ per subscriber)
- Account bans and policy changes
- Audience fatigue on Meta platforms
- No diversification strategy

Current alternatives (manual Twitter ads, LinkedIn outreach, SEO agencies) are fragmented, expensive, and time-consuming.

---

## Complete Database Schema (Neon PostgreSQL)

```sql
-- File: /database/schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'growth', 'scale');
CREATE TYPE campaign_status AS ENUM ('draft', 'pending_review', 'active', 'paused', 'completed', 'failed');
CREATE TYPE campaign_platform AS ENUM ('twitter', 'linkedin', 'seo', 'cross_promo');
CREATE TYPE esp_provider AS ENUM ('beehiiv', 'convertkit', 'mailchimp', 'custom');
CREATE TYPE webhook_event_type AS ENUM ('subscriber_added', 'subscriber_removed', 'campaign_sent', 'email_opened', 'link_clicked');
CREATE TYPE ad_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'active', 'paused');
CREATE TYPE landing_page_status AS ENUM ('draft', 'published', 'archived');

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255), -- NULL if OAuth only
    name VARCHAR(255),
    avatar_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255),
    subscription_current_period_end TIMESTAMP WITH TIME ZONE,
    monthly_ad_spend_limit_cents INTEGER DEFAULT 0,
    timezone VARCHAR(50) DEFAULT 'UTC',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- OAUTH ACCOUNTS
CREATE TABLE oauth_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'twitter', 'linkedin'
    provider_account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_oauth_user ON oauth_accounts(user_id);

-- SESSIONS
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- NEWSLETTERS (user can have multiple)
CREATE TABLE newsletters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#6366f1', -- hex
    esp_provider esp_provider,
    esp_api_key_encrypted TEXT, -- encrypted with pgcrypto
    esp_list_id VARCHAR(255),
    esp_webhook_secret VARCHAR(255),
    current_subscriber_count INTEGER DEFAULT 0,
    niche VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_newsletters_user ON newsletters(user_id);

-- AD PLATFORM CONNECTIONS
CREATE TABLE ad_platform_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform campaign_platform NOT NULL,
    account_id VARCHAR(255), -- platform's account ID
    account_name VARCHAR(255),
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

CREATE INDEX idx_ad_connections_user ON ad_platform_connections(user_id);

-- CAMPAIGNS
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    platform campaign_platform NOT NULL,
    status campaign_status DEFAULT 'draft',
    objective VARCHAR(100), -- 'subscriber_growth', 'brand_awareness'

    -- Budget
    daily_budget_cents INTEGER,
    total_budget_cents INTEGER,
    spent_cents INTEGER DEFAULT 0,

    -- Targeting (JSONB for flexibility)
    targeting JSONB DEFAULT '{}',
    /*
    Example targeting structure:
    {
        "locations": ["US", "CA", "GB"],
        "age_min": 25,
        "age_max": 54,
        "interests": ["technology", "startups"],
        "job_titles": ["CEO", "Founder"], -- LinkedIn
        "followers_of": ["@paulgraham", "@naval"], -- Twitter
        "exclude_existing_subscribers": true
    }
    */

    -- Schedule
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,

    -- Platform-specific IDs
    external_campaign_id VARCHAR(255),
    external_ad_set_id VARCHAR(255),

    -- AI Generation metadata
    ai_generated_copy JSONB DEFAULT '{}',

    -- Stats (denormalized for quick access)
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    cost_per_conversion_cents INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_campaigns_user ON campaigns(user_id);
CREATE INDEX idx_campaigns_newsletter ON campaigns(newsletter_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_platform ON campaigns(platform);

-- ADS (multiple ads per campaign)
CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255),
    status ad_status DEFAULT 'draft',

    -- Creative
    headline VARCHAR(280),
    body_copy TEXT,
    image_url TEXT,
    cta_text VARCHAR(50),
    destination_url TEXT,

    -- Platform-specific
    external_ad_id VARCHAR(255),

    -- AI metadata
    ai_model_used VARCHAR(50), -- 'gpt-4', 'claude-3'
    ai_prompt_version VARCHAR(20),
    ai_variations_tested INTEGER DEFAULT 0,

    -- Stats
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ctr DECIMAL(5,4), -- click-through rate
    conversion_rate DECIMAL(5,4),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ads_campaign ON ads(campaign_id);
CREATE INDEX idx_ads_status ON ads(status);

-- LANDING PAGES
CREATE TABLE landing_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
    slug VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    meta_description VARCHAR(320),
    status landing_page_status DEFAULT 'draft',

    -- SEO
    target_keyword VARCHAR(255),
    secondary_keywords TEXT[], -- array
    seo_score INTEGER, -- 0-100

    -- Content (structured for rendering)
    content JSONB NOT NULL DEFAULT '{}',
    /*
    {
        "hero": {
            "headline": "...",
            "subheadline": "...",
            "cta_text": "Subscribe Now",
            "background_image": "..."
        },
        "benefits": [...],
        "social_proof": {...},
        "faq": [...]
    }
    */

    -- AI metadata
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_optimization_suggestions JSONB,

    -- Stats
    views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,4),
    avg_time_on_page_seconds INTEGER,
    bounce_rate DECIMAL(5,4),

    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(newsletter_id, slug)
);

CREATE INDEX idx_landing_pages_newsletter ON landing_pages(newsletter_id);
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX idx_landing_pages_status ON landing_pages(status);

-- SUBSCRIBERS (synced from ESP)
CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    esp_subscriber_id VARCHAR(255),

    -- Attribution
    source campaign_platform,
    source_campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    source_landing_page_id UUID REFERENCES landing_pages(id) ON DELETE SET NULL,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(255),

    -- Calculated acquisition cost
    acquisition_cost_cents INTEGER,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(newsletter_id, email)
);

CREATE INDEX idx_subscribers_newsletter ON subscribers(newsletter_id);
CREATE INDEX idx_subscribers_source ON subscribers(source);
CREATE INDEX idx_subscribers_campaign ON subscribers(source_campaign_id);
CREATE INDEX idx_subscribers_date ON subscribers(subscribed_at);

-- CROSS PROMOTION NETWORK
CREATE TABLE cross_promo_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,

    -- Listing details
    tagline VARCHAR(255),
    description TEXT,
    categories TEXT[],
    subscriber_count_range VARCHAR(50), -- '1k-5k', '5k-10k', etc.

    -- Preferences
    min_partner_subscribers INTEGER DEFAULT 0,
    preferred_niches TEXT[],
    excluded_niches TEXT[],

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,

    -- Stats
    swaps_completed INTEGER DEFAULT 0,
    avg_subscribers_received INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cross_promo_newsletter ON cross_promo_listings(newsletter_id);
CREATE INDEX idx_cross_promo_active ON cross_promo_listings(is_active);

-- CROSS PROMOTION MATCHES
CREATE TABLE cross_promo_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_listing_id UUID NOT NULL REFERENCES cross_promo_listings(id) ON DELETE CASCADE,
    target_listing_id UUID NOT NULL REFERENCES cross_promo_listings(id) ON DELETE CASCADE,

    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'completed'

    -- Tracking
    requester_sent_date DATE,
    target_sent_date DATE,
    requester_subscribers_gained INTEGER DEFAULT 0,
    target_subscribers_gained INTEGER DEFAULT 0,

    message TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_promo_matches_requester ON cross_promo_matches(requester_listing_id);
CREATE INDEX idx_promo_matches_target ON cross_promo_matches(target_listing_id);

-- WEBHOOK EVENTS (audit log)
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID REFERENCES newsletters(id) ON DELETE SET NULL,
    esp_provider esp_provider,
    event_type webhook_event_type,
    payload JSONB,
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_newsletter ON webhook_events(newsletter_id);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_webhook_events_created ON webhook_events(created_at);

-- ANALYTICS DAILY (aggregated)
CREATE TABLE analytics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Subscriber metrics
    new_subscribers INTEGER DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    net_growth INTEGER DEFAULT 0,
    total_subscribers INTEGER DEFAULT 0,

    -- Channel breakdown
    twitter_subscribers INTEGER DEFAULT 0,
    linkedin_subscribers INTEGER DEFAULT 0,
    seo_subscribers INTEGER DEFAULT 0,
    cross_promo_subscribers INTEGER DEFAULT 0,
    other_subscribers INTEGER DEFAULT 0,

    -- Spend
    twitter_spend_cents INTEGER DEFAULT 0,
    linkedin_spend_cents INTEGER DEFAULT 0,
    total_spend_cents INTEGER DEFAULT 0,

    -- Calculated
    avg_cpa_cents INTEGER,

    -- Landing page
    landing_page_views INTEGER DEFAULT 0,
    landing_page_conversions INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(newsletter_id, date)
);

CREATE INDEX idx_analytics_daily_newsletter ON analytics_daily(newsletter_id);
CREATE INDEX idx_analytics_daily_date ON analytics_daily(date);

-- AI GENERATION LOGS
CREATE TABLE ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    generation_type VARCHAR(50), -- 'ad_copy', 'seo_content', 'landing_page'
    model VARCHAR(50), -- 'gpt-4', 'claude-3-sonnet'

    input_prompt TEXT,
    input_tokens INTEGER,
    output_text TEXT,
    output_tokens INTEGER,

    cost_cents INTEGER,
    latency_ms INTEGER,

    rating INTEGER, -- user rating 1-5

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_user ON ai_generation_logs(user_id);
CREATE INDEX idx_ai_logs_type ON ai_generation_logs(generation_type);

-- API KEYS (for ESP webhooks, etc.)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    key_hash VARCHAR(255) NOT NULL, -- hashed API key
    key_prefix VARCHAR(10), -- first 8 chars for identification
    permissions TEXT[], -- ['webhooks:write', 'analytics:read']
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- BILLING EVENTS
CREATE TABLE billing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_event_id VARCHAR(255) UNIQUE,
    event_type VARCHAR(100),
    amount_cents INTEGER,
    currency VARCHAR(3) DEFAULT 'usd',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_billing_user ON billing_events(user_id);

-- FUNCTIONS & TRIGGERS

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_newsletters_updated_at BEFORE UPDATE ON newsletters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_landing_pages_updated_at BEFORE UPDATE ON landing_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to update newsletter subscriber count
CREATE OR REPLACE FUNCTION update_newsletter_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE newsletters
        SET current_subscriber_count = (
            SELECT COUNT(*) FROM subscribers
            WHERE newsletter_id = NEW.newsletter_id AND is_active = TRUE
        )
        WHERE id = NEW.newsletter_id;
    END IF;
    IF TG_OP = 'DELETE' THEN
        UPDATE newsletters
        SET current_subscriber_count = (
            SELECT COUNT(*) FROM subscribers
            WHERE newsletter_id = OLD.newsletter_id AND is_active = TRUE
        )
        WHERE id = OLD.newsletter_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_subscriber_count
    AFTER INSERT OR UPDATE OR DELETE ON subscribers
    FOR EACH ROW EXECUTE FUNCTION update_newsletter_subscriber_count();
```

---

## Complete API Endpoints

### Base Configuration
```typescript
// File: /src/lib/api-config.ts

export const API_CONFIG = {
  baseUrl: '/api',
  version: 'v1',
  rateLimit: {
    default: { requests: 100, windowMs: 60000 }, // 100/min
    auth: { requests: 10, windowMs: 60000 }, // 10/min
    ai: { requests: 20, windowMs: 60000 }, // 20/min
    webhook: { requests: 1000, windowMs: 60000 }, // 1000/min
  }
};
```

### Authentication Endpoints

```typescript
// POST /api/v1/auth/register
// Rate limit: auth (10/min)
// Auth: None
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}
interface RegisterResponse {
  user: { id: string; email: string; name: string };
  token: string;
  expiresAt: string;
}

// POST /api/v1/auth/login
// Rate limit: auth
// Auth: None
interface LoginRequest {
  email: string;
  password: string;
}
interface LoginResponse {
  user: User;
  token: string;
  expiresAt: string;
}

// POST /api/v1/auth/logout
// Rate limit: default
// Auth: Required
interface LogoutResponse {
  success: boolean;
}

// GET /api/v1/auth/me
// Auth: Required
interface MeResponse {
  user: User;
  subscription: SubscriptionDetails;
}

// POST /api/v1/auth/oauth/twitter
// POST /api/v1/auth/oauth/linkedin
// POST /api/v1/auth/oauth/google
// Auth: None (initiates OAuth flow)
interface OAuthInitResponse {
  authUrl: string;
}

// GET /api/v1/auth/oauth/callback/:provider
// Handles OAuth callback, creates/links account

// POST /api/v1/auth/forgot-password
interface ForgotPasswordRequest {
  email: string;
}

// POST /api/v1/auth/reset-password
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
```

### Newsletter Endpoints

```typescript
// GET /api/v1/newsletters
// Auth: Required
// Returns all newsletters for current user
interface NewslettersResponse {
  newsletters: Newsletter[];
}

// POST /api/v1/newsletters
// Auth: Required
interface CreateNewsletterRequest {
  name: string;
  description?: string;
  websiteUrl?: string;
  niche?: string;
  espProvider?: 'beehiiv' | 'convertkit' | 'mailchimp' | 'custom';
  espApiKey?: string;
  espListId?: string;
}
interface CreateNewsletterResponse {
  newsletter: Newsletter;
  webhookUrl: string; // for ESP integration
  webhookSecret: string;
}

// GET /api/v1/newsletters/:id
// PATCH /api/v1/newsletters/:id
// DELETE /api/v1/newsletters/:id

// POST /api/v1/newsletters/:id/sync-subscribers
// Triggers ESP sync
interface SyncResponse {
  synced: number;
  newSubscribers: number;
  errors: string[];
}

// GET /api/v1/newsletters/:id/subscribers
// Query params: page, limit, source, dateFrom, dateTo
interface SubscribersResponse {
  subscribers: Subscriber[];
  pagination: { page: number; limit: number; total: number };
}
```

### Campaign Endpoints

```typescript
// GET /api/v1/campaigns
// Query: newsletterId, platform, status, page, limit
// Auth: Required

// POST /api/v1/campaigns
// Auth: Required
interface CreateCampaignRequest {
  newsletterId: string;
  name: string;
  platform: 'twitter' | 'linkedin' | 'seo' | 'cross_promo';
  objective?: string;
  dailyBudgetCents?: number;
  totalBudgetCents?: number;
  targeting?: {
    locations?: string[];
    ageMin?: number;
    ageMax?: number;
    interests?: string[];
    jobTitles?: string[]; // LinkedIn
    followersOf?: string[]; // Twitter
  };
  startDate?: string;
  endDate?: string;
}

// GET /api/v1/campaigns/:id
// PATCH /api/v1/campaigns/:id
// DELETE /api/v1/campaigns/:id

// POST /api/v1/campaigns/:id/launch
// Submits campaign to ad platform
interface LaunchResponse {
  success: boolean;
  externalCampaignId: string;
  status: string;
}

// POST /api/v1/campaigns/:id/pause
// POST /api/v1/campaigns/:id/resume

// GET /api/v1/campaigns/:id/analytics
// Query: dateFrom, dateTo, granularity (hour|day|week)
interface CampaignAnalyticsResponse {
  summary: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    cpa: number;
    ctr: number;
  };
  timeseries: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  }>;
}
```

### Ad Endpoints

```typescript
// GET /api/v1/campaigns/:campaignId/ads
// POST /api/v1/campaigns/:campaignId/ads
interface CreateAdRequest {
  name?: string;
  headline: string;
  bodyCopy: string;
  imageUrl?: string;
  ctaText?: string;
  destinationUrl: string;
}

// GET /api/v1/ads/:id
// PATCH /api/v1/ads/:id
// DELETE /api/v1/ads/:id

// POST /api/v1/ads/:id/duplicate
// Creates a variant for A/B testing
```

### AI Generation Endpoints

```typescript
// POST /api/v1/ai/generate-ad-copy
// Rate limit: ai (20/min)
// Auth: Required
interface GenerateAdCopyRequest {
  newsletterDescription: string;
  targetAudience: string;
  platform: 'twitter' | 'linkedin';
  tone?: 'professional' | 'casual' | 'urgent' | 'curious';
  existingHeadlines?: string[]; // for variation generation
  count?: number; // number of variations (1-5)
}
interface GenerateAdCopyResponse {
  variations: Array<{
    headline: string;
    bodyCopy: string;
    ctaText: string;
    reasoning: string; // why this copy might work
  }>;
  tokensUsed: number;
}

// POST /api/v1/ai/optimize-seo
// Rate limit: ai
// Auth: Required
interface OptimizeSeoRequest {
  targetKeyword: string;
  currentContent?: string;
  pageType: 'landing_page' | 'blog_post';
  newsletterNiche: string;
}
interface OptimizeSeoResponse {
  optimizedTitle: string;
  metaDescription: string;
  headings: string[];
  contentSuggestions: string[];
  keywordDensityTarget: number;
  seoScore: number;
  improvements: string[];
}

// POST /api/v1/ai/generate-landing-page
// Auth: Required
interface GenerateLandingPageRequest {
  newsletterName: string;
  newsletterDescription: string;
  targetKeyword: string;
  benefits?: string[];
  socialProof?: { subscriberCount?: number; testimonials?: string[] };
}
interface GenerateLandingPageResponse {
  content: LandingPageContent;
  seoMeta: { title: string; description: string };
}

// POST /api/v1/ai/analyze-competitor
// Auth: Required
interface AnalyzeCompetitorRequest {
  competitorUrl: string;
}
interface AnalyzeCompetitorResponse {
  analysis: {
    valueProposition: string;
    targetAudience: string;
    ctaStrategies: string[];
    contentThemes: string[];
    suggestedDifferentiators: string[];
  };
}
```

### Landing Page Endpoints

```typescript
// GET /api/v1/landing-pages
// Query: newsletterId, status

// POST /api/v1/landing-pages
interface CreateLandingPageRequest {
  newsletterId: string;
  slug: string;
  title: string;
  metaDescription?: string;
  targetKeyword?: string;
  content: LandingPageContent;
}

// GET /api/v1/landing-pages/:id
// PATCH /api/v1/landing-pages/:id
// DELETE /api/v1/landing-pages/:id

// POST /api/v1/landing-pages/:id/publish
// POST /api/v1/landing-pages/:id/unpublish

// GET /api/v1/landing-pages/:id/analytics
// Query: dateFrom, dateTo

// POST /api/v1/landing-pages/:id/duplicate
```

### Cross-Promotion Endpoints

```typescript
// GET /api/v1/cross-promo/listings
// Query: niche, minSubscribers, maxSubscribers, page

// POST /api/v1/cross-promo/listings
interface CreateListingRequest {
  newsletterId: string;
  tagline: string;
  description: string;
  categories: string[];
  subscriberCountRange: string;
  minPartnerSubscribers?: number;
  preferredNiches?: string[];
}

// GET /api/v1/cross-promo/listings/:id
// PATCH /api/v1/cross-promo/listings/:id

// GET /api/v1/cross-promo/matches
// Returns potential and active matches

// POST /api/v1/cross-promo/matches
interface RequestMatchRequest {
  targetListingId: string;
  message?: string;
}

// PATCH /api/v1/cross-promo/matches/:id
interface UpdateMatchRequest {
  status: 'accepted' | 'declined';
}

// POST /api/v1/cross-promo/matches/:id/complete
interface CompleteMatchRequest {
  subscribersGained: number;
  sentDate: string;
}
```

### Analytics Endpoints

```typescript
// GET /api/v1/analytics/dashboard
// Auth: Required
// Query: newsletterId, dateFrom, dateTo
interface DashboardAnalyticsResponse {
  overview: {
    totalSubscribers: number;
    subscribersThisPeriod: number;
    growthRate: number;
    totalSpend: number;
    avgCpa: number;
  };
  byChannel: {
    twitter: ChannelStats;
    linkedin: ChannelStats;
    seo: ChannelStats;
    crossPromo: ChannelStats;
  };
  topCampaigns: CampaignSummary[];
  topLandingPages: LandingPageSummary[];
  timeseries: DailyStats[];
}

// GET /api/v1/analytics/export
// Query: newsletterId, dateFrom, dateTo, format (csv|json)
// Returns downloadable file
```

### Webhook Endpoints

```typescript
// POST /api/v1/webhooks/esp/:newsletterId
// Auth: Webhook secret in header (X-Webhook-Secret)
// Rate limit: webhook (1000/min)
// Handles ESP webhooks (Beehiiv, ConvertKit, Mailchimp)

// POST /api/v1/webhooks/stripe
// Auth: Stripe signature verification
// Handles Stripe webhook events

// POST /api/v1/webhooks/twitter
// POST /api/v1/webhooks/linkedin
// Platform conversion tracking callbacks
```

### Billing Endpoints

```typescript
// GET /api/v1/billing/subscription
interface SubscriptionResponse {
  tier: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  usage: {
    campaigns: { used: number; limit: number };
    aiGenerations: { used: number; limit: number };
    landingPages: { used: number; limit: number };
  };
}

// POST /api/v1/billing/create-checkout
interface CreateCheckoutRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}
interface CreateCheckoutResponse {
  checkoutUrl: string;
}

// POST /api/v1/billing/create-portal
interface CreatePortalResponse {
  portalUrl: string;
}

// GET /api/v1/billing/invoices
```

### Ad Platform Connection Endpoints

```typescript
// GET /api/v1/connections
// Returns all platform connections

// POST /api/v1/connections/twitter/connect
// Initiates Twitter Ads OAuth
interface ConnectResponse {
  authUrl: string;
}

// GET /api/v1/connections/twitter/callback
// DELETE /api/v1/connections/twitter

// POST /api/v1/connections/linkedin/connect
// GET /api/v1/connections/linkedin/callback
// DELETE /api/v1/connections/linkedin

// POST /api/v1/connections/:platform/sync
// Syncs campaign data from platform
```

---

## Page-by-Page UI Specifications

### 1. Landing Page (Marketing) - `/`

```
+------------------------------------------------------------------+
|  [Logo]                    Features  Pricing  Blog    [Login]    |
+------------------------------------------------------------------+
|                                                                   |
|         Grow Your Newsletter Without Meta Ads                    |
|                                                                   |
|    Acquire subscribers through Twitter, LinkedIn, SEO, and       |
|    cross-promotion—all managed from one dashboard.               |
|                                                                   |
|              [Start Free Trial]    [See Demo]                    |
|                                                                   |
+------------------------------------------------------------------+
|  TRUSTED BY 500+ NEWSLETTER CREATORS                             |
|  [Logo] [Logo] [Logo] [Logo] [Logo]                              |
+------------------------------------------------------------------+
|                                                                   |
|  [Icon]              [Icon]              [Icon]                  |
|  Twitter Ads         LinkedIn Ads        SEO Pages               |
|  Target followers    Reach              AI-optimized             |
|  of accounts in      professionals      landing pages            |
|  your niche          by job title       that rank                |
+------------------------------------------------------------------+
|  PRICING                                                         |
|  +------------+  +------------+  +------------+                  |
|  | FREE       |  | STARTER    |  | GROWTH     |                  |
|  | $0/mo      |  | $29/mo     |  | $79/mo     |                  |
|  | 1 campaign |  | 5 campaigns|  | Unlimited  |                  |
|  | Basic AI   |  | Full AI    |  | Priority   |                  |
|  | [Start]    |  | [Start]    |  | [Start]    |                  |
|  +------------+  +------------+  +------------+                  |
+------------------------------------------------------------------+
|  FOOTER: Links, Legal, Social                                    |
+------------------------------------------------------------------+
```

**Components:**
- `MarketingNav` - Navigation with auth buttons
- `HeroSection` - Main headline, subhead, CTAs
- `LogoCloud` - Customer logos
- `FeatureGrid` - 3-column feature cards
- `PricingTable` - Pricing tiers
- `Footer` - Standard footer

### 2. Auth Pages - `/login`, `/register`, `/forgot-password`

```
+------------------------------------------------------------------+
|                         [Logo]                                    |
|                                                                   |
|                  +------------------------+                       |
|                  |   Welcome back         |                       |
|                  |                        |                       |
|                  |   [Google Sign In]     |                       |
|                  |   [Twitter Sign In]    |                       |
|                  |                        |                       |
|                  |   ─── or ───           |                       |
|                  |                        |                       |
|                  |   Email                |                       |
|                  |   [________________]   |                       |
|                  |                        |                       |
|                  |   Password             |                       |
|                  |   [________________]   |                       |
|                  |                        |                       |
|                  |   [Forgot password?]   |                       |
|                  |                        |                       |
|                  |   [    Log In     ]    |                       |
|                  |                        |                       |
|                  |   Don't have account?  |                       |
|                  |   [Sign up]            |                       |
|                  +------------------------+                       |
+------------------------------------------------------------------+
```

**Components:**
- `AuthCard` - Centered card container
- `OAuthButtons` - Social login buttons
- `AuthForm` - Email/password form
- `AuthLink` - Toggle between login/register

### 3. Onboarding Flow - `/onboarding`

```
Step 1/4: Newsletter Details
+------------------------------------------------------------------+
|  [Progress: ████░░░░░░░░]                                        |
|                                                                   |
|  Tell us about your newsletter                                   |
|                                                                   |
|  Newsletter Name *                                               |
|  [________________________________]                              |
|                                                                   |
|  Description                                                     |
|  [________________________________]                              |
|  [________________________________]                              |
|                                                                   |
|  Niche/Category                                                  |
|  [Dropdown: Tech / Business / Finance / ...]                     |
|                                                                   |
|  Website URL                                                     |
|  [________________________________]                              |
|                                                                   |
|                              [Continue →]                        |
+------------------------------------------------------------------+

Step 2/4: Connect ESP
+------------------------------------------------------------------+
|  Connect your email platform                                     |
|                                                                   |
|  +----------------+  +----------------+  +----------------+      |
|  | [Beehiiv Logo] |  | [CK Logo]      |  | [MC Logo]      |      |
|  |   Beehiiv      |  |  ConvertKit    |  |  Mailchimp     |      |
|  |   [Connect]    |  |   [Connect]    |  |   [Connect]    |      |
|  +----------------+  +----------------+  +----------------+      |
|                                                                   |
|  [Skip for now]                        [Continue →]              |
+------------------------------------------------------------------+

Step 3/4: Connect Ad Platforms
+------------------------------------------------------------------+
|  Connect advertising platforms                                   |
|                                                                   |
|  +------------------------+  +------------------------+          |
|  | [Twitter Logo]         |  | [LinkedIn Logo]        |          |
|  | Twitter/X Ads          |  | LinkedIn Ads           |          |
|  | Run promoted tweets    |  | Target professionals   |          |
|  | [Connect Account]      |  | [Connect Account]      |          |
|  +------------------------+  +------------------------+          |
|                                                                   |
|  [Skip for now]                        [Continue →]              |
+------------------------------------------------------------------+

Step 4/4: First Campaign
+------------------------------------------------------------------+
|  Create your first campaign                                      |
|                                                                   |
|  [AI Generated Suggestions Based on Newsletter]                  |
|                                                                   |
|  Recommended: Twitter Campaign                                   |
|  Target followers of @competitor1, @competitor2                  |
|  Daily budget: $20                                               |
|                                                                   |
|  [Create This Campaign]    [Start from Scratch]                  |
|                                                                   |
|  [Skip to Dashboard]                                             |
+------------------------------------------------------------------+
```

**Components:**
- `OnboardingProgress` - Step indicator
- `NewsletterForm` - Step 1 form
- `ESPSelector` - ESP connection cards
- `PlatformConnector` - Ad platform OAuth cards
- `CampaignSuggestion` - AI-generated suggestion card

### 4. Dashboard - `/dashboard`

```
+------------------------------------------------------------------+
| [Logo]  Dashboard  Campaigns  Pages  Network  Settings   [Avatar]|
+------------------------------------------------------------------+
|                                                                   |
|  Welcome back, John                      [+ New Campaign]        |
|                                                                   |
|  +------------------+  +------------------+  +------------------+ |
|  | Total Subs       |  | This Month       |  | Avg CPA          | |
|  | 12,450           |  | +1,234 (12%)     |  | $1.45            | |
|  | ↑ 8% vs last mo  |  | ████████░░       |  | ↓ 15% vs last mo | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                   |
|  +------------------+  +------------------+  +------------------+ |
|  | Twitter          |  | LinkedIn         |  | SEO              | |
|  | 456 subs         |  | 234 subs         |  | 544 subs         | |
|  | $1.20 CPA        |  | $2.10 CPA        |  | Free             | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                   |
|  Subscriber Growth                                               |
|  [Line chart showing daily growth over 30 days]                  |
|  [Toggle: 7d | 30d | 90d | All]                                  |
|                                                                   |
|  Active Campaigns                          [View All →]          |
|  +--------------------------------------------------------------+|
|  | Campaign          | Platform | Status  | Subs  | CPA  | Spend||
|  | Summer Launch     | Twitter  | Active  | 234   | $1.12| $262 ||
|  | Tech Founders     | LinkedIn | Active  | 89    | $2.34| $208 ||
|  | SEO - Best Tools  | SEO      | Live    | 156   | -    | -    ||
|  +--------------------------------------------------------------+|
|                                                                   |
|  Top Landing Pages                         [View All →]          |
|  +--------------------------------------------------------------+|
|  | Page              | Views | Conversions | Rate   | Score     ||
|  | /best-ai-tools    | 2,340 | 234         | 10.0%  | 92        ||
|  | /startup-news     | 1,890 | 156         | 8.3%   | 87        ||
|  +--------------------------------------------------------------+|
+------------------------------------------------------------------+
```

**Components:**
- `AppNav` - Main navigation sidebar/header
- `MetricCard` - Individual stat cards
- `ChannelBreakdown` - Channel-specific stats
- `GrowthChart` - Recharts line chart
- `CampaignTable` - DataTable for campaigns
- `LandingPageTable` - DataTable for pages

### 5. Campaigns List - `/campaigns`

```
+------------------------------------------------------------------+
| Campaigns                                                        |
|                                                                   |
| [+ New Campaign]  [Filter: All Platforms ▼]  [Status: All ▼]     |
|                                                                   |
| +--------------------------------------------------------------+ |
| | ○ | Campaign            | Platform | Status  | Budget | Spent | |
| |---|---------------------|----------|---------|--------|-------| |
| | □ | Summer Launch       | Twitter  | Active  | $500   | $262  | |
| | □ | Tech Founders       | LinkedIn | Active  | $300   | $208  | |
| | □ | Q4 Push             | Twitter  | Draft   | $1000  | $0    | |
| | □ | SEO - AI Tools      | SEO      | Live    | -      | -     | |
| +--------------------------------------------------------------+ |
|                                                                   |
| [Bulk Actions: Pause | Delete]              Page 1 of 3 [< >]    |
+------------------------------------------------------------------+
```

### 6. Campaign Builder - `/campaigns/new` and `/campaigns/:id`

```
+------------------------------------------------------------------+
| ← Back to Campaigns              [Save Draft]  [Launch Campaign] |
+------------------------------------------------------------------+
|                                                                   |
| Campaign Details                                                  |
| +--------------------------------------------------------------+ |
| | Campaign Name *                                               | |
| | [Summer Newsletter Push_______________________]               | |
| |                                                               | |
| | Newsletter                                                    | |
| | [Dropdown: Select newsletter_____________________]            | |
| |                                                               | |
| | Platform *                                                    | |
| | ( ) Twitter/X    ( ) LinkedIn    ( ) SEO Landing Page        | |
| +--------------------------------------------------------------+ |
|                                                                   |
| [TWITTER SELECTED - Show Twitter-specific options]              |
|                                                                   |
| Targeting                                                        |
| +--------------------------------------------------------------+ |
| | Locations                                                     | |
| | [x] United States  [x] Canada  [x] United Kingdom  [+ Add]   | |
| |                                                               | |
| | Age Range                                                     | |
| | [25] to [54]                                                  | |
| |                                                               | |
| | Target followers of (Twitter handles)                        | |
| | [@paulgraham] [@naval] [@david_perell] [+ Add]               | |
| |                                                               | |
| | Interests                                                     | |
| | [Technology] [Startups] [Business] [+ Add]                   | |
| +--------------------------------------------------------------+ |
|                                                                   |
| Budget & Schedule                                                |
| +--------------------------------------------------------------+ |
| | Daily Budget                    Total Budget (optional)       | |
| | [$] [20.00]                     [$] [500.00]                  | |
| |                                                               | |
| | Start Date                      End Date                      | |
| | [📅 Select date]                [📅 Select date]              | |
| +--------------------------------------------------------------+ |
|                                                                   |
| Ad Creative                                    [🤖 AI Generate]  |
| +--------------------------------------------------------------+ |
| | Headline (280 chars)                                          | |
| | [Discover the insights 10,000+ founders read every morning]  | |
| |                                                               | |
| | Body Copy                                                     | |
| | [Join the newsletter that VCs and startup founders trust     | |
| |  for daily insights on building companies that matter.]      | |
| |                                                               | |
| | Call to Action                                                | |
| | [Subscribe Free ▼]                                            | |
| |                                                               | |
| | Image (optional)                                              | |
| | [Upload Image] or [Generate with AI]                         | |
| |                                                               | |
| | +--PREVIEW-----------------+                                  | |
| | | [Twitter Card Preview]   |                                  | |
| | +-------------------------+                                  | |
| +--------------------------------------------------------------+ |
|                                                                   |
| AI Variations                                                    |
| +--------------------------------------------------------------+ |
| | Generate 3 more headline variations?                          | |
| | [Generate Variations]                                         | |
| |                                                               | |
| | Variation A (Current) ◉                                       | |
| | "Discover the insights 10,000+ founders read..."             | |
| |                                                               | |
| | Variation B ○                                                 | |
| | "The newsletter VCs secretly forward to their..."            | |
| |                                                               | |
| | Variation C ○                                                 | |
| | "Why 10,000 founders start their day with this..."           | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

**Components:**
- `CampaignForm` - Main form container
- `PlatformSelector` - Radio group for platform
- `TargetingPanel` - Collapsible targeting options
- `TwitterTargeting` - Twitter-specific targeting
- `LinkedInTargeting` - LinkedIn-specific targeting
- `BudgetSchedule` - Budget and date inputs
- `AdCreativeEditor` - Copy and image inputs
- `AdPreview` - Platform-specific preview
- `AIVariations` - Generated variations selector

### 7. Landing Page Builder - `/pages/new` and `/pages/:id`

```
+------------------------------------------------------------------+
| ← Back to Pages        [Preview] [Save Draft] [Publish]          |
+------------------------------------------------------------------+
| +--EDITOR SIDEBAR--+ +--LIVE PREVIEW--------------------------------+
| |                  | |                                               |
| | Page Settings    | |  +---------------------------------------+   |
| | +--------------+ | |  |         [NEWSLETTER LOGO]             |   |
| | | Slug         | | |  |                                       |   |
| | | /best-ai-    | | |  |  The #1 Newsletter for AI Founders    |   |
| | | tools-2024   | | |  |                                       |   |
| | |              | | |  |  Join 12,000+ founders getting weekly |   |
| | | Target KW    | | |  |  insights on AI, startups, and tech.  |   |
| | | [best ai     | | |  |                                       |   |
| | |  tools]      | | |  |  [Email Address        ] [Subscribe]  |   |
| | +--------------+ | |  |                                       |   |
| |                  | |  +---------------------------------------+   |
| | Hero Section     | |                                               |
| | +--------------+ | |  Why Subscribe?                              |
| | | Headline     | | |  +-----------+ +-----------+ +-----------+   |
| | | [The #1...]  | | |  | Daily     | | Curated   | | Expert    |   |
| | |              | | |  | Insights  | | Resources | | Analysis  |   |
| | | Subheadline  | | |  +-----------+ +-----------+ +-----------+   |
| | | [Join...]    | | |                                               |
| | |              | | |  What Readers Say                            |
| | | CTA Text     | | |  "Best newsletter I subscribe to" - @user   |
| | | [Subscribe]  | | |                                               |
| | +--------------+ | |  Frequently Asked Questions                   |
| |                  | |  [Accordion FAQ items]                        |
| | Benefits        | |                                               |
| | [Edit Benefits] | |  [Footer]                                      |
| |                  | +----------------------------------------------+
| | Social Proof    |
| | [Edit Proof]    |
| |                  |
| | FAQ              |
| | [Edit FAQ]      |
| |                  |
| | SEO Score: 87   |
| | [🤖 Optimize]   |
| |                  |
| | Suggestions:    |
| | • Add keyword   |
| |   to H1         |
| | • Increase      |
| |   word count    |
| +------------------+
+------------------------------------------------------------------+
```

**Components:**
- `PageEditor` - Main editor container
- `EditorSidebar` - Settings and section editors
- `LivePreview` - Real-time preview iframe
- `SectionEditor` - Edit individual sections
- `SEOScoreCard` - SEO analysis display
- `AIOptimizer` - AI optimization suggestions

### 8. Cross-Promotion Network - `/network`

```
+------------------------------------------------------------------+
| Cross-Promotion Network                                          |
|                                                                   |
| [My Listing] [Browse Partners] [My Matches]                      |
+------------------------------------------------------------------+
| +--MY LISTING--------------------------------------------------+ |
| |                                                               | |
| | Your Newsletter: Tech Insider Weekly                         | |
| | Subscribers: 5,000-10,000                                    | |
| | Categories: Technology, Startups                             | |
| |                                                               | |
| | Tagline:                                                      | |
| | [Daily insights for tech founders and investors________]     | |
| |                                                               | |
| | Preferred Partner Niches:                                     | |
| | [x] Technology  [x] Business  [ ] Finance  [ ] Health        | |
| |                                                               | |
| | [✓ Listing Active]                     [Save Changes]        | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| +--BROWSE PARTNERS---------------------------------------------+ |
| | Filter: [All Niches ▼] [1k-5k ▼] [Sort: Relevance ▼]        | |
| |                                                               | |
| | +----------------------------------------------------------+ | |
| | | Startup Weekly                              [Request Swap]| | |
| | | 8,000 subscribers • Business, Startups                    | | |
| | | "Weekly deep-dives on startup strategy and growth"        | | |
| | | Match Score: 92%                                          | | |
| | +----------------------------------------------------------+ | |
| |                                                               | |
| | +----------------------------------------------------------+ | |
| | | AI Digest                                   [Request Swap]| | |
| | | 12,000 subscribers • Technology, AI                       | | |
| | | "Curated AI news and tutorials for developers"            | | |
| | | Match Score: 87%                                          | | |
| | +----------------------------------------------------------+ | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| +--MY MATCHES--------------------------------------------------+ |
| | Pending Requests (2)                                         | |
| | +----------------------------------------------------------+ | |
| | | From: Product Notes (6k subs)             [Accept][Decline]| |
| | | "Would love to cross-promote! Our audiences align well."  | | |
| | +----------------------------------------------------------+ | |
| |                                                               | |
| | Active Swaps (1)                                             | |
| | +----------------------------------------------------------+ | |
| | | With: Indie Hackers Daily                                 | | |
| | | Status: You sent ✓ | Waiting for partner                  | | |
| | | Your gain: 45 subscribers                                  | | |
| | | [Mark as Complete]                                         | | |
| | +----------------------------------------------------------+ | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

**Components:**
- `NetworkTabs` - Tab navigation
- `MyListing` - Edit own listing
- `PartnerBrowser` - Browse/search partners
- `PartnerCard` - Individual partner display
- `MatchRequests` - Incoming/outgoing requests
- `ActiveSwaps` - Manage active swaps

### 9. Settings - `/settings`

```
+------------------------------------------------------------------+
| Settings                                                         |
|                                                                   |
| [Profile] [Newsletters] [Billing] [Integrations] [API Keys]     |
+------------------------------------------------------------------+
| +--PROFILE-----------------------------------------------------+ |
| |                                                               | |
| | [Avatar]  [Change Photo]                                     | |
| |                                                               | |
| | Name                           Email                         | |
| | [John Smith_________]          john@example.com (verified)   | |
| |                                                               | |
| | Timezone                                                      | |
| | [America/New_York ▼]                                         | |
| |                                                               | |
| | Password                                                      | |
| | [Change Password]                                             | |
| |                                                               | |
| | [Save Changes]                                                | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| +--INTEGRATIONS------------------------------------------------+ |
| |                                                               | |
| | Email Service Providers                                      | |
| | +----------------------------------------------------------+ | |
| | | Beehiiv          Connected as "Tech Weekly"   [Disconnect]| | |
| | | ConvertKit       Not connected                  [Connect] | | |
| | | Mailchimp        Not connected                  [Connect] | | |
| | +----------------------------------------------------------+ | |
| |                                                               | |
| | Advertising Platforms                                        | |
| | +----------------------------------------------------------+ | |
| | | Twitter/X Ads    Connected as "@techweekly"  [Disconnect] | | |
| | | LinkedIn Ads     Not connected                  [Connect] | | |
| | +----------------------------------------------------------+ | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| +--BILLING-----------------------------------------------------+ |
| |                                                               | |
| | Current Plan: Growth ($79/mo)                                | |
| | Next billing: January 15, 2025                               | |
| |                                                               | |
| | Usage This Month:                                            | |
| | Campaigns: 8/unlimited                                        | |
| | AI Generations: 145/500                                       | |
| | Landing Pages: 12/25                                          | |
| |                                                               | |
| | [Change Plan]  [Manage Payment]  [View Invoices]             | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### 10. Public Landing Page - `/p/:slug`

```
+------------------------------------------------------------------+
|                     [Newsletter Logo]                            |
+------------------------------------------------------------------+
|                                                                   |
|              The #1 Newsletter for AI Founders                   |
|                                                                   |
|     Join 12,000+ founders getting weekly insights on             |
|     artificial intelligence, startups, and technology.           |
|                                                                   |
|     [your@email.com_______________] [Subscribe Free]             |
|                                                                   |
|     ✓ Free  ✓ Weekly  ✓ Unsubscribe anytime                     |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|  Why 12,000+ Founders Trust Us                                   |
|                                                                   |
|  +----------------+  +----------------+  +----------------+      |
|  | [Icon]         |  | [Icon]         |  | [Icon]         |      |
|  | Curated        |  | Actionable     |  | No Fluff       |      |
|  | Only the best  |  | Insights you   |  | 5-min read     |      |
|  | stories        |  | can apply      |  | every week     |      |
|  +----------------+  +----------------+  +----------------+      |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|  What Readers Are Saying                                         |
|                                                                   |
|  "The best newsletter I subscribe to. Period."                   |
|  — @founder123                                                   |
|                                                                   |
|  "I've discovered tools that 10x'd my productivity"              |
|  — Sarah, CEO at StartupCo                                       |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|  Frequently Asked Questions                                      |
|                                                                   |
|  [+] How often do you send emails?                               |
|  [+] Can I unsubscribe anytime?                                  |
|  [+] Is it really free?                                          |
|                                                                   |
+------------------------------------------------------------------+
|  Footer: Privacy Policy | Terms | Powered by CCS          |
+------------------------------------------------------------------+
```

---

## Third-Party Integrations

### Twitter/X Ads API

```typescript
// File: /src/lib/integrations/twitter-ads.ts

// OAuth 2.0 Configuration
const TWITTER_ADS_CONFIG = {
  authUrl: 'https://twitter.com/i/oauth2/authorize',
  tokenUrl: 'https://api.twitter.com/2/oauth2/token',
  scopes: [
    'tweet.read',
    'users.read',
    'ads.read',
    'ads.write',
    'offline.access'
  ],
  apiBase: 'https://ads-api.twitter.com/12', // API version 12
};

// Required Endpoints
const TWITTER_ENDPOINTS = {
  // Account
  getAccounts: 'GET /accounts',
  getAccount: 'GET /accounts/:account_id',

  // Campaigns
  createCampaign: 'POST /accounts/:account_id/campaigns',
  getCampaigns: 'GET /accounts/:account_id/campaigns',
  updateCampaign: 'PUT /accounts/:account_id/campaigns/:campaign_id',
  deleteCampaign: 'DELETE /accounts/:account_id/campaigns/:campaign_id',

  // Line Items (Ad Sets)
  createLineItem: 'POST /accounts/:account_id/line_items',
  getLineItems: 'GET /accounts/:account_id/line_items',

  // Promoted Tweets
  createPromotedTweet: 'POST /accounts/:account_id/promoted_tweets',

  // Targeting
  getTargetingCriteria: 'GET /accounts/:account_id/targeting_criteria',
  createTargetingCriteria: 'POST /accounts/:account_id/targeting_criteria',

  // Analytics
  getStats: 'GET /stats/accounts/:account_id',
  getAsyncStats: 'POST /stats/jobs/accounts/:account_id',

  // Audiences
  getTailoredAudiences: 'GET /accounts/:account_id/tailored_audiences',
};

// Campaign Creation Request
interface TwitterCampaignRequest {
  name: string;
  funding_instrument_id: string;
  daily_budget_amount_local_micro: number; // in micro units (1M = $1)
  start_time: string; // ISO 8601
  end_time?: string;
  entity_status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  standard_delivery: boolean;
}

// Line Item (Ad Set) Request
interface TwitterLineItemRequest {
  campaign_id: string;
  name: string;
  product_type: 'PROMOTED_TWEETS';
  placements: ['ALL_ON_TWITTER'];
  objective: 'WEBSITE_CLICKS' | 'ENGAGEMENTS' | 'FOLLOWERS';
  bid_amount_local_micro: number;
  entity_status: 'ACTIVE' | 'PAUSED';
}

// Targeting Criteria
interface TwitterTargetingRequest {
  line_item_id: string;
  targeting_type: 'LOCATION' | 'FOLLOWER_LOOK_ALIKES' | 'INTEREST' | 'AGE';
  targeting_value: string;
}
```

### LinkedIn Ads API

```typescript
// File: /src/lib/integrations/linkedin-ads.ts

const LINKEDIN_ADS_CONFIG = {
  authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  scopes: [
    'r_emailaddress',
    'r_liteprofile',
    'r_ads',
    'rw_ads',
    'r_ads_reporting'
  ],
  apiBase: 'https://api.linkedin.com/v2',
};

const LINKEDIN_ENDPOINTS = {
  // Accounts
  getAdAccounts: 'GET /adAccountsV2',
  getAdAccount: 'GET /adAccountsV2/:id',

  // Campaigns
  createCampaign: 'POST /adCampaignsV2',
  getCampaigns: 'GET /adCampaignsV2',
  updateCampaign: 'POST /adCampaignsV2/:id', // PATCH via POST

  // Campaign Groups
  createCampaignGroup: 'POST /adCampaignGroupsV2',

  // Creatives
  createCreative: 'POST /adCreativesV2',
  getCreatives: 'GET /adCreativesV2',

  // Targeting
  getTargetingFacets: 'GET /adTargetingFacets',

  // Analytics
  getAnalytics: 'GET /adAnalyticsV2',
};

// Campaign Request
interface LinkedInCampaignRequest {
  account: string; // URN format: urn:li:sponsoredAccount:123
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  type: 'TEXT_AD' | 'SPONSORED_UPDATES';
  costType: 'CPM' | 'CPC';
  dailyBudget: { currencyCode: 'USD'; amount: string };
  totalBudget?: { currencyCode: 'USD'; amount: string };
  runSchedule: { start: number; end?: number }; // Unix timestamps
  targeting: LinkedInTargeting;
  objectiveType: 'WEBSITE_VISIT' | 'LEAD_GENERATION';
}

interface LinkedInTargeting {
  includedTargetingFacets: {
    locations?: string[]; // URN format
    industries?: string[];
    jobTitles?: string[];
    skills?: string[];
    seniorities?: string[];
    companySizes?: string[];
  };
  excludedTargetingFacets?: {
    // Same structure
  };
}
```

### ESP Integrations

```typescript
// File: /src/lib/integrations/esp/beehiiv.ts

const BEEHIIV_CONFIG = {
  apiBase: 'https://api.beehiiv.com/v2',
  webhookEvents: [
    'subscription.created',
    'subscription.deleted',
    'subscription.unsubscribed'
  ],
};

// Webhook Payload from Beehiiv
interface BeehiivWebhook {
  type: 'subscription.created' | 'subscription.deleted';
  data: {
    id: string;
    email: string;
    status: 'active' | 'inactive';
    created_at: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    referring_site?: string;
    custom_fields?: Record<string, string>;
  };
}

// API Endpoints
const BEEHIIV_ENDPOINTS = {
  getSubscribers: 'GET /publications/:pub_id/subscriptions',
  createSubscriber: 'POST /publications/:pub_id/subscriptions',
  getSubscriber: 'GET /publications/:pub_id/subscriptions/:sub_id',
  updateSubscriber: 'PATCH /publications/:pub_id/subscriptions/:sub_id',
};


// File: /src/lib/integrations/esp/convertkit.ts

const CONVERTKIT_CONFIG = {
  apiBase: 'https://api.convertkit.com/v3',
  webhookEvents: [
    'subscriber.subscriber_activate',
    'subscriber.subscriber_unsubscribe'
  ],
};

interface ConvertKitWebhook {
  subscriber: {
    id: number;
    email_address: string;
    state: 'active' | 'inactive';
    created_at: string;
    fields: Record<string, string>;
  };
}

const CONVERTKIT_ENDPOINTS = {
  getSubscribers: 'GET /subscribers',
  createSubscriber: 'POST /forms/:form_id/subscribe',
  getSubscriber: 'GET /subscribers/:id',
  listForms: 'GET /forms',
};


// File: /src/lib/integrations/esp/mailchimp.ts

const MAILCHIMP_CONFIG = {
  // DC is extracted from API key (e.g., us21)
  apiBase: 'https://{dc}.api.mailchimp.com/3.0',
  webhookEvents: [
    'subscribe',
    'unsubscribe',
    'cleaned'
  ],
};

interface MailchimpWebhook {
  type: 'subscribe' | 'unsubscribe' | 'cleaned';
  data: {
    id: string;
    email: string;
    email_type: string;
    list_id: string;
    merges: Record<string, string>;
  };
}

const MAILCHIMP_ENDPOINTS = {
  getLists: 'GET /lists',
  getMembers: 'GET /lists/:list_id/members',
  addMember: 'POST /lists/:list_id/members',
  updateMember: 'PATCH /lists/:list_id/members/:subscriber_hash',
};
```

### Stripe Configuration

```typescript
// File: /src/lib/integrations/stripe.ts

// Products and Prices to create in Stripe Dashboard
const STRIPE_PRODUCTS = {
  starter: {
    name: 'CCS Starter',
    description: '5 campaigns, full AI access, basic analytics',
    prices: {
      monthly: { amount: 2900, interval: 'month' }, // $29
      yearly: { amount: 29000, interval: 'year' }, // $290 (2 months free)
    },
    metadata: {
      tier: 'starter',
      campaigns_limit: '5',
      ai_generations_limit: '100',
      landing_pages_limit: '5',
    },
  },
  growth: {
    name: 'CCS Growth',
    description: 'Unlimited campaigns, priority AI, advanced analytics',
    prices: {
      monthly: { amount: 7900, interval: 'month' }, // $79
      yearly: { amount: 79000, interval: 'year' }, // $790
    },
    metadata: {
      tier: 'growth',
      campaigns_limit: 'unlimited',
      ai_generations_limit: '500',
      landing_pages_limit: '25',
    },
  },
  scale: {
    name: 'CCS Scale',
    description: 'Everything in Growth plus team seats, API access',
    prices: {
      monthly: { amount: 19900, interval: 'month' }, // $199
      yearly: { amount: 199000, interval: 'year' }, // $1990
    },
    metadata: {
      tier: 'scale',
      campaigns_limit: 'unlimited',
      ai_generations_limit: 'unlimited',
      landing_pages_limit: 'unlimited',
      team_seats: '5',
    },
  },
};

// Webhook Events to Handle
const STRIPE_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
];
```

---

## AI Prompts

### Ad Copy Generation (ChatGPT)

```typescript
// File: /src/lib/ai/prompts/ad-copy.ts

export const AD_COPY_SYSTEM_PROMPT = `You are an expert direct response copywriter specializing in newsletter subscriber acquisition ads. You write for Twitter and LinkedIn advertising platforms.

Your copy follows these principles:
1. Hook attention in the first 5 words
2. Focus on specific, tangible benefits
3. Use social proof when available (subscriber counts, notable readers)
4. Create curiosity gaps that compel clicks
5. Match the platform's native voice (casual for Twitter, professional for LinkedIn)
6. Include a clear, low-friction CTA

You NEVER:
- Use clickbait that doesn't deliver
- Make false claims
- Use excessive punctuation or ALL CAPS
- Write generic, forgettable copy`;

export const AD_COPY_USER_PROMPT = (input: AdCopyInput) => `
Generate ${input.count || 3} ad copy variations for a newsletter subscriber campaign.

NEWSLETTER DETAILS:
- Name: ${input.newsletterName}
- Description: ${input.description}
- Current subscribers: ${input.subscriberCount || 'Not specified'}
- Niche: ${input.niche}

TARGET AUDIENCE:
${input.targetAudience}

PLATFORM: ${input.platform}
TONE: ${input.tone || 'professional yet approachable'}

${input.existingHeadlines ? `EXISTING HEADLINES TO DIFFERENTIATE FROM:\n${input.existingHeadlines.join('\n')}` : ''}

For each variation, provide:
1. Headline (max ${input.platform === 'twitter' ? '280' : '200'} characters)
2. Body copy (max ${input.platform === 'twitter' ? '280' : '600'} characters)
3. CTA text (max 25 characters)
4. Brief reasoning for why this approach works

Output as JSON array:
[
  {
    "headline": "...",
    "bodyCopy": "...",
    "ctaText": "...",
    "reasoning": "..."
  }
]`;

// Example usage
const generateAdCopy = async (input: AdCopyInput) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: AD_COPY_SYSTEM_PROMPT },
      { role: 'user', content: AD_COPY_USER_PROMPT(input) },
    ],
    temperature: 0.8,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};
```

### SEO Optimization (Claude)

```typescript
// File: /src/lib/ai/prompts/seo-optimization.ts

export const SEO_SYSTEM_PROMPT = `You are an SEO expert specializing in high-converting landing pages for newsletter subscriptions. You understand search intent, keyword optimization, and conversion rate optimization.

Your recommendations are:
1. Specific and actionable
2. Backed by SEO best practices
3. Focused on both ranking AND converting
4. Realistic for implementation

You analyze content for:
- Keyword placement and density
- Header structure (H1, H2, H3)
- Meta title and description optimization
- Content comprehensiveness
- User intent alignment
- Internal linking opportunities
- Page load considerations`;

export const SEO_ANALYSIS_PROMPT = (input: SEOInput) => `
Analyze and optimize this landing page content for the target keyword.

TARGET KEYWORD: "${input.targetKeyword}"
SECONDARY KEYWORDS: ${input.secondaryKeywords?.join(', ') || 'None specified'}
NEWSLETTER NICHE: ${input.niche}
PAGE TYPE: ${input.pageType}

CURRENT CONTENT:
${input.currentContent || 'No existing content - generate recommendations for new page'}

Provide a comprehensive SEO analysis including:

1. OPTIMIZED META:
   - Title tag (50-60 chars, include keyword)
   - Meta description (150-160 chars, compelling with keyword)

2. HEADING STRUCTURE:
   - Recommended H1 (include primary keyword)
   - 3-5 H2 subheadings
   - Key H3s if applicable

3. CONTENT RECOMMENDATIONS:
   - Target word count
   - Key sections to include
   - Keyword placement strategy
   - Related topics to cover for topical authority

4. SEO SCORE: 0-100 with breakdown:
   - Keyword optimization (0-25)
   - Content depth (0-25)
   - Structure (0-25)
   - User intent match (0-25)

5. TOP 3 PRIORITY IMPROVEMENTS:
   - Specific, actionable items

Output as JSON:
{
  "optimizedTitle": "...",
  "metaDescription": "...",
  "headings": {
    "h1": "...",
    "h2s": ["...", "..."],
    "h3s": ["...", "..."]
  },
  "contentRecommendations": {
    "targetWordCount": 1500,
    "sections": ["...", "..."],
    "keywordPlacements": ["...", "..."],
    "relatedTopics": ["...", "..."]
  },
  "seoScore": {
    "total": 85,
    "breakdown": {
      "keywordOptimization": 22,
      "contentDepth": 20,
      "structure": 23,
      "userIntentMatch": 20
    }
  },
  "priorityImprovements": ["...", "...", "..."]
}`;

// Example usage
const optimizeSEO = async (input: SEOInput) => {
  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 4000,
    system: SEO_SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: SEO_ANALYSIS_PROMPT(input) },
    ],
  });

  return JSON.parse(response.content[0].text);
};
```

### Landing Page Generation (Claude)

```typescript
// File: /src/lib/ai/prompts/landing-page.ts

export const LANDING_PAGE_SYSTEM_PROMPT = `You are a conversion-focused landing page copywriter and UX strategist. You create landing pages that rank well in search AND convert visitors into newsletter subscribers.

Your pages follow proven frameworks:
1. AIDA (Attention, Interest, Desire, Action)
2. PAS (Problem, Agitate, Solution)
3. Clear value proposition above the fold
4. Social proof strategically placed
5. FAQ to overcome objections
6. Single, focused CTA

You write copy that:
- Speaks directly to the target reader
- Emphasizes benefits over features
- Uses specific numbers when possible
- Creates urgency without being pushy
- Sounds human, not corporate`;

export const LANDING_PAGE_GENERATION_PROMPT = (input: LandingPageInput) => `
Generate a complete, high-converting landing page for this newsletter.

NEWSLETTER:
- Name: ${input.newsletterName}
- Description: ${input.description}
- Target audience: ${input.targetAudience}
- Subscriber count: ${input.subscriberCount || 'Not specified'}

TARGET KEYWORD: "${input.targetKeyword}"
UNIQUE VALUE PROPS: ${input.benefits?.join(', ') || 'Not specified'}

${input.socialProof ? `SOCIAL PROOF AVAILABLE:
- Subscriber count: ${input.socialProof.subscriberCount}
- Testimonials: ${input.socialProof.testimonials?.join(' | ')}` : ''}

Generate a complete landing page structure:

{
  "seoMeta": {
    "title": "...",
    "description": "..."
  },
  "content": {
    "hero": {
      "headline": "...",
      "subheadline": "...",
      "ctaText": "...",
      "trustBadges": ["Free", "Weekly", "..."]
    },
    "benefits": [
      {
        "icon": "suggested-icon-name",
        "title": "...",
        "description": "..."
      }
    ],
    "socialProof": {
      "headline": "...",
      "testimonials": [
        {
          "quote": "...",
          "author": "...",
          "role": "..."
        }
      ],
      "stats": [
        { "number": "12,000+", "label": "Subscribers" }
      ]
    },
    "aboutSection": {
      "headline": "...",
      "body": "..."
    },
    "faq": [
      {
        "question": "...",
        "answer": "..."
      }
    ],
    "finalCta": {
      "headline": "...",
      "ctaText": "..."
    }
  }
}`;
```

### Competitor Analysis (Claude)

```typescript
// File: /src/lib/ai/prompts/competitor-analysis.ts

export const COMPETITOR_ANALYSIS_PROMPT = (content: string) => `
Analyze this newsletter landing page and extract strategic insights.

PAGE CONTENT:
${content}

Provide analysis in this JSON structure:
{
  "valueProposition": "Their main promise to subscribers",
  "targetAudience": "Who they're targeting",
  "uniqueAngles": ["What makes them different"],
  "ctaStrategies": ["How they drive conversions"],
  "contentThemes": ["Topics they cover"],
  "socialProofUsed": ["Types of proof they show"],
  "weaknesses": ["Gaps or areas they don't address well"],
  "suggestedDifferentiators": [
    "How you could position against them"
  ],
  "estimatedSubscribers": "Best guess based on claims",
  "overallStrength": "1-10 rating with reasoning"
}`;
```

---

## Environment Variables

```bash
# File: /.env.example

# ===================
# APP CONFIGURATION
# ===================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CCS
NODE_ENV=development

# ===================
# DATABASE (Neon)
# ===================
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/CCS?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/CCS?sslmode=require

# ===================
# AUTHENTICATION
# ===================
# Generate with: openssl rand -base64 32
AUTH_SECRET=your-auth-secret-min-32-chars
AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ===================
# AI PROVIDERS
# ===================
# OpenAI (ChatGPT) - for ad copy generation
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# Anthropic (Claude) - for SEO and content
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# ===================
# ADVERTISING PLATFORMS
# ===================
# Twitter/X Ads
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
TWITTER_ADS_BEARER_TOKEN=your-twitter-bearer-token

# LinkedIn Ads
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# ===================
# EMAIL SERVICE PROVIDERS
# ===================
# Beehiiv
BEEHIIV_API_KEY=your-beehiiv-api-key

# ConvertKit
CONVERTKIT_API_KEY=your-convertkit-api-key
CONVERTKIT_API_SECRET=your-convertkit-api-secret

# Mailchimp
MAILCHIMP_API_KEY=your-mailchimp-api-key

# ===================
# PAYMENTS (Stripe)
# ===================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create in Stripe Dashboard)
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_YEARLY=price_...
STRIPE_PRICE_GROWTH_MONTHLY=price_...
STRIPE_PRICE_GROWTH_YEARLY=price_...
STRIPE_PRICE_SCALE_MONTHLY=price_...
STRIPE_PRICE_SCALE_YEARLY=price_...

# ===================
# ENCRYPTION
# ===================
# For encrypting API keys stored in DB
# Generate with: openssl rand -base64 32
ENCRYPTION_KEY=your-32-byte-encryption-key

# ===================
# EXTERNAL SERVICES
# ===================
# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Resend (transactional emails)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@CCS.app

# ===================
# ANALYTICS (Optional)
# ===================
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# ===================
# DEVELOPMENT
# ===================
# Set to true to enable detailed logging
DEBUG=false
```

---

## File/Folder Structure

```
CCS/
├── .env.example
├── .env.local                    # Local environment (gitignored)
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── drizzle.config.ts             # Drizzle ORM config
├── components.json               # shadcn/ui config
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│       └── og-image.png
│
├── database/
│   ├── schema.sql                # Full SQL schema
│   └── migrations/               # Drizzle migrations
│       └── 0001_initial.sql
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Marketing landing page
│   │   ├── globals.css
│   │   │
│   │   ├── (marketing)/          # Marketing pages group
│   │   │   ├── layout.tsx
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   ├── features/
│   │   │   │   └── page.tsx
│   │   │   └── blog/
│   │   │       ├── page.tsx
│   │   │       └── [slug]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── (auth)/               # Auth pages group
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── reset-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/          # Dashboard pages (protected)
│   │   │   ├── layout.tsx        # Dashboard shell with nav
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx      # Main dashboard
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx      # Campaign list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx  # Create campaign
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx  # Edit campaign
│   │   │   │       └── analytics/
│   │   │   │           └── page.tsx
│   │   │   ├── pages/
│   │   │   │   ├── page.tsx      # Landing pages list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx  # Create landing page
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Edit landing page
│   │   │   ├── network/
│   │   │   │   └── page.tsx      # Cross-promo network
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx      # Full analytics
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx      # Settings overview
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── newsletters/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── integrations/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── billing/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── api-keys/
│   │   │   │       └── page.tsx
│   │   │   └── onboarding/
│   │   │       └── page.tsx      # Onboarding flow
│   │   │
│   │   ├── p/                    # Public landing pages
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                  # API Routes
│   │       ├── auth/
│   │       │   ├── [...nextauth]/
│   │       │   │   └── route.ts
│   │       │   ├── register/
│   │       │   │   └── route.ts
│   │       │   └── forgot-password/
│   │       │       └── route.ts
│   │       │
│   │       └── v1/               # Versioned API
│   │           ├── newsletters/
│   │           │   ├── route.ts
│   │           │   └── [id]/
│   │           │       ├── route.ts
│   │           │       ├── sync-subscribers/
│   │           │       │   └── route.ts
│   │           │       └── subscribers/
│   │           │           └── route.ts
│   │           ├── campaigns/
│   │           │   ├── route.ts
│   │           │   └── [id]/
│   │           │       ├── route.ts
│   │           │       ├── launch/
│   │           │       │   └── route.ts
│   │           │       ├── pause/
│   │           │       │   └── route.ts
│   │           │       └── analytics/
│   │           │           └── route.ts
│   │           ├── ads/
│   │           │   └── [id]/
│   │           │       └── route.ts
│   │           ├── landing-pages/
│   │           │   ├── route.ts
│   │           │   └── [id]/
│   │           │       ├── route.ts
│   │           │       └── publish/
│   │           │           └── route.ts
│   │           ├── ai/
│   │           │   ├── generate-ad-copy/
│   │           │   │   └── route.ts
│   │           │   ├── optimize-seo/
│   │           │   │   └── route.ts
│   │           │   ├── generate-landing-page/
│   │           │   │   └── route.ts
│   │           │   └── analyze-competitor/
│   │           │       └── route.ts
│   │           ├── cross-promo/
│   │           │   ├── listings/
│   │           │   │   ├── route.ts
│   │           │   │   └── [id]/
│   │           │   │       └── route.ts
│   │           │   └── matches/
│   │           │       ├── route.ts
│   │           │       └── [id]/
│   │           │           └── route.ts
│   │           ├── analytics/
│   │           │   ├── dashboard/
│   │           │   │   └── route.ts
│   │           │   └── export/
│   │           │       └── route.ts
│   │           ├── billing/
│   │           │   ├── subscription/
│   │           │   │   └── route.ts
│   │           │   ├── create-checkout/
│   │           │   │   └── route.ts
│   │           │   └── create-portal/
│   │           │       └── route.ts
│   │           ├── connections/
│   │           │   ├── route.ts
│   │           │   ├── twitter/
│   │           │   │   ├── connect/
│   │           │   │   │   └── route.ts
│   │           │   │   └── callback/
│   │           │   │       └── route.ts
│   │           │   └── linkedin/
│   │           │       ├── connect/
│   │           │       │   └── route.ts
│   │           │       └── callback/
│   │           │           └── route.ts
│   │           └── webhooks/
│   │               ├── stripe/
│   │               │   └── route.ts
│   │               └── esp/
│   │                   └── [newsletterId]/
│   │                       └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── table.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ... (other shadcn components)
│   │   │
│   │   ├── layout/
│   │   │   ├── marketing-nav.tsx
│   │   │   ├── marketing-footer.tsx
│   │   │   ├── dashboard-nav.tsx
│   │   │   ├── dashboard-sidebar.tsx
│   │   │   └── mobile-nav.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── auth-card.tsx
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── oauth-buttons.tsx
│   │   │   └── forgot-password-form.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── metric-card.tsx
│   │   │   ├── channel-breakdown.tsx
│   │   │   ├── growth-chart.tsx
│   │   │   ├── campaign-table.tsx
│   │   │   ├── landing-page-table.tsx
│   │   │   └── recent-activity.tsx
│   │   │
│   │   ├── campaigns/
│   │   │   ├── campaign-form.tsx
│   │   │   ├── platform-selector.tsx
│   │   │   ├── twitter-targeting.tsx
│   │   │   ├── linkedin-targeting.tsx
│   │   │   ├── budget-schedule.tsx
│   │   │   ├── ad-creative-editor.tsx
│   │   │   ├── ad-preview.tsx
│   │   │   ├── ai-variations.tsx
│   │   │   └── campaign-analytics.tsx
│   │   │
│   │   ├── landing-pages/
│   │   │   ├── page-editor.tsx
│   │   │   ├── editor-sidebar.tsx
│   │   │   ├── live-preview.tsx
│   │   │   ├── section-editor.tsx
│   │   │   ├── seo-score-card.tsx
│   │   │   └── ai-optimizer.tsx
│   │   │
│   │   ├── network/
│   │   │   ├── my-listing.tsx
│   │   │   ├── partner-browser.tsx
│   │   │   ├── partner-card.tsx
│   │   │   ├── match-requests.tsx
│   │   │   └── active-swaps.tsx
│   │   │
│   │   ├── settings/
│   │   │   ├── profile-form.tsx
│   │   │   ├── newsletter-settings.tsx
│   │   │   ├── esp-connector.tsx
│   │   │   ├── platform-connector.tsx
│   │   │   ├── billing-overview.tsx
│   │   │   └── api-key-manager.tsx
│   │   │
│   │   ├── onboarding/
│   │   │   ├── onboarding-progress.tsx
│   │   │   ├── newsletter-step.tsx
│   │   │   ├── esp-step.tsx
│   │   │   ├── platforms-step.tsx
│   │   │   └── first-campaign-step.tsx
│   │   │
│   │   ├── public-page/          # Public landing page components
│   │   │   ├── page-hero.tsx
│   │   │   ├── benefits-grid.tsx
│   │   │   ├── testimonials.tsx
│   │   │   ├── faq-accordion.tsx
│   │   │   └── subscribe-form.tsx
│   │   │
│   │   └── shared/
│   │       ├── loading-spinner.tsx
│   │       ├── empty-state.tsx
│   │       ├── error-boundary.tsx
│   │       ├── confirm-dialog.tsx
│   │       └── data-table.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts          # Drizzle client
│   │   │   ├── schema.ts         # Drizzle schema
│   │   │   └── queries/
│   │   │       ├── users.ts
│   │   │       ├── newsletters.ts
│   │   │       ├── campaigns.ts
│   │   │       ├── landing-pages.ts
│   │   │       ├── subscribers.ts
│   │   │       └── analytics.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── config.ts         # NextAuth config
│   │   │   ├── session.ts        # Session helpers
│   │   │   └── middleware.ts     # Auth middleware
│   │   │
│   │   ├── ai/
│   │   │   ├── openai.ts         # OpenAI client
│   │   │   ├── anthropic.ts      # Anthropic client
│   │   │   └── prompts/
│   │   │       ├── ad-copy.ts
│   │   │       ├── seo-optimization.ts
│   │   │       ├── landing-page.ts
│   │   │       └── competitor-analysis.ts
│   │   │
│   │   ├── integrations/
│   │   │   ├── twitter-ads.ts
│   │   │   ├── linkedin-ads.ts
│   │   │   ├── stripe.ts
│   │   │   └── esp/
│   │   │       ├── index.ts      # ESP factory
│   │   │       ├── beehiiv.ts
│   │   │       ├── convertkit.ts
│   │   │       └── mailchimp.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts             # Tailwind merge
│   │   │   ├── format.ts         # Formatting helpers
│   │   │   ├── encryption.ts     # Encrypt/decrypt
│   │   │   └── rate-limit.ts     # Rate limiting
│   │   │
│   │   ├── validations/
│   │   │   ├── auth.ts           # Zod schemas
│   │   │   ├── newsletter.ts
│   │   │   ├── campaign.ts
│   │   │   └── landing-page.ts
│   │   │
│   │   └── constants.ts          # App constants
│   │
│   ├── hooks/
│   │   ├── use-user.ts
│   │   ├── use-newsletter.ts
│   │   ├── use-campaigns.ts
│   │   ├── use-landing-pages.ts
│   │   ├── use-analytics.ts
│   │   └── use-debounce.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── api.ts
│   │   ├── database.ts
│   │   └── integrations.ts
│   │
│   └── middleware.ts             # Next.js middleware
│
├── scripts/
│   ├── seed.ts                   # Database seeding
│   └── migrate.ts                # Run migrations
│
└── tests/
    ├── setup.ts
    ├── unit/
    │   ├── lib/
    │   │   └── ai/
    │   │       └── prompts.test.ts
    │   └── utils/
    │       └── format.test.ts
    ├── integration/
    │   ├── api/
    │   │   ├── auth.test.ts
    │   │   ├── campaigns.test.ts
    │   │   └── landing-pages.test.ts
    │   └── db/
    │       └── queries.test.ts
    └── e2e/
        ├── auth.spec.ts
        ├── campaign-flow.spec.ts
        └── landing-page-flow.spec.ts
```

---

## Step-by-Step Build Order

### Phase 1: Foundation (Days 1-3)

```
1. Project Setup
   Dependencies: None
   Tasks:
   - [ ] Create Next.js 14 app with App Router
   - [ ] Install dependencies (see package.json below)
   - [ ] Configure Tailwind CSS
   - [ ] Set up shadcn/ui
   - [ ] Configure ESLint, Prettier
   - [ ] Create .env.example and .env.local

2. Database Setup
   Dependencies: Project setup
   Tasks:
   - [ ] Create Neon database
   - [ ] Run schema.sql
   - [ ] Configure Drizzle ORM
   - [ ] Create db/index.ts client
   - [ ] Create db/schema.ts types
   - [ ] Test database connection

3. Authentication
   Dependencies: Database
   Tasks:
   - [ ] Set up NextAuth.js
   - [ ] Configure Google OAuth provider
   - [ ] Create auth API routes
   - [ ] Create login/register pages
   - [ ] Create auth middleware
   - [ ] Test auth flow end-to-end
```

### Phase 2: Core Features (Days 4-8)

```
4. User Dashboard Shell
   Dependencies: Authentication
   Tasks:
   - [ ] Create dashboard layout
   - [ ] Build navigation components
   - [ ] Create settings pages structure
   - [ ] Implement profile settings
   - [ ] Add user context/hooks

5. Newsletter Management
   Dependencies: Dashboard shell
   Tasks:
   - [ ] Create newsletter CRUD API
   - [ ] Build newsletter settings UI
   - [ ] Implement ESP connection flow (Beehiiv first)
   - [ ] Create webhook endpoints
   - [ ] Test ESP webhook integration

6. Subscriber Sync
   Dependencies: Newsletter management
   Tasks:
   - [ ] Build ESP API clients
   - [ ] Create sync-subscribers endpoint
   - [ ] Implement subscriber table/display
   - [ ] Add attribution tracking
   - [ ] Create subscriber analytics queries
```

### Phase 3: Ad Campaigns (Days 9-14)

```
7. Campaign CRUD
   Dependencies: Newsletter management
   Tasks:
   - [ ] Create campaign database queries
   - [ ] Build campaign list page
   - [ ] Create campaign form components
   - [ ] Implement platform selector
   - [ ] Add budget/schedule inputs

8. Twitter Ads Integration
   Dependencies: Campaign CRUD
   Tasks:
   - [ ] Set up Twitter OAuth
   - [ ] Create Twitter ads API client
   - [ ] Build Twitter targeting UI
   - [ ] Implement campaign launch flow
   - [ ] Add conversion tracking

9. LinkedIn Ads Integration
   Dependencies: Campaign CRUD
   Tasks:
   - [ ] Set up LinkedIn OAuth
   - [ ] Create LinkedIn ads API client
   - [ ] Build LinkedIn targeting UI
   - [ ] Implement campaign launch flow
   - [ ] Add conversion tracking

10. AI Ad Copy Generation
    Dependencies: Campaign form
    Tasks:
    - [ ] Set up OpenAI client
    - [ ] Create ad copy prompts
    - [ ] Build AI generation API endpoint
    - [ ] Create UI for generating variations
    - [ ] Implement A/B variation selector
```

### Phase 4: Landing Pages (Days 15-19)

```
11. Landing Page Builder
    Dependencies: Newsletter management
    Tasks:
    - [ ] Create landing page CRUD API
    - [ ] Build page editor component
    - [ ] Create section editors
    - [ ] Implement live preview
    - [ ] Add publish/unpublish flow

12. SEO Optimization
    Dependencies: Landing page builder
    Tasks:
    - [ ] Set up Anthropic client
    - [ ] Create SEO prompts
    - [ ] Build SEO score card
    - [ ] Implement AI optimization suggestions
    - [ ] Add meta tag management

13. Public Landing Pages
    Dependencies: Landing page builder
    Tasks:
    - [ ] Create /p/[slug] route
    - [ ] Build public page components
    - [ ] Implement subscribe form
    - [ ] Add view tracking
    - [ ] Create conversion tracking
```

### Phase 5: Cross-Promotion & Analytics (Days 20-24)

```
14. Cross-Promotion Network
    Dependencies: Newsletter management
    Tasks:
    - [ ] Create cross-promo database queries
    - [ ] Build listing management UI
    - [ ] Create partner browser
    - [ ] Implement match request flow
    - [ ] Add swap tracking

15. Analytics Dashboard
    Dependencies: All data sources
    Tasks:
    - [ ] Create analytics aggregation queries
    - [ ] Build dashboard overview page
    - [ ] Implement charts (Recharts)
    - [ ] Add date range filtering
    - [ ] Create export functionality
```

### Phase 6: Billing & Polish (Days 25-28)

```
16. Stripe Integration
    Dependencies: User management
    Tasks:
    - [ ] Set up Stripe products/prices
    - [ ] Create checkout flow
    - [ ] Implement customer portal
    - [ ] Handle webhooks
    - [ ] Add usage limits enforcement

17. Onboarding Flow
    Dependencies: All core features
    Tasks:
    - [ ] Build onboarding wizard
    - [ ] Create step components
    - [ ] Implement progress tracking
    - [ ] Add first campaign suggestion

18. Testing & Bug Fixes
    Dependencies: All features
    Tasks:
    - [ ] Write unit tests
    - [ ] Write integration tests
    - [ ] Write E2E tests
    - [ ] Fix bugs
    - [ ] Performance optimization
```

### Phase 7: Launch (Days 29-30)

```
19. Deployment
    Dependencies: Testing complete
    Tasks:
    - [ ] Configure Vercel project
    - [ ] Set up production env vars
    - [ ] Configure custom domain
    - [ ] Set up monitoring (Sentry)
    - [ ] Deploy to production

20. Launch Checklist
    Dependencies: Deployment
    Tasks:
    - [ ] Final QA pass
    - [ ] Create marketing assets
    - [ ] Write documentation
    - [ ] Announce launch
```

---

## Testing Requirements

### Unit Tests

```typescript
// File: /tests/unit/lib/ai/prompts.test.ts

import { describe, it, expect } from 'vitest';
import { AD_COPY_USER_PROMPT } from '@/lib/ai/prompts/ad-copy';

describe('Ad Copy Prompts', () => {
  it('should include newsletter name in prompt', () => {
    const prompt = AD_COPY_USER_PROMPT({
      newsletterName: 'Tech Weekly',
      description: 'A tech newsletter',
      niche: 'technology',
      targetAudience: 'developers',
      platform: 'twitter',
    });

    expect(prompt).toContain('Tech Weekly');
  });

  it('should set correct character limit for Twitter', () => {
    const prompt = AD_COPY_USER_PROMPT({
      newsletterName: 'Test',
      description: 'Test',
      niche: 'test',
      targetAudience: 'test',
      platform: 'twitter',
    });

    expect(prompt).toContain('280');
  });

  it('should set correct character limit for LinkedIn', () => {
    const prompt = AD_COPY_USER_PROMPT({
      newsletterName: 'Test',
      description: 'Test',
      niche: 'test',
      targetAudience: 'test',
      platform: 'linkedin',
    });

    expect(prompt).toContain('600');
  });
});
```

### Integration Tests

```typescript
// File: /tests/integration/api/campaigns.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestUser, deleteTestUser } from '../helpers';

describe('Campaigns API', () => {
  let testUser: { id: string; token: string };
  let newsletterId: string;

  beforeAll(async () => {
    testUser = await createTestUser();
    // Create a newsletter first
    const res = await fetch('/api/v1/newsletters', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testUser.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Newsletter',
        niche: 'technology',
      }),
    });
    const data = await res.json();
    newsletterId = data.newsletter.id;
  });

  afterAll(async () => {
    await deleteTestUser(testUser.id);
  });

  it('should create a campaign', async () => {
    const res = await fetch('/api/v1/campaigns', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testUser.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newsletterId,
        name: 'Test Campaign',
        platform: 'twitter',
        dailyBudgetCents: 2000,
      }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.campaign.name).toBe('Test Campaign');
    expect(data.campaign.status).toBe('draft');
  });

  it('should require authentication', async () => {
    const res = await fetch('/api/v1/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    });

    expect(res.status).toBe(401);
  });

  it('should validate required fields', async () => {
    const res = await fetch('/api/v1/campaigns', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testUser.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Missing required fields
      }),
    });

    expect(res.status).toBe(400);
  });
});
```

### E2E Tests

```typescript
// File: /tests/e2e/campaign-flow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Campaign Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create a Twitter campaign', async ({ page }) => {
    // Navigate to campaigns
    await page.click('text=Campaigns');
    await page.click('text=New Campaign');

    // Fill campaign details
    await page.fill('input[name="name"]', 'E2E Test Campaign');
    await page.selectOption('select[name="newsletterId"]', { index: 1 });
    await page.click('input[value="twitter"]');

    // Fill targeting
    await page.click('text=United States');
    await page.fill('input[placeholder="@handle"]', '@paulgraham');
    await page.keyboard.press('Enter');

    // Fill budget
    await page.fill('input[name="dailyBudget"]', '20');

    // Generate AI copy
    await page.click('text=AI Generate');
    await page.waitForSelector('text=Variation');

    // Select variation
    await page.click('text=Variation A');

    // Save draft
    await page.click('text=Save Draft');
    await expect(page.locator('text=Campaign saved')).toBeVisible();

    // Verify in list
    await page.goto('/campaigns');
    await expect(page.locator('text=E2E Test Campaign')).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/campaigns/new');
    await page.click('text=Save Draft');

    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Newsletter is required')).toBeVisible();
  });
});
```

---

## Deployment Checklist

### Vercel Configuration

```json
// File: /vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/sync-campaigns",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/aggregate-analytics",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Production Checklist

```markdown
## Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables set in Vercel
- [ ] Database migrations applied to production
- [ ] Stripe webhooks configured for production URL
- [ ] ESP webhooks updated to production URL
- [ ] Twitter/LinkedIn app callbacks updated
- [ ] Error tracking (Sentry) configured

## Deployment

- [ ] Deploy to Vercel
- [ ] Verify build success
- [ ] Test all OAuth flows
- [ ] Test Stripe checkout
- [ ] Test webhook endpoints
- [ ] Verify email sending

## Post-Deployment

- [ ] Set up custom domain
- [ ] Configure SSL (automatic with Vercel)
- [ ] Set up uptime monitoring
- [ ] Configure alerts for errors
- [ ] Create database backups schedule
- [ ] Document rollback procedure

## DNS Configuration

1. Add CNAME record:
   - Name: www
   - Value: cname.vercel-dns.com

2. Add A record (for apex domain):
   - Name: @
   - Value: 76.76.21.21

3. Wait for propagation (up to 48 hours)
```

---

## Business Analysis

### Estimated Costs

**Development (assuming solo developer):**
- 30 days at 8 hours/day = 240 hours
- At $100/hour equivalent = $24,000 opportunity cost
- Actual out-of-pocket: $0 (self-built)

**Monthly Infrastructure:**
| Service | Free Tier | Starter | Growth |
|---------|-----------|---------|--------|
| Vercel | $0 | $20 | $20 |
| Neon | $0 | $19 | $69 |
| OpenAI | ~$10 | ~$50 | ~$200 |
| Anthropic | ~$5 | ~$25 | ~$100 |
| Upstash | $0 | $10 | $10 |
| Resend | $0 | $20 | $20 |
| **Total** | **$15** | **$144** | **$419** |

### Revenue Projections

**Pricing:**
- Free: $0 (limited features)
- Starter: $29/mo
- Growth: $79/mo
- Scale: $199/mo

**MRR Projections (12 months):**

| Scenario | Month 3 | Month 6 | Month 12 |
|----------|---------|---------|----------|
| Conservative | $500 | $2,000 | $5,000 |
| Moderate | $1,500 | $5,000 | $15,000 |
| Optimistic | $3,000 | $12,000 | $40,000 |

**Break-even:**
- At conservative: Month 8-10
- At moderate: Month 4-5

### Exit Valuation

SaaS businesses typically sell at 3-10x ARR:

| Timeline | ARR (Moderate) | Valuation Range |
|----------|----------------|-----------------|
| Year 1 | $180,000 | $540K - $1.8M |
| Year 3 | $600,000 | $1.8M - $6M |
| Year 5 | $1,500,000 | $4.5M - $15M |

---

## Complexity Rating

**MEDIUM** (less than a week to MVP, 4 weeks to full product)

**Justification:**
- Multiple third-party integrations (Twitter, LinkedIn, ESPs, Stripe)
- AI integration with two providers
- OAuth flows for multiple platforms
- Real-time-ish features (analytics, previews)
- Single user type simplifies auth
- No real-time collaboration needed
- Standard CRUD operations for most features

---

## Risks & Mitigations

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Twitter API changes/restrictions | Medium | High | Abstract API layer, monitor changelogs |
| LinkedIn API rate limits | Medium | Medium | Implement queuing, caching |
| AI API costs exceed projections | Low | Medium | Set hard limits, usage tracking |
| ESP webhook reliability | Low | Medium | Retry logic, manual sync option |

### Market Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low demand for non-Meta ads | Low | High | Validate with early users, pivot options |
| Competition from Beehiiv native ads | Medium | Medium | Focus on multi-platform, AI differentiation |
| Newsletter market saturation | Medium | Medium | Niche positioning, unique features |

### Cost Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI costs scale faster than revenue | Medium | Medium | Implement usage tiers, caching |
| Ad platform minimum spends increase | Low | Low | Pass costs to users |

---

## Success Metrics

### Launch Criteria (Week 1)
- [ ] 10 beta users onboarded
- [ ] 5 campaigns launched
- [ ] Zero critical bugs
- [ ] <3s page load times

### Month 1 KPIs
- 50 registered users
- 20 active newsletters connected
- $500 MRR
- <5% churn

### Month 3 KPIs
- 200 registered users
- 100 paying customers
- $3,000 MRR
- NPS > 40

### Month 6 KPIs
- 500 registered users
- 250 paying customers
- $10,000 MRR
- 100+ cross-promo swaps completed

---

## Package.json

```json
{
  "name": "CCS",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "tsx scripts/migrate.ts",
    "db:seed": "tsx scripts/seed.ts",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@auth/core": "^0.28.0",
    "next-auth": "^5.0.0-beta.15",
    "drizzle-orm": "^0.29.3",
    "@neondatabase/serverless": "^0.8.1",
    "openai": "^4.28.0",
    "@anthropic-ai/sdk": "^0.17.1",
    "stripe": "^14.18.0",
    "@upstash/redis": "^1.28.3",
    "@upstash/ratelimit": "^1.0.1",
    "zod": "^3.22.4",
    "recharts": "^2.12.0",
    "resend": "^3.2.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "lucide-react": "^0.336.0",
    "date-fns": "^3.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.11.19",
    "@types/react": "^18.2.57",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17",
    "drizzle-kit": "^0.20.14",
    "tsx": "^4.7.1",
    "vitest": "^1.3.1",
    "@playwright/test": "^1.42.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0",
    "prettier": "^3.2.5"
  }
}
```

---

This PRD provides everything needed to build CCS from scratch. Start with Phase 1 and work through sequentially. Each section can be referenced independently during development.
