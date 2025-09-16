# ⚙️ Business Rules Configuration Guide

*Practical examples for configuring your rule-based booking system*

## Overview

The rule-based system stores all business logic as JSON in the `business_rules` table. This allows venue administrators to modify pricing, scheduling, and availability without developer involvement.

## Core Rule Categories

### 1. Court Configuration Rules

#### Basic Court Setup
```sql
-- Define available courts and their characteristics
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('court_config', 'courts_available', '{
  "Court A": {
    "start_time_offset": 0,
    "capacity": 4,
    "surface_type": "sand",
    "equipment": ["nets", "boundary_ropes"],
    "changing_room_group": "main"
  },
  "Court B": {
    "start_time_offset": 30,
    "capacity": 4,
    "surface_type": "sand", 
    "equipment": ["nets", "boundary_ropes"],
    "changing_room_group": "main"
  }
}');

-- Slot generation parameters
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('court_config', 'slot_generation', '{
  "duration_minutes": 90,
  "interval_minutes": 90,
  "days_ahead": 60,
  "start_hour": 7,
  "end_hour": 23,
  "timezone": "Europe/Tallinn"
}');
```

### 2. Pricing Rules

#### Estonian Beach Volleyball Facility Example
```sql
-- Weekday pricing (complex time-based)
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('pricing', 'weekday_rates', '{
  "07:00-09:00": {
    "base_price": 65,
    "description": "Early morning premium",
    "target_audience": "professionals"
  },
  "09:00-15:30": {
    "base_price": 40,
    "description": "Daytime standard",
    "target_audience": "casual_players"
  },
  "15:30-17:00": {
    "base_price": 65,
    "description": "Pre-peak transition", 
    "target_audience": "after_school"
  },
  "17:00-21:30": {
    "base_price": 85,
    "description": "Peak after-work hours",
    "target_audience": "working_professionals"
  },
  "21:30-23:00": {
    "base_price": 65,
    "description": "Late evening premium",
    "target_audience": "night_players"
  }
}');

-- Weekend pricing (simplified)
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('pricing', 'weekend_rates', '{
  "07:00-12:00": {
    "base_price": 75,
    "description": "Weekend morning premium"
  },
  "12:00-18:00": {
    "base_price": 85,
    "description": "Weekend peak hours"
  },
  "18:00-23:00": {
    "base_price": 75,
    "description": "Weekend evening"
  }
}');

-- Holiday pricing
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('pricing', 'holiday_rates', '{
  "christmas": {
    "dates": ["2024-12-24", "2024-12-25", "2024-12-26"],
    "multiplier": 1.5,
    "minimum_price": 80
  },
  "new_year": {
    "dates": ["2024-12-31", "2025-01-01"],
    "multiplier": 2.0,
    "minimum_price": 100
  },
  "midsummer": {
    "dates": ["2024-06-23", "2024-06-24"],
    "multiplier": 1.3,
    "special_hours": "06:00-02:00"
  }
}');
```

#### Dynamic Pricing Examples
```sql
-- Demand-based pricing
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('pricing', 'dynamic_pricing', '{
  "enable_demand_pricing": true,
  "utilization_thresholds": {
    "high_demand": {
      "threshold": 0.8,
      "price_increase": 1.2,
      "max_price": 120
    },
    "low_demand": {
      "threshold": 0.3,
      "price_decrease": 0.9,
      "min_price": 30
    }
  },
  "advance_booking_discount": {
    "7_days": 0.9,
    "14_days": 0.85,
    "30_days": 0.8
  }
}');

-- Group discounts
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('pricing', 'group_discounts', '{
  "training_groups": {
    "min_bookings_per_month": 8,
    "discount_percentage": 0.15,
    "requires_contract": true
  },
  "corporate_rates": {
    "min_bookings_per_month": 4,
    "discount_percentage": 0.1,
    "invoice_payment": true
  },
  "student_rates": {
    "discount_percentage": 0.2,
    "valid_times": ["09:00-15:30"],
    "requires_id_verification": true
  }
}');
```

### 3. Operating Hours Rules

