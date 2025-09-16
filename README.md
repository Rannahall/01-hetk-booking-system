# 🏐 Rule-Based Beach Volleyball Booking System

*Complete development guide for building a production-ready booking system with rule-based flexibility*

## 📋 Quick Navigation

- **🚀 [Quick Start (2 hours)](QUICK-START.md)** - Rapid prototype for testing concepts
- **⚙️ [Configuration Guide](CONFIGURATION.md)** - Business rules and examples
- **📖 Complete Guide** - This document (architecture + implementation + timeline)

## ✅ Plan Feasibility Assessment

### **Overall: SOLID with Timeline Adjustments Needed** ⚠️

**Strengths:**
- ✅ Excellent technology choices (Supabase + Next.js + Stripe)
- ✅ Innovative hybrid approach (pre-generated slots + rule flexibility)
- ✅ Smart payment-first model eliminates no-shows
- ✅ Proper security foundation with RLS policies
- ✅ Can easily handle 50-500+ bookings/month

**Recommended Timeline Adjustments:**
- **Original**: 22 days → **Recommended**: 25 days
- **Add 3 buffer days** for real-world complexity
- **Simplify V1 admin interface** (enhance post-launch)
- **Test critical paths early** (Stripe webhooks, pg_cron)

**Cost Projections Look Good:**
- €85-105/month for 500 bookings is competitive
- Technology choices support these projections

## 🎯 System Overview

### What This System Does
- **Rule-Based Slot Management**: Generate booking slots automatically based on configurable business rules
- **Staggered Court Scheduling**: Handle facility constraints (Court A at :00, Court B at :30)
- **Payment-First Booking**: Eliminate no-shows with Stripe payment integration
- **Admin Self-Service**: Venue owners modify pricing/availability without developer involvement
- **Real-Time Updates**: Live slot availability with Supabase real-time

### Key Innovation: Hybrid Approach
Unlike purely static (pre-generated) or dynamic (calculated on-demand) systems, this hybrid approach:
- ✅ **Fast Performance**: Pre-generated slots with database indexes
- ✅ **Rule Flexibility**: JSON-based business configuration
- ✅ **Auto-Maintenance**: Cron jobs handle slot generation and cleanup
- ✅ **Conflict Prevention**: Database constraints prevent double bookings
- ✅ **Instant Rule Changes**: Updates take effect immediately

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time + Edge Functions)
- **Payments**: Stripe (Payment Intents + Webhooks)
- **Automation**: pg_cron for scheduled tasks
- **Monitoring**: Built-in Supabase + custom health checks

### Expected Performance & Costs
- **Performance**: <500ms API responses, <2s page loads, >99.5% uptime
- **Scalability**: 50-500+ bookings/month without architecture changes
- **Monthly Costs**: €85-105 for 500 bookings/month (Supabase + Stripe + hosting)

## 🚀 Quick Start Options

### Option 1: Immediate Prototype (2 hours)
**Perfect for**: Testing concepts, demos, proof-of-concept
```bash
# Follow: quick-start-guide.md
# Result: Working booking system with basic features
# Next: Enhance with production features
```

### Option 2: Production Implementation (22 days)
**Perfect for**: Real business deployment, scalable system
```bash
# Follow: development-timeline.md + rule-based-booking-system.md
# Result: Production-ready system with security, monitoring, admin interface
# Includes: Full documentation, testing, deployment procedures
```

### Option 3: Hybrid Approach (1 week)
**Perfect for**: Experienced developers, existing system enhancement
```bash
# Use: rule-based-booking-system.md for architecture
# Implement: Core features from quick-start-guide.md
# Add: Selected production features as needed
```

## 🛠 Technology Stack

### Core Technologies
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time + Edge Functions)
- **Payments**: Stripe (Payment Intents + Webhooks)
- **Automation**: pg_cron for scheduled tasks
- **Monitoring**: Built-in Supabase + custom health checks

### Key Architectural Decisions
| Decision | Rationale | Alternative | Trade-off |
|----------|-----------|-------------|-----------|
| Rule-Based System | Admin flexibility without developer | Hardcoded logic | +6-8 dev days for infinite future flexibility |
| Hybrid Slot Generation | Fast queries + flexible rules | Pure dynamic or static | Moderate complexity for optimal performance |
| Payment-First | Eliminate no-shows | Pay on arrival | Higher friction but guaranteed revenue |
| Supabase | Rapid development + managed infrastructure | Custom PostgreSQL | Vendor lock-in vs development speed |

## 📅 Development Timeline

