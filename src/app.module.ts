import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { MapModule } from './modules/map/map.module';
import { AuthModule } from './modules/auth/auth.module'; // <-- 1. Import AuthModule

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    UsersModule,
    PostsModule,
    AttendanceModule,
    MapModule,
    AuthModule, // <-- 2. Register AuthModule here
  ],
})
export class AppModule {}