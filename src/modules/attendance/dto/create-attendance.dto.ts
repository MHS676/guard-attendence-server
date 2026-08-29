import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, IsArray } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

/**
 * Single guard attendance DTO
 */
export class SingleAttendanceDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string; // Single guard ID

  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  date: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  time: string; // e.g. "08:30 AM"

  @IsNumber()
  @IsOptional()
  shiftHours?: number;

  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @IsNumber()
  @IsOptional()
  captureLatitude?: number;

  @IsNumber()
  @IsOptional()
  captureLongitude?: number;

  @IsString()
  @IsOptional()
  captureAddress?: string;
}

/**
 * Batch attendance DTO - allows marking for multiple guards at once
 */
export class BatchAttendanceDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  userIds: string[]; // Array of guard IDs

  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  date: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  time: string; // e.g. "08:30 AM"

  @IsNumber()
  @IsOptional()
  shiftHours?: number;

  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @IsNumber()
  @IsOptional()
  captureLatitude?: number;

  @IsNumber()
  @IsOptional()
  captureLongitude?: number;

  @IsString()
  @IsOptional()
  captureAddress?: string;
}

/**
 * Combined DTO supporting both single and batch attendance marking
 */
export class CreateAttendanceDto {
  @IsUUID()
  @IsOptional()
  userId?: string; // Single guard ID

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  userIds?: string[]; // Multiple guard IDs

  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  date: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  time: string; // e.g. "08:30 AM"

  @IsNumber()
  @IsOptional()
  shiftHours?: number;

  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @IsNumber()
  @IsOptional()
  captureLatitude?: number;

  @IsNumber()
  @IsOptional()
  captureLongitude?: number;

  @IsString()
  @IsOptional()
  captureAddress?: string;
}