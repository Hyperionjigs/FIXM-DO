# Message Notification System

## Overview
This document describes the implementation of the message notification system for FixMo, which notifies post owners when they receive new messages in their post's message board.

## Features

### 1. Automatic Notifications
- When a user sends a message in a post's message board, the post owner receives a notification
- Notifications are only sent if the sender is not the post owner (to avoid self-notifications)
- Each notification includes:
  - Sender's name
  - Post title
  - Preview of the message content (first 100 characters)
  - Post ID for navigation

### 2. Notification Display
- Message notifications appear in the notification bell with a 💬 icon
- Notifications show a preview of the actual message content
- Clicking on a message notification navigates to the post and automatically opens the message board

### 3. Navigation Integration
- Clicking a message notification navigates to `/post/{postId}?openMessageBoard=true`
- The post detail page automatically opens the message board when this URL parameter is present
- URL parameter is cleaned up after the message board opens

## Technical Implementation

### 1. Notification Types
Added new notification type `'new_message'` to the Notification interface:
```typescript
type: 'task_accepted' | 'task_completed' | 'new_review' | 'task_reminder' | 'system' | 'new_message';
```

### 2. Notification Service
Added `notifyNewMessage()` method to NotificationService:
```typescript
static async notifyNewMessage(
  postOwnerId: string,
  postId: string,
  postTitle: string,
  senderName: string,
  messageText: string
): Promise<void>
```

### 3. Message Board Integration
Updated `MessageBoardModal` component to:
- Import NotificationService
- Send notifications when messages are sent (if sender is not post owner)
- Include message preview in notification data

### 4. Notification Bell Enhancement
Updated `NotificationBell` component to:
- Handle `new_message` notification type with 💬 icon
- Display message preview in notification text
- Navigate to post with message board auto-open parameter

### 5. Post Detail Page Enhancement
Updated post detail page to:
- Import `useSearchParams` for URL parameter handling
- Auto-open message board when `openMessageBoard=true` parameter is present
- Clean up URL parameter after opening message board

### 6. Firestore Rules
Added rules for message board collection:
```javascript
match /messageBoards/{postId}/messages/{messageId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}
```

## User Flow

1. **User sends message**: User clicks "Message [Owner Name]" button on a post
2. **Message board opens**: Message board modal opens for the user to type and send message
3. **Message sent**: When user sends message, it's saved to Firestore
4. **Notification created**: If sender is not post owner, notification is created for post owner
5. **Owner receives notification**: Post owner sees notification in notification bell
6. **Owner clicks notification**: Owner clicks notification to view the message
7. **Auto-navigation**: System navigates to post page and automatically opens message board
8. **Message board opens**: Owner can see and respond to the message

## Data Structure

### Notification Data for Messages
```typescript
{
  userId: string,           // Post owner's user ID
  type: 'new_message',
  title: 'New Message Received',
  message: string,          // "SenderName sent you a message about your post: PostTitle"
  data: {
    postId: string,         // Post ID for navigation
    postTitle: string,      // Post title
    senderName: string,     // Name of message sender
    messageText: string     // Preview of message content (truncated to 100 chars)
  },
  isRead: boolean,
  createdAt: Timestamp
}
```

## Testing

To test the message notification system:

1. Create a post with one user account
2. Switch to another user account
3. Navigate to the post and click "Message [Owner Name]"
4. Send a message in the message board
5. Switch back to the post owner account
6. Check the notification bell for the new message notification
7. Click the notification to verify it opens the message board

## Future Enhancements

Potential improvements for the message notification system:

1. **Real-time notifications**: Use Firebase Cloud Messaging for push notifications
2. **Email notifications**: Send email notifications for important messages
3. **Message threading**: Support for threaded conversations
4. **Message status**: Read/unread status for individual messages
5. **Message search**: Search functionality within message boards
6. **File attachments**: Support for sending images or documents in messages 