# Multi-Guard Attendance System - Implementation Complete

## Overview
Updated both NestJS backend and Expo React Native frontend to support multi-guard attendance marking with role-based access control and comprehensive audit trails.

---

## Backend Changes

### 1. DTOs - `create-attendance.dto.ts`
**New Features:**
- `SingleAttendanceDto` - For marking a single guard
- `BatchAttendanceDto` - For marking multiple guards at once
- `CreateAttendanceDto` - Combined DTO supporting both modes

**Validation:**
- `@IsUUID()` for guard IDs
- `@IsArray()` with UUID validation for batch operations
- `@IsOptional()` decorators for optional fields
- Class-validator integration for payload validation

### 2. Service - `attendance.service.ts`
**Key Updates:**

#### `markAttendance(dto: CreateAttendanceDto, authenticatedUser: User)`
- **Extract markedById** from authenticated user (not client input)
- **Verify markedBy user**:
  - Must exist in database
  - Must be active (`isActive == true`)
  - Must have allowed role
- **Resolve target IDs**:
  - Support both single `userId` and batch `userIds`
  - Security guard can only mark for themselves
  - Supervisors/Coordinators can mark multiple guards
- **Batch upsert**:
  - Use `prisma.$transaction()` for atomic operations
  - Support both create and update
  - Properly match dates with `@db.Date` format
  - Calculate `checkInTime` using `buildCheckInTime()`
- **Return populated records** with user, post, and markedBy relations

**Allowed Roles:**
- `SECURITY_GUARD` - Self check-in only
- `SECURITY_SUPERVISOR` - Can mark multiple
- `COORDINATOR` - Can mark multiple
- `SECURITY_IN_CHARGE` - Can mark multiple

### 3. Controller - `attendance.controller.ts`
**Updates:**
- Added `@Roles(...)` decorator including `SECURITY_IN_CHARGE`
- Extract `markedById` from `req.user.id` (authenticated user)
- Pass `req.user` to service method
- Return response object with:
  ```json
  {
    "success": true,
    "message": "Attendance marked for X guard(s)",
    "data": [...]
  }
  ```
- Added comprehensive logging for debugging
- Improved error handling and messages

---

## Frontend Changes

### 1. Context - `AttendanceContext.tsx`
**Updates:**
- Support both `userId` (single) and `userIds` (batch) in checkIn payload
- Return structured response with:
  ```typescript
  {
    success: boolean;
    message: string;
    guardCount?: number;
  }
  ```
- Enhanced error handling with 401 detection
- Pass token explicitly for auth requests
- Log all API interactions

### 2. Types - `types/index.ts`
**Added Fields to AttendanceRecord:**
- `guardName?: string` - Name of the guard
- `guardId?: string` - ID of the guard
- `markedBy?: string` - Name of person who marked attendance
- Updated `AttendanceStatus` enum to match backend: `PRESENT | LATE | ABSENT | LEAVE`

### 3. CheckInScreen - `screens/CheckInScreen.tsx`
**New Features:**

#### Role-Based UI:
- **Security Guard**: Single check-in UI (pre-selected as self)
- **Supervisor/Coordinator**: Multi-select UI with guard list

#### Multi-Guard Selection:
- Checkbox-based guard selection
- Display selected guard count
- Prevent single guards from marking others
- Provide clear UI feedback

#### Attendance Status Selection:
- Radio buttons for `PRESENT | LATE | ABSENT | LEAVE`
- Default to `PRESENT`

#### Enhanced Payload:
```typescript
{
  userIds: selectedGuardIds,
  postId: selectedPostId,
  date: "YYYY-MM-DD",
  time: "HH:MM AM/PM",
  status: "PRESENT",
  shiftHours: 8,
  captureLatitude: number,
  captureLongitude: number
}
```

#### Success Feedback:
- Alert showing count of guards marked
- Display GPS coordinates and timestamp
- Reset selection after success

### 4. HistoryScreen - `screens/HistoryScreen.tsx`
**Enhancements:**
- Display guard name for each record
- Show who marked the attendance
- Status badges with color coding:
  - Green: PRESENT ✓
  - Orange: LATE ⏱
  - Red: ABSENT ✗
  - Blue: LEAVE 📋
- Pull-to-refresh functionality
- Better visual formatting

### 5. AttendanceDetailsScreen (NEW)
**New Component for detailed view:**
- Card-based layout for each attendance record
- Display date, check-in time, and status
- Show guard details and who marked attendance
- Location coordinates (if captured)
- Refresh control for data updates

