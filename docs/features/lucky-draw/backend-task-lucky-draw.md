# Lucky Draw Feature - Backend Implementation Tasks

## Overview

This document outlines the backend implementation tasks for the Lucky Draw feature API integration. All tasks should follow the existing Rails patterns and conventions used in the EventzFlow backend.

**Reference**: See `docs/api-integration-plan.md` for complete API specification and data models.

## Database Tasks

### 1. Create Database Migrations

#### Task 1.1: Create `lucky_draw_configs` table
- [x] Create migration file
- [x] Add table with columns:
  - `id` (primary key)
  - `event_id` (foreign key, unique, references `events.id`)
  - `draw_style` (enum: 'wheel', 'slot', 'box')
  - `use_gifts` (boolean, default: false)
  - `created_at`, `updated_at` (timestamps)
- [x] Add unique constraint on `event_id`
- [x] Add foreign key constraint
- [x] Run migration and verify

#### Task 1.2: Create `gifts` table
- [x] Create migration file
- [x] Add table with columns:
  - `id` (primary key)
  - `event_id` (foreign key, references `events.id`)
  - `name` (string)
  - `order` (integer, default: 0)
  - `winner_counts` (integer, default: 0)
  - `created_at`, `updated_at` (timestamps)
- [x] Add foreign key constraint
- [x] Add indexes on `event_id` and `order`
- [x] Run migration and verify

#### Task 1.3: Create `gift_winners` table
- [x] Create migration file
- [x] Add table with columns:
  - `id` (primary key)
  - `gift_id` (foreign key, references `gifts.id`)
  - `ticket_id` (foreign key, nullable, references `tickets.id`, cascade delete)
  - `visitor_id` (foreign key, nullable, references `visitors.id`, cascade delete)
  - `drawn_at` (timestamp)
  - `created_at`, `updated_at` (timestamps)
- [x] Add foreign key constraints with cascade delete on `ticket_id` and `visitor_id`
- [x] Add check constraint: exactly one of `ticket_id` or `visitor_id` must be non-null
- [x] Add indexes on `gift_id`, `ticket_id`, `visitor_id`
- [x] Run migration and verify

#### Task 1.4: Create `invalid_participants` table
- [x] Create migration file
- [x] Add table with columns:
  - `id` (primary key)
  - `event_id` (foreign key, references `events.id`)
  - `ticket_id` (foreign key, nullable, references `tickets.id`, cascade delete)
  - `visitor_id` (foreign key, nullable, references `visitors.id`, cascade delete)
  - `created_at`, `updated_at` (timestamps)
- [x] Add foreign key constraints with cascade delete on `ticket_id` and `visitor_id`
- [x] Add check constraint: exactly one of `ticket_id` or `visitor_id` must be non-null
- [x] Add unique constraints using partial indexes:
  - Unique on `(event_id, ticket_id)` where `ticket_id IS NOT NULL`
  - Unique on `(event_id, visitor_id)` where `visitor_id IS NOT NULL`
- [x] Add indexes on `event_id`, `ticket_id`, `visitor_id`
- [x] Run migration and verify

## Model Tasks

### 2. Create ActiveRecord Models

#### Task 2.1: Create `LuckyDrawConfig` model
- [x] Create model file `app/models/lucky_draw_config.rb`
- [x] Add `belongs_to :event`
- [x] Add validations:
  - `event_id` presence and uniqueness
  - `draw_style` inclusion in ['wheel', 'slot', 'box']
- [x] Add enum for `draw_style`
- [x] Add default scope or class method to find or create default config
- [ ] Add tests

#### Task 2.2: Create `Gift` model
- [x] Create model file `app/models/gift.rb`
- [x] Add `belongs_to :event`
- [x] Add `has_many :gift_winners, dependent: :destroy`
- [x] Add validations:
  - `event_id` presence
  - `name` presence
  - `order` presence, numericality
  - `winner_counts` presence, numericality, >= 0