### **Recommended Timeline: 25 days** (adjusted from original 22 days)

### Phase 1: Enhanced Foundation (Days 1-6)

**Day 1: Database & Security Foundation**
- [ ] Create Supabase project and enhanced database schema
- [ ] Configure proper RLS policies (not simple password protection)
- [ ] Set up admin authentication with Supabase Auth
- [ ] Create comprehensive database indexes
- [ ] Set up database backup schedule

**Day 2: Rule Engine & Slot Generation**
- [ ] Create business rules insertion with JSON validation
- [ ] Implement slot generation algorithm with court staggering
- [ ] Add dynamic pricing calculation based on rules
- [ ] Create Edge Function for automated slot generation

**Day 3: Payment Integration & Security**
- [ ] Set up Stripe webhook endpoints with signature verification
- [ ] Implement payment intent creation with proper metadata
- [ ] Create booking creation flow with database transactions
- [ ] Add payment failure handling and slot restoration

**Day 4: Error Handling & Monitoring**
- [ ] Implement comprehensive error boundaries for all APIs
- [ ] Add structured logging with proper log levels
- [ ] Create health check endpoints and system monitoring
- [ ] Add rate limiting and CSRF protection

**Day 5: Cron Jobs & Automation**
- [ ] Configure pg_cron extension in Supabase
- [ ] Create automated slot generation job (daily at 2 AM)
- [ ] Implement slot cleanup and expired booking automation
- [ ] Set up cron job monitoring and failure alerts

**Day 6: Core Testing & Validation**
- [ ] Create unit tests for slot generation logic
- [ ] Add integration tests for booking flow
- [ ] Test payment webhook scenarios and business rule edge cases
- [ ] Perform load testing on slot generation

### Phase 2: Frontend & User Experience (Days 7-12)

**Day 7: Enhanced Frontend Architecture**
- [ ] Set up Next.js 14 project with TypeScript and Tailwind CSS
- [ ] Implement Supabase client with proper TypeScript types
- [ ] Build slot selection component with real-time updates
- [ ] Create responsive, mobile-optimized interface

**Day 8: Payment UI Integration**
- [ ] Integrate Stripe Elements into booking flow
- [ ] Implement payment form with validation and success/failure handling
- [ ] Add payment processing indicators and retry functionality
- [ ] Test payment flow extensively

**Day 9-10: Real-time Features** ⚠️ *Extended timeline*
- [ ] Implement Supabase real-time subscriptions
- [ ] Add live slot availability updates and real-time booking notifications
- [ ] Create optimistic updates for better perceived performance
- [ ] Test real-time features under load

**Day 11: Admin Interface Foundation**
- [ ] Create admin authentication pages and dashboard
- [ ] Build slot blocking interface and bulk operations
- [ ] Implement booking management interface
- [ ] Add basic business rule modification interface

**Day 12: Admin Analytics** *Simplified for V1*
- [ ] Create basic booking analytics dashboard
- [ ] Implement revenue reporting and usage pattern visualization
- [ ] Add export functionality (CSV)
- [ ] Build capacity utilization reports

### Phase 3: Production Deployment (Days 13-18)

**Day 13: Environment Setup & CI/CD**
- [ ] Set up production Supabase and Stripe environments
- [ ] Configure Vercel production deployment
- [ ] Create CI/CD pipeline with GitHub Actions
- [ ] Set up monitoring and alerting for production

**Day 14-15: Security Hardening** ⚠️ *Extended timeline*
- [ ] Conduct comprehensive security audit of all endpoints
- [ ] Implement content security policy (CSP) and security headers
- [ ] Add request rate limiting and data encryption
- [ ] Configure backup encryption and test security measures

**Day 16: Performance Optimization** *Simplified*
- [ ] Implement basic database query optimization
- [ ] Add API response caching where beneficial
- [ ] Optimize frontend bundle size
- [ ] Test performance under expected load

**Day 17: Data Privacy & Compliance**
- [ ] Implement GDPR compliance features (data retention, export, deletion)
- [ ] Add privacy policy integration and consent management
- [ ] Create audit logging for data access
- [ ] Test compliance features

**Day 18: Backup & Disaster Recovery**
- [ ] Set up automated database backups with point-in-time recovery
- [ ] Create disaster recovery plan and test procedures
- [ ] Implement monitoring for backup health
- [ ] Train team on recovery procedures

### Phase 4: Launch & Optimization (Days 19-22)

**Day 19: Soft Launch**
- [ ] Deploy to production with limited user testing
- [ ] Enable monitoring and conduct smoke tests
- [ ] Begin collecting user feedback and test payment processing

**Day 20: Feedback Integration**
- [ ] Analyze user behavior and implement critical improvements
- [ ] Fix discovered bugs and optimize conversion funnel
- [ ] Enhance admin interface based on venue feedback

**Day 21: Full Launch & Marketing**
- [ ] Enable all system features and launch marketing
- [ ] Monitor system under full load and provide customer support
- [ ] Track conversion rates and address scaling issues

**Day 22: Post-Launch Support**
- [ ] Create comprehensive system documentation
- [ ] Set up ongoing maintenance schedules and monitoring procedures
- [ ] Train venue staff and establish customer support systems

**Days 23-25: Buffer & Polish** ⚠️ *Added buffer time*
- [ ] Address any remaining issues from launch
- [ ] Performance tuning based on real usage
- [ ] Documentation updates and knowledge transfer

### Success Metrics

**Technical Metrics**
- Uptime: >99.5% availability
- Performance: <2s page load times, <500ms API responses
- Security: Zero security incidents, passing security audits
- Reliability: <1% payment failures, automated recovery

**Business Metrics**
- Booking Conversion: >60% slot selection to payment completion
- Customer Satisfaction: >4.5/5 rating
- Admin Efficiency: <5 minutes to block slots or modify pricing
- Revenue Protection: Zero no-shows due to payment-first model

## 🗺 Database Schema

### Core Tables

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Business Rules Table (Core of Rule System)
CREATE TABLE business_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_type TEXT NOT NULL CHECK (rule_type IN ('operating_hours', 'pricing', 'court_config', 'slot_generation')),
    rule_key TEXT NOT NULL,
    rule_value JSONB NOT NULL,
    
    -- Versioning and lifecycle
    version INTEGER DEFAULT 1,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_until DATE,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Ensure unique active rules
    UNIQUE(rule_type, rule_key, effective_from) WHERE is_active = TRUE
);

-- Available Slots Table (Core of Hybrid Approach)
CREATE TABLE available_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Slot identification
    court_name TEXT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    start_datetime TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (
        (slot_date + start_time) AT TIME ZONE 'Europe/Tallinn'
    ) STORED,
    end_datetime TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (
        (slot_date + end_time) AT TIME ZONE 'Europe/Tallinn'
    ) STORED,
    
    -- Pricing and availability
    base_price_cents INTEGER NOT NULL,
    current_price_cents INTEGER NOT NULL DEFAULT base_price_cents,
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Rule traceability
    generated_from_rules JSONB NOT NULL,
    pricing_rule_id UUID REFERENCES business_rules(id),
    
    -- Metadata
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent overlapping slots
    CONSTRAINT no_overlapping_slots EXCLUDE USING gist (
        court_name WITH =,
        tstzrange(start_datetime, end_datetime) WITH &&
    )
);

-- Enhanced Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id UUID NOT NULL REFERENCES available_slots(id) ON DELETE RESTRICT,
    
    -- Customer information
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    customer_phone TEXT NOT NULL,
    
    -- Payment information
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    stripe_payment_status TEXT NOT NULL DEFAULT 'requires_payment_method',
    amount_paid_cents INTEGER NOT NULL,
    
    -- Booking metadata
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    booking_source TEXT DEFAULT 'web' CHECK (booking_source IN ('web', 'admin', 'api')),
    
    -- Special requirements
    special_requests TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Prevent double booking
    CONSTRAINT unique_confirmed_slot UNIQUE(slot_id) WHERE status IN ('confirmed', 'completed')
);
```

### Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE business_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public can read available slots and active business rules
CREATE POLICY "Public can read available slots"
ON available_slots FOR SELECT
TO public
USING (
    is_available = TRUE 
    AND slot_date >= CURRENT_DATE
);

CREATE POLICY "Public can read active business rules"
ON business_rules FOR SELECT
TO public
USING (is_active = TRUE AND (effective_until IS NULL OR effective_until >= CURRENT_DATE));

-- Service role has full access for Edge Functions
CREATE POLICY "Service role full access slots" ON available_slots
FOR ALL TO service_role USING (TRUE);

CREATE POLICY "Service role full access bookings" ON bookings
FOR ALL TO service_role USING (TRUE);
```

### Performance Indexes

