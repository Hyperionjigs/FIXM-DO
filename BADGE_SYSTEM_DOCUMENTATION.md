# FixMo Badge System Documentation

## Overview

The FixMo Badge System is a comprehensive gamification feature that rewards users for their activity, performance, and contributions on the platform. The system consists of 16 badges organized into 4 progressive levels, with real-time tracking, automatic unlocks, and detailed analytics.

## Architecture

### Core Components

1. **Badge System Logic** (`src/lib/badge-system.ts`)
   - Defines all badges and their requirements
   - Calculates user stats and badge progress
   - Manages badge unlocking logic

2. **Database Service** (`src/lib/badge-service.ts`)
   - Handles badge data persistence
   - Manages real-time updates
   - Provides analytics and leaderboard functionality

3. **Webhook System** (`src/lib/badge-webhooks.ts`)
   - Automatically checks for badge unlocks
   - Triggers notifications when badges are earned
   - Integrates with existing user actions

4. **API Routes** (`src/app/api/badges/`)
   - User stats calculation
   - Badge progress tracking
   - Leaderboard and analytics
   - Webhook event processing

5. **React Hooks** (`src/hooks/use-badges.tsx`)
   - Manages badge state in components
   - Provides real-time updates
   - Handles API communication

## Badge Levels

### 1. Starter Level (5 badges)
- **Newbie**: Complete profile verification
- **Task Scout**: Post or accept first task
- **Fresh Hand**: Complete first task
- **Apprentice**: Complete 5 tasks with 4+ star rating
- **Onboarder**: Complete both profile and photo verification

### 2. Mid Level (5 badges)
- **Skilled Helper**: Complete 15 tasks with 4.5+ star rating
- **Reliable Fixer**: Complete 30 tasks with 4.5+ star rating
- **Certified Doer**: Complete 50 tasks with 4.5+ star rating and 10+ reviews
- **Task Pro**: Complete 75 tasks with 4.7+ star rating and 95%+ response rate
- **Problem Solver**: Complete 100 tasks with 4.8+ star rating and 25+ reviews

### 3. Advanced Level (5 badges)
- **Elite Tasker**: Complete 250 tasks with 4.9+ star rating and 98%+ response rate
- **Master Hand**: Complete 500 tasks with 4.9+ star rating and 99%+ response rate
- **Veteran Pro**: Complete 750 tasks with 4.9+ star rating and 100% response/completion rates
- **Task Commander**: Complete 1,000 tasks and mentor 5+ users
- **Trusted Force**: Complete 1,500 tasks with 5.0 star rating and perfect rates

### 4. Prestigious Level (1 badge)
- **Hero Level**: Complete 2,500 tasks with 5.0 star rating and staff recognition

## Database Schema

### Collections

#### `user_badges`
```typescript
{
  userId: string;
  unlockedBadges: string[]; // Array of badge IDs
  lastUpdated: Timestamp;
  totalBadgesUnlocked: number;
  currentLevel: string;
  levelProgress: number;
}
```

#### `badge_events`
```typescript
{
  id: string;
  userId: string;
  badgeId: string;
  badgeName: string;
  unlockedAt: Timestamp;
  userStats: UserStats;
  metadata?: Record<string, any>;
}
```

## API Endpoints

### User Stats
- `GET /api/badges/user-stats?userId={userId}`
  - Calculates and returns user statistics for badge evaluation

### User Badges
- `GET /api/badges/user-badges?userId={userId}`
  - Returns user's badge progress and unlocked badges

### Badge Unlocks
- `POST /api/badges/check-unlocks`
  - Checks for newly unlocked badges based on updated stats

### Leaderboard
- `GET /api/badges/leaderboard?limit={number}`
  - Returns top badge earners

### Statistics
- `GET /api/badges/statistics`
  - Returns system-wide badge statistics

### Events
- `GET /api/badges/events?userId={userId}&limit={number}`
  - Returns badge unlock events for a user

### Webhooks
- `POST /api/badges/webhook`
  - Processes badge-related webhook events

## Integration Points

### Task Completion
When a task is completed, the system automatically:
1. Updates user stats
2. Checks for new badge unlocks
3. Triggers notifications
4. Records unlock events

### Review Submission
When a review is submitted, the system:
1. Updates the reviewed user's stats
2. Checks for badge unlocks based on new rating/review data
3. Triggers appropriate notifications

### Verification Completion
When verification is completed:
1. Updates user verification status
2. Checks for verification-related badge unlocks
3. Triggers notifications