- [x] Add scope for ordered gifts
- [x] Add class method to calculate next order position
- [ ] Add tests

#### Task 2.3: Create `GiftWinner` model
- [x] Create model file `app/models/gift_winner.rb`
- [x] Add `belongs_to :gift`
- [x] Add `belongs_to :ticket, optional: true`
- [x] Add `belongs_to :visitor, optional: true`
- [x] Add validations:
  - `gift_id` presence
  - Exactly one of `ticket_id` or `visitor_id` must be present
  - Ticket/visitor must belong to the event
- [x] Add custom validation to ensure ticket/visitor belongs to gift's event
- [ ] Add tests

#### Task 2.4: Create `InvalidParticipant` model
- [x] Create model file `app/models/invalid_participant.rb`
- [x] Add `belongs_to :event`
- [x] Add `belongs_to :ticket, optional: true`
- [x] Add `belongs_to :visitor, optional: true`
- [x] Add validations:
  - `event_id` presence
  - Exactly one of `ticket_id` or `visitor_id` must be present
  - Ticket/visitor must belong to the event
- [x] Add custom validation to ensure ticket/visitor belongs to event
- [ ] Add tests

#### Task 2.5: Update `Event` model
- [x] Add `has_one :lucky_draw_config, dependent: :destroy`
- [x] Add `has_many :gifts, dependent: :destroy`
- [x] Add `has_many :invalid_participants, dependent: :destroy`
- [ ] Add tests

## Controller Tasks

### 3. Create Controllers

#### Task 3.1: Create `LuckyDrawConfigsController`
- [x] Create controller file `app/controllers/v1/lucky_draw/lucky_draw_configs_controller.rb`
- [x] Add `before_action :set_event_and_authorize`
- [x] Implement `show` action (GET /v1/events/:event_id/lucky_draw/config)
  - Find or create default config if not exists
  - Return standard API response format
- [x] Implement `update` action (PUT /v1/events/:event_id/lucky_draw/config)
  - Authorize: event admins and org admins
  - Update config with strong parameters
  - Return standard API response format
- [x] Add strong parameters method
- [x] Add error handling
- [x] Add tests

#### Task 3.2: Create `GiftsController`
- [x] Create controller file `app/controllers/v1/lucky_draw/gifts_controller.rb`
- [x] Add `before_action :set_event_and_authorize`
- [x] Add `before_action :set_gift, only: [:show, :update, :destroy]`
- [x] Implement `index` action (GET /v1/events/:event_id/lucky_draw/gifts)
  - Return gifts with winners included
  - Return standard API response format
- [x] Implement `create` action (POST /v1/events/:event_id/lucky_draw/gifts)
  - Calculate order if not provided (MAX + 1, or 1 if none)
  - Create gift with strong parameters
  - Return standard API response format
- [x] Implement `update` action (PUT /v1/events/:event_id/lucky_draw/gifts/:gift_id)
  - Update gift with strong parameters
  - Return standard API response format
- [x] Implement `destroy` action (DELETE /v1/events/:event_id/lucky_draw/gifts/:gift_id)
  - Hard delete gift (cascade deletes winners)
  - Return 204 No Content
- [x] Add strong parameters method
- [x] Add error handling
- [x] Add tests

#### Task 3.3: Create `GiftWinnersController`
- [x] Create controller file `app/controllers/v1/lucky_draw/gift_winners_controller.rb`
- [x] Add `before_action :set_event_and_authorize`
- [x] Add `before_action :set_gift`
- [x] Implement `create` action (POST /v1/events/:event_id/lucky_draw/gifts/:gift_id/winners)
  - Authorize: event admins, team members, and org admins
  - Validate exactly one of ticket_id or visitor_id
  - Validate ticket/visitor belongs to event
  - Create winner with `drawn_at` timestamp
  - Return standard API response format