```sql
-- Critical indexes for query performance
CREATE INDEX idx_available_slots_court_date ON available_slots(court_name, slot_date) 
WHERE is_available = TRUE;

CREATE INDEX idx_available_slots_datetime ON available_slots USING gist(
    tstzrange(start_datetime, end_datetime)
);

CREATE INDEX idx_bookings_slot_status ON bookings(slot_id, status) 
WHERE status IN ('confirmed', 'completed');

CREATE INDEX idx_business_rules_lookup ON business_rules(rule_type, rule_key, is_active)
WHERE is_active = TRUE;
```

## 🔒 Security & Best Practices

### Security Checklist

1. **Authentication & Authorization**
   - ✅ Use Supabase Auth for admin users
   - ✅ Implement proper RLS policies
   - ✅ Validate JWT tokens in Edge Functions
   - ✅ Use service role key only in Edge Functions

2. **Input Validation**
   - ✅ Validate all user inputs with schemas (Zod)
   - ✅ Sanitize email addresses and phone numbers
   - ✅ Check business rule JSON schemas
   - ✅ Validate date ranges and time formats

3. **Payment Security**
   - ✅ Use Stripe Payment Intents (PCI compliant)
   - ✅ Validate webhook signatures
   - ✅ Never store card details
   - ✅ Log all payment attempts

4. **Database Security**
   - ✅ Enable RLS on all tables
   - ✅ Use parameterized queries
   - ✅ Limit database permissions
   - ✅ Regular security audits

### Error Handling Pattern

```typescript
// Standardized error handling
class BookingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'BookingError';
  }
}

// Usage in Edge Functions
try {
  // ... business logic
} catch (error) {
  if (error instanceof BookingError) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: error.code 
      }),
      { 
        status: error.statusCode,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error);
  
  return new Response(
    JSON.stringify({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }),
    { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    }
  );
}
```

## 🎛 Admin Features

### Self-Service Capabilities
- **Slot Blocking**: Block courts for training/maintenance
- **Pricing Updates**: Modify rates by time/day without code changes
- **Schedule Changes**: Update operating hours, slot durations
- **Analytics Dashboard**: Revenue, utilization, booking patterns
- **Customer Management**: View bookings, handle special requests

### Business Rule Examples
```json
{
  "weekday_pricing": {
    "07:00-09:00": 65,
    "09:00-15:30": 40,
    "15:30-17:00": 65,
    "17:00-21:30": 85,
    "21:30-23:00": 65
  },
  "court_config": {
    "Court A": {"offset_minutes": 0},
    "Court B": {"offset_minutes": 30}
  },
  "slot_generation": {
    "duration_minutes": 90,
    "days_ahead": 60,
    "buffer_time": 0
  }
}
```

## 📋 Implementation Checklist

### Pre-Development
- [ ] Read all documentation thoroughly
- [ ] Set up Supabase and Stripe accounts
- [ ] Choose implementation approach (prototype vs production)
- [ ] Prepare development environment

### Development Phase
- [ ] Follow chosen guide (Quick Start or Timeline)
- [ ] Implement security measures from day one
- [ ] Set up monitoring and logging early
- [ ] Test extensively throughout development

### Pre-Launch
- [ ] Complete security audit
- [ ] Performance testing under load
- [ ] Backup and disaster recovery testing
- [ ] User acceptance testing
- [ ] Staff training on admin interface

### Post-Launch
- [ ] Monitor system health daily
- [ ] Collect user feedback
- [ ] Plan feature enhancements
- [ ] Schedule regular maintenance

## 🆘 Support & Troubleshooting

### Common Issues & Solutions

**Slots Not Appearing**
- Check slot generation cron job status
- Verify business rules are active
- Confirm RLS policies allow public read access

**Payment Failures**
- Validate Stripe webhook signatures
- Check webhook endpoint accessibility
- Verify payment intent metadata

**Performance Issues**
- Review database query performance
- Check connection pool utilization
- Monitor Edge Function execution times

### Future Enhancements
- **Multi-Facility Support**: Scale to multiple venues
- **Mobile App**: Native iOS/Android applications  
- **Advanced Analytics**: ML-powered booking predictions
- **Integration APIs**: Connect with sports club management systems
- **Subscription Models**: Membership tiers and recurring bookings

---

*This documentation package provides everything needed to build a production-ready booking system. The rule-based hybrid approach ensures optimal performance while maintaining the flexibility to adapt to changing business requirements.*

**Next Steps:**

- 🏃‍♂️ **Need it fast?** → [QUICK-START.md](QUICK-START.md)
- 🏗️ **Building for production?** → Follow the complete timeline above
- ⚙️ **Configure business rules?** → [CONFIGURATION.md](CONFIGURATION.md)
- 📚 **Understand the architecture?** → Review the sections above