import { db } from './db';
import { NextRequest } from 'next/server';

export interface AuditLogData {
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  adminUserId: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async log(data: AuditLogData): Promise<void> {
    try {
      await db.auditLog.create({
        data: {
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
          newValues: data.newValues ? JSON.stringify(data.newValues) : null,
          adminUserId: data.adminUserId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  static async logWithRequest(
    data: Omit<AuditLogData, 'ipAddress' | 'userAgent'>,
    request: NextRequest
  ): Promise<void> {
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await this.log({
      ...data,
      ipAddress,
      userAgent,
    });
  }

  static async logCreate(
    entityType: string,
    entityId: string,
    newValues: Record<string, any>,
    adminUserId: string,
    request?: NextRequest
  ): Promise<void> {
    const data = {
      action: 'CREATE',
      entityType,
      entityId,
      newValues,
      adminUserId,
    };

    if (request) {
      await this.logWithRequest(data, request);
    } else {
      await this.log(data);
    }
  }

  static async logUpdate(
    entityType: string,
    entityId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    adminUserId: string,
    request?: NextRequest
  ): Promise<void> {
    const data = {
      action: 'UPDATE',
      entityType,
      entityId,
      oldValues,
      newValues,
      adminUserId,
    };

    if (request) {
      await this.logWithRequest(data, request);
    } else {
      await this.log(data);
    }
  }

  static async logDelete(
    entityType: string,
    entityId: string,
    oldValues: Record<string, any>,
    adminUserId: string,
    request?: NextRequest
  ): Promise<void> {
    const data = {
      action: 'DELETE',
      entityType,
      entityId,
      oldValues,
      adminUserId,
    };

    if (request) {
      await this.logWithRequest(data, request);
    } else {
      await this.log(data);
    }
  }

  static async logLogin(
    adminUserId: string,
    request?: NextRequest
  ): Promise<void> {
    const data = {
      action: 'LOGIN',
      entityType: 'AdminUser',
      entityId: adminUserId,
      adminUserId,
    };

    if (request) {
      await this.logWithRequest(data, request);
    } else {
      await this.log(data);
    }
  }

  static async logLogout(
    adminUserId: string,
    request?: NextRequest
  ): Promise<void> {
    const data = {
      action: 'LOGOUT',
      entityType: 'AdminUser',
      entityId: adminUserId,
      adminUserId,
    };

    if (request) {
      await this.logWithRequest(data, request);
    } else {
      await this.log(data);
    }
  }
}

// Helper function to extract changed fields
export function getChangedFields(
  oldValues: Record<string, any>,
  newValues: Record<string, any>
): { oldValues: Record<string, any>; newValues: Record<string, any> } {
  const changedOldValues: Record<string, any> = {};
  const changedNewValues: Record<string, any> = {};

  for (const key in newValues) {
    if (oldValues[key] !== newValues[key]) {
      changedOldValues[key] = oldValues[key];
      changedNewValues[key] = newValues[key];
    }
  }

  return {
    oldValues: changedOldValues,
    newValues: changedNewValues,
  };
}