#### Standard Schedule
```sql
-- Basic operating hours
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('operating_hours', 'standard_schedule', '{
  "monday": {"open": "07:00", "close": "23:00"},
  "tuesday": {"open": "07:00", "close": "23:00"}, 
  "wednesday": {"open": "07:00", "close": "23:00"},
  "thursday": {"open": "07:00", "close": "23:00"},
  "friday": {"open": "07:00", "close": "23:00"},
  "saturday": {"open": "08:00", "close": "23:00"},
  "sunday": {"open": "08:00", "close": "22:00"}
}');

-- Seasonal adjustments
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('operating_hours', 'seasonal_schedule', '{
  "summer": {
    "months": [6, 7, 8],
    "extended_hours": {
      "monday": {"open": "06:00", "close": "24:00"},
      "friday": {"open": "06:00", "close": "24:00"},
      "saturday": {"open": "06:00", "close": "24:00"}
    }
  },
  "winter": {
    "months": [12, 1, 2],
    "reduced_hours": {
      "monday": {"open": "08:00", "close": "22:00"},
      "sunday": {"open": "10:00", "close": "20:00"}
    },
    "weather_dependent": true
  }
}');
```

### 4. Slot Generation Rules

#### Basic Generation Config
```sql
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('slot_generation', 'generation_config', '{
  "durationMinutes": 90,
  "startHour": 7,
  "endHour": 23,
  "courts": {
    "Court A": {"startTimeOffset": 0},
    "Court B": {"startTimeOffset": 30}
  },
  "daysAhead": 60,
  "generateOnDays": [1, 2, 3, 4, 5, 6, 0],
  "excludeHolidays": true
}');
```

## Practical Rule Update Examples

### Updating Prices Mid-Season
```sql
-- Increase peak hour prices by 10%
UPDATE business_rules 
SET rule_value = jsonb_set(
  rule_value, 
  '{17:00-21:30,base_price}',
  '95'::jsonb
)
WHERE rule_type = 'pricing' 
AND rule_key = 'weekday_rates';
```

### Adding Holiday Surcharge
```sql
-- Add Christmas holiday pricing
INSERT INTO business_rules (rule_type, rule_key, rule_value, effective_from) VALUES
('pricing', 'christmas_2024', '{
  "dates": ["2024-12-24", "2024-12-25", "2024-12-26"],
  "price_override": {
    "07:00-23:00": 95
  },
  "special_message": "Holiday premium rates apply"
}', '2024-12-20');
```

### Blocking Courts for Tournament
```sql
-- Block both courts for weekend tournament
INSERT INTO blocked_periods (
  court_name, 
  start_datetime, 
  end_datetime, 
  reason, 
  block_type
) VALUES 
(NULL, '2024-06-15 06:00:00+03', '2024-06-16 20:00:00+03', 'Beach Volleyball Championship', 'event');
```

### Creating Training Group Schedule
```sql
-- Weekly recurring training block
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('training_blocks', 'elite_team_a', '{
  "schedule": {
    "monday": {"time": "18:00-19:30", "court": "Court A"},
    "wednesday": {"time": "18:00-19:30", "court": "Court A"},
    "friday": {"time": "18:00-19:30", "court": "Court A"}
  },
  "duration": "90_minutes",
  "recurring": "weekly",
  "priority": "highest",
  "contact": {
    "coach": "Meelis Kivisild",
    "email": "coach@elitevolley.ee"
  },
  "payment": {
    "type": "monthly_invoice",
    "rate": "special_training_rate"
  }
}');
```

## Common Rule Patterns

### Pattern 1: Time-Based Pricing
```sql
-- Use for facilities with clear peak/off-peak patterns
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('pricing', 'time_based_rates', '{
  "peak": {
    "times": ["17:00-21:30"],
    "weekday_price": 85,
    "weekend_price": 95
  },
  "off_peak": {
    "times": ["07:00-17:00", "21:30-23:00"],
    "weekday_price": 40,
    "weekend_price": 65
  }
}');
```

### Pattern 2: Membership Tiers
```sql
-- Use for facilities with regular customers
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('pricing', 'membership_tiers', '{
  "premium": {
    "monthly_fee": 50,
    "hourly_discount": 0.2,
    "priority_booking": 7,
    "cancellation_flexibility": true
  },
  "standard": {
    "monthly_fee": 25,
    "hourly_discount": 0.1,
    "priority_booking": 3,
    "cancellation_flexibility": false
  },
  "casual": {
    "monthly_fee": 0,
    "hourly_discount": 0,
    "priority_booking": 0,
    "cancellation_flexibility": false
  }
}');
```