- [x] Implement `bulk` action (POST /v1/events/:event_id/lucky_draw/gifts/:gift_id/winners/bulk)
  - Authorize: event admins, team members, and org admins
  - Wrap in transaction (all-or-nothing)
  - Validate each winner
  - Create all winners or rollback
  - Return standard API response format
- [x] Implement `destroy` action (DELETE /v1/events/:event_id/lucky_draw/gifts/:gift_id/winners/:winner_id)
  - Hard delete winner
  - Return 204 No Content
- [x] Add strong parameters method
- [x] Add error handling
- [x] Add tests

#### Task 3.4: Create `LuckyDrawParticipantsController`
- [x] Create controller file `app/controllers/v1/lucky_draw/lucky_draw_participants_controller.rb`
- [x] Add `before_action :set_event_and_authorize`
- [x] Implement `index` action (GET /v1/events/:event_id/lucky_draw/participants)
  - Respect event's ticket/visitor system (use_ticket flag)
  - Filter by type if provided
  - Exclude winners if `exclude_winners=true` (won ANY gift)
  - Exclude invalid participants if `exclude_invalid=true`
  - Exclude participants with null names
  - Return participants with name from attendee_name or full_name
  - Return only `{id, name}` in response (no ticket_id/visitor_id)
  - Return standard API response format
- [x] Add query parameter handling
- [x] Add error handling
- [x] Add tests

#### Task 3.5: Create `InvalidParticipantsController`
- [x] Create controller file `app/controllers/v1/lucky_draw/invalid_participants_controller.rb`
- [x] Add `before_action :set_event_and_authorize`
- [x] Add `before_action :set_invalid_participant, only: [:destroy]`
- [x] Implement `index` action (GET /v1/events/:event_id/lucky_draw/invalid_participants)
  - Return invalid participants with participant object (id, name)
  - Return standard API response format
- [x] Implement `create` action (POST /v1/events/:event_id/lucky_draw/invalid_participants)
  - Validate exactly one of ticket_id or visitor_id
  - Validate ticket/visitor belongs to event
  - Create invalid participant
  - Return standard API response format with participant object
- [x] Implement `destroy` action (DELETE /v1/events/:event_id/lucky_draw/invalid_participants/:id)
  - Hard delete invalid participant
  - Return 204 No Content
- [x] Implement `destroy_all` action (DELETE /v1/events/:event_id/lucky_draw/invalid_participants)
  - Hard delete all invalid participants for event
  - Return 204 No Content
- [x] Add strong parameters method
- [x] Add error handling
- [x] Add tests

## Policy Tasks

### 4. Create Pundit Policies

#### Task 4.1: Create `LuckyDrawConfigPolicy`
- [x] Create policy file `app/policies/lucky_draw_config_policy.rb`
- [x] Implement `show?` - event admins and org admins
- [x] Implement `update?` - event admins and org admins
- [x] Add tests (included in request specs)

#### Task 4.2: Create `GiftPolicy`
- [x] Create policy file `app/policies/gift_policy.rb`
- [x] Implement `index?` - event admins, team members, org admins
- [x] Implement `show?` - event admins, team members, org admins
- [x] Implement `create?` - event admins and org admins
- [x] Implement `update?` - event admins and org admins
- [x] Implement `destroy?` - event admins and org admins
- [x] Add tests (included in request specs)

#### Task 4.3: Create `GiftWinnerPolicy`
- [x] Create policy file `app/policies/gift_winner_policy.rb`
- [x] Implement `create?` - event admins, team members, org admins
- [x] Implement `destroy?` - event admins, team members, org admins
- [x] Add tests (included in request specs)

#### Task 4.4: Create `InvalidParticipantPolicy`
- [x] Create policy file `app/policies/invalid_participant_policy.rb`
- [x] Implement `index?` - event admins, team members, org admins
- [x] Implement `create?` - event admins, team members, org admins
- [x] Implement `destroy?` - event admins, team members, org admins
- [x] Add tests (included in request specs)

## Routes Tasks

### 5. Add Routes