---

## Database Model Constraints
The system respects Prisma schema constraints:
- **Unique Constraint**: `@@unique([userId, date])` - One record per guard per date
- Upsert logic handles multiple check-ins same day (updates existing)
- Date field uses `@db.Date` for proper date matching
- Relations fully populated with user and post details

---

## Business Rules Implemented

### Who Can Mark Attendance?
1. **SECURITY_GUARD** - Only themselves, one guard per request
2. **SECURITY_SUPERVISOR** - Multiple guards assigned to their post
3. **COORDINATOR** - Multiple guards across posts
4. **SECURITY_IN_CHARGE** - All guards in system

### Single vs Batch Marking
- **Single Mode**: `{ userId: "uuid" }`
- **Batch Mode**: `{ userIds: ["uuid1", "uuid2", ...] }`
- Both modes create/update records in single transaction

### Audit Trail
- Every attendance record tracks:
  - Guard ID (`userId`)
  - Timestamp (`checkInTime`, `createdAt`, `updatedAt`)
  - Who marked it (`markedById`, `markedBy` relation)
  - Location (`captureLatitude`, `captureLongitude`, `captureAddress`)
  - Status (`PRESENT | LATE | ABSENT | LEAVE`)

---

## Testing Checklist

### Backend
- [ ] Build succeeds: `npm run build`
- [ ] Test single guard check-in via Postman/curl
- [ ] Test batch guard check-in with array
- [ ] Verify security guard cannot mark others
- [ ] Verify inactive guards are rejected
- [ ] Test upsert (second check-in updates record)
- [ ] Verify 401 for unauthorized roles
- [ ] Check logs for proper markedById tracking

### Frontend
- [ ] Security guard sees single check-in UI
- [ ] Supervisor sees multi-select UI
- [ ] Can select/deselect guards
- [ ] Location captured correctly
- [ ] Status selection works
- [ ] Success alert shows guard count
- [ ] History displays guard names
- [ ] Refresh updates latest records

---

## API Endpoints

### Mark Attendance (Single or Batch)
```
POST /attendance
Authorization: Bearer <token>

Body (Single):
{
  "userId": "uuid",
  "postId": "uuid",
  "date": "2026-08-25",
  "time": "08:30 AM",
  "status": "PRESENT",
  "shiftHours": 8,
  "captureLatitude": 40.7128,
  "captureLongitude": -74.0060
}

Body (Batch):
{
  "userIds": ["uuid1", "uuid2"],
  "postId": "uuid",
  "date": "2026-08-25",
  "time": "08:30 AM",
  "status": "PRESENT",
  "shiftHours": 8,
  "captureLatitude": 40.7128,
  "captureLongitude": -74.0060
}

Response:
{
  "success": true,
  "message": "Attendance marked for 2 guard(s)",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "date": "2026-08-25",
      "checkInTime": "2026-08-25T08:30:00.000Z",
      "status": "PRESENT",
      "user": { "id": "uuid", "name": "Guard Name" },
      "markedBy": { "id": "uuid", "name": "Supervisor Name" }
    }
  ]
}
```

### Get Attendance History
```
GET /attendance/user/:userId?filter=month
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "userId": "uuid",
    "date": "2026-08-25",
    "checkInTime": "2026-08-25T08:30:00.000Z",
    "status": "PRESENT",
    "user": { ... },
    "markedBy": { ... }
  }
]
```

---

## Environment Variables
Ensure `.env` contains:
```
JWT_SECRET=your-secret-key-here (no quotes!)
DATABASE_URL=postgresql://user:pass@localhost:5433/attendance
NODE_ENV=development
PORT=5000
```

---

## File Modifications Summary

### Backend
- ✅ `src/modules/attendance/dto/create-attendance.dto.ts` - New DTOs
- ✅ `src/modules/attendance/attendance.service.ts` - Multi-guard logic
- ✅ `src/modules/attendance/attendance.controller.ts` - Auth & roles

### Frontend
- ✅ `src/context/AttendanceContext.tsx` - Multi-guard support
- ✅ `src/types/index.ts` - Updated types
- ✅ `src/screens/CheckInScreen.tsx` - Multi-select UI
- ✅ `src/screens/HistoryScreen.tsx` - Enhanced display
- ✅ `src/screens/AttendanceDetailsScreen.tsx` - New details view

---

## Next Steps
1. Restart backend: `npm run start:dev`
2. Test via Postman or frontend
3. Verify multi-guard batch operations
4. Monitor logs for proper audit trail
5. Test role-based access control