### Pattern 3: Event-Based Blocking
```sql
-- Use for facilities hosting tournaments/events
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('event_management', 'tournament_schedule', '{
  "summer_championship": {
    "dates": ["2024-07-15", "2024-07-16"],
    "blocked_courts": ["Court A", "Court B"],
    "event_hours": "08:00-20:00",
    "setup_time": "07:00-08:00",
    "cleanup_time": "20:00-21:00"
  },
  "monthly_league": {
    "frequency": "first_saturday",
    "blocked_courts": ["Court A"],
    "event_hours": "10:00-16:00",
    "recurring": true
  }
}');
```

## Rule Validation Examples

### JSON Schema for Price Rules
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "patternProperties": {
    "^[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}$": {
      "oneOf": [
        {"type": "number", "minimum": 0},
        {
          "type": "object",
          "properties": {
            "base_price": {"type": "number", "minimum": 0},
            "description": {"type": "string"},
            "target_audience": {"type": "string"}
          },
          "required": ["base_price"]
        }
      ]
    }
  }
}
```

### Validation Function Example
```sql
-- Function to validate pricing rules
CREATE OR REPLACE FUNCTION validate_pricing_rule(rule_data JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    time_slot TEXT;
    price_value JSONB;
BEGIN
    -- Check if rule_data is an object
    IF jsonb_typeof(rule_data) != 'object' THEN
        RAISE EXCEPTION 'Pricing rule must be an object';
    END IF;
    
    -- Validate each time slot
    FOR time_slot, price_value IN SELECT * FROM jsonb_each(rule_data)
    LOOP
        -- Validate time format (HH:MM-HH:MM)
        IF time_slot !~ '^[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}$' THEN
            RAISE EXCEPTION 'Invalid time format: %', time_slot;
        END IF;
        
        -- Validate price value
        IF jsonb_typeof(price_value) = 'number' THEN
            IF (price_value::numeric) < 0 THEN
                RAISE EXCEPTION 'Price cannot be negative: %', price_value;
            END IF;
        ELSIF jsonb_typeof(price_value) = 'object' THEN
            IF NOT (price_value ? 'base_price') THEN
                RAISE EXCEPTION 'Missing base_price in time slot: %', time_slot;
            END IF;
            IF (price_value->>'base_price')::numeric < 0 THEN
                RAISE EXCEPTION 'base_price cannot be negative: %', time_slot;
            END IF;
        ELSE
            RAISE EXCEPTION 'Invalid price format for time slot: %', time_slot;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate pricing rules before insert/update
CREATE OR REPLACE FUNCTION validate_business_rule_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rule_type = 'pricing' AND NEW.rule_key LIKE '%_rates' THEN
        PERFORM validate_pricing_rule(NEW.rule_value);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_business_rules
    BEFORE INSERT OR UPDATE ON business_rules
    FOR EACH ROW
    EXECUTE FUNCTION validate_business_rule_trigger();
```

## Migration Scripts

### Adding New Rule Types
```sql
-- Add new rule type to existing constraint
ALTER TABLE business_rules 
DROP CONSTRAINT IF EXISTS business_rules_rule_type_check;

ALTER TABLE business_rules 
ADD CONSTRAINT business_rules_rule_type_check 
CHECK (rule_type IN ('operating_hours', 'pricing', 'court_config', 'slot_generation', 'training_blocks', 'event_management', 'membership_tiers'));
```

### Updating Existing Rules
```sql
-- Script to update all weekend pricing by 10%
UPDATE business_rules 
SET rule_value = (
  SELECT jsonb_object_agg(
    key,
    CASE 
      WHEN jsonb_typeof(value) = 'number' 
      THEN (value::text::numeric * 1.1)::text::jsonb
      WHEN jsonb_typeof(value) = 'object' AND value ? 'base_price'
      THEN jsonb_set(value, '{base_price}', ((value->>'base_price')::numeric * 1.1)::text::jsonb)
      ELSE value
    END
  )
  FROM jsonb_each(rule_value)
),
updated_at = NOW()
WHERE rule_type = 'pricing' 
AND rule_key = 'weekend_rates';
```

This configuration guide provides practical, real-world examples for setting up and managing business rules in your booking system. The JSON-based approach ensures maximum flexibility while maintaining data integrity through validation functions.