#### Task 5.1: Add Lucky Draw Routes
- [x] Open `config/routes.rb`
- [x] Add nested routes under `resources :events`:
  ```ruby
  namespace :lucky_draw do
    resource :config, only: [:show, :update], controller: 'lucky_draw_configs'
    resources :gifts, only: [:index, :show, :create, :update, :destroy] do
      resources :winners, only: [:create, :destroy], controller: 'gift_winners' do
        collection do
          post :bulk
        end
      end
    end
    resources :participants, only: [:index], controller: 'lucky_draw_participants'
    resources :invalid_participants, only: [:index, :create, :destroy] do
      collection do
        delete :destroy_all
      end
    end
  end
  ```
- [x] Verify routes with `rails routes | grep lucky_draw`

## Serializer Tasks

### 6. Create Serializers (if using ActiveModel::Serializer)

#### Task 6.1: Create Serializers
- [ ] Create `LuckyDrawConfigSerializer` (if needed)
- [ ] Create `GiftSerializer` with winners included
- [ ] Create `GiftWinnerSerializer`
- [ ] Create `ParticipantSerializer` (without type field)
- [ ] Create `InvalidParticipantSerializer` with participant object

## Testing Tasks

### 7. Write Tests

#### Task 7.1: Model Tests
- [ ] Test `LuckyDrawConfig` model validations and associations
- [ ] Test `Gift` model validations, associations, and order calculation
- [ ] Test `GiftWinner` model validations and associations
- [ ] Test `InvalidParticipant` model validations and associations
- [ ] Test cascade delete behavior

#### Task 7.2: Controller Tests
- [x] Test all endpoints with RSpec request specs
- [x] Test authorization (Pundit policies)
- [x] Test validation errors
- [x] Test cascade delete scenarios
- [x] Test bulk operations (transactional behavior)
- [x] Test participant filtering logic

#### Task 7.3: Policy Tests
- [x] Test all policy methods (tested via request specs)
- [x] Test authorization for different user roles (tested via request specs)
- [x] Test scope methods if applicable (not applicable)

## Documentation Tasks

### 8. API Documentation

#### Task 8.1: Update Swagger/OpenAPI Docs
- [x] Add lucky draw endpoints to Swagger documentation
- [x] Document request/response schemas
- [x] Document query parameters
- [x] Document authorization requirements

## Implementation Notes

### Key Implementation Details

1. **Response Format**: All endpoints must return standard API response format:
   ```ruby
   {
     success: true,
     message: "Success",
     data: { ... }
   }
   ```

2. **Authorization**: Follow existing patterns:
   - Use `before_action :set_event_and_authorize` for event-level authorization
   - Use Pundit policies for resource-level authorization
   - Event admins and org admins can manage config
   - Event admins, team members, and org admins can assign winners

3. **Cascade Deletes**:
   - When ticket/visitor deleted → cascade delete winners and invalid participants
   - When gift deleted → cascade delete winners
   - When winner deleted → does NOT delete ticket/visitor
   - When invalid participant deleted → does NOT delete ticket/visitor

4. **Default Config**: Create default config (draw_style: 'wheel', use_gifts: false) if not exists on first access

5. **Gift Order**: Calculate as `MAX(order) + 1` or `1` if no gifts exist

6. **Participant Filtering**:
   - Respect event's ticket/visitor system
   - Exclude winners from ANY gift (not just specific gift)
   - Exclude participants with null names
   - Do NOT include type in response

7. **Bulk Operations**: Use transactions for all-or-nothing behavior

8. **Winner Counts**: Managed client-side (frontend input field)

## Testing Checklist

Before marking tasks as complete, verify:

- [x] All migrations run successfully
- [x] All models have proper validations and associations
- [ ] All controllers return standard API response format
- [ ] All endpoints are properly authorized
- [ ] Cascade deletes work correctly
- [ ] Bulk operations are transactional
- [ ] Participant filtering logic is correct
- [ ] All tests pass
- [x] API documentation is updated