## Usage Examples

### Using the Badge Hook
```typescript
import { useBadges } from '@/hooks/use-badges';

function MyComponent() {
  const { 
    userStats, 
    unlockedBadges, 
    nextBadge, 
    badgeProgress, 
    levelProgress,
    loading,
    error,
    refreshBadges,
    checkForNewUnlocks 
  } = useBadges();

  // Check for new unlocks after user action
  const handleTaskCompletion = async () => {
    const newBadges = await checkForNewUnlocks();
    if (newBadges.length > 0) {
      // Show notification for new badges
    }
  };

  return (
    <div>
      {loading ? (
        <div>Loading badges...</div>
      ) : (
        <div>
          <p>Level: {levelProgress.level}</p>
          <p>Progress: {levelProgress.progress}%</p>
          <p>Badges Unlocked: {badgeProgress.unlocked}/{badgeProgress.total}</p>
        </div>
      )}
    </div>
  );
}
```

### Displaying Badges
```typescript
import { BadgeDisplay } from '@/components/badge-display';

function ProfilePage() {
  const { userStats } = useBadges();

  return (
    <div>
      <BadgeDisplay userStats={userStats} compact={true} />
    </div>
  );
}
```

### Badge Notifications
```typescript
import { BadgeNotification } from '@/components/badge-notification';

function App() {
  const [newBadge, setNewBadge] = useState(null);

  return (
    <div>
      {/* Your app content */}
      
      {newBadge && (
        <BadgeNotification
          badge={newBadge}
          isOpen={true}
          onClose={() => setNewBadge(null)}
          onClaim={() => {
            // Handle badge claim
            setNewBadge(null);
          }}
        />
      )}
    </div>
  );
}
```

## Admin Features

### Badge Management Dashboard
- View system-wide badge statistics
- Monitor user progress and leaderboards
- Track badge unlock events
- Analyze user engagement patterns

### Access
Navigate to `/admin/badge-management` to access the admin dashboard.

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Firestore Rules
The badge system requires the following Firestore rules:
```javascript
// Badge system collections
match /user_badges/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if request.auth != null && request.auth.uid == userId;
}

match /badge_events/{eventId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.userId;
  allow write: if request.auth != null && request.auth.uid == resource.data.userId;
}
```

## Performance Considerations

### Caching
- User stats are calculated on-demand and cached
- Badge progress is stored in Firestore for quick access
- Real-time updates use Firestore subscriptions

### Optimization
- Batch badge unlock checks to reduce API calls
- Use pagination for leaderboards and event lists
- Implement debouncing for frequent stat updates

## Security

### Data Validation
- All user inputs are validated server-side
- Badge requirements are enforced through the BadgeSystem class
- Webhook events are authenticated and validated

### Access Control
- Users can only access their own badge data
- Admin features require appropriate permissions
- Badge unlocks are verified against actual user stats

## Monitoring and Analytics

### Metrics Tracked
- Badge unlock rates
- User progression through levels
- Most popular badges
- User engagement patterns
- System performance metrics

### Logging
- Badge unlock events are logged for audit trails
- Webhook processing errors are logged
- Performance metrics are tracked

## Future Enhancements

### Planned Features
1. **Seasonal Badges**: Time-limited badges for special events
2. **Custom Badges**: Admin-created badges for specific achievements
3. **Badge Trading**: Allow users to trade or gift badges
4. **Badge Challenges**: Time-limited challenges for bonus badges
5. **Social Features**: Badge sharing and social media integration

### Technical Improvements
1. **Machine Learning**: Predictive badge recommendations
2. **Advanced Analytics**: Detailed user behavior analysis
3. **Performance Optimization**: Enhanced caching and query optimization
4. **Mobile Optimization**: Improved mobile badge display

## Troubleshooting

### Common Issues

1. **Badges not unlocking**
   - Check user stats calculation
   - Verify webhook integration
   - Review Firestore rules

2. **Performance issues**
   - Monitor API response times
   - Check Firestore query optimization
   - Review caching implementation

3. **Real-time updates not working**
   - Verify Firestore subscriptions
   - Check authentication status
   - Review webhook processing

### Debug Tools
- Use the badge management dashboard for system monitoring
- Check browser console for client-side errors
- Review server logs for API errors
- Use Firestore console for data inspection

## Support

For technical support or questions about the badge system:
1. Check this documentation
2. Review the code comments
3. Test with the demo scenarios in `/badges`
4. Contact the development team

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready 