import { v4 as uuidv4 } from 'uuid';
import { dynamoDBService, DYNAMODB_TABLES } from './dynamodb';
import { Family, FamilyMember, CreateFamilyRequest, UpdateFamilyRequest } from '../types';
import logger from '../utils/logger';

export class FamilyService {
  async createFamily(userId: string, familyData: CreateFamilyRequest): Promise<Family> {
    try {
      const familyId = uuidv4();
      const now = new Date().toISOString();
      
      const members: FamilyMember[] = familyData.members.map(member => ({
        id: uuidv4(),
        ...member
      }));

      const family: Family = {
        id: familyId,
        userId,
        name: familyData.name,
        description: familyData.description || '',
        members,
        createdAt: now,
        updatedAt: now
      };

      await dynamoDBService.putItem(DYNAMODB_TABLES.FAMILIES, family);
      return family;
    } catch (error) {
      logger.error('Create family error:', error);
      throw error;
    }
  }

  async getFamilyById(familyId: string, userId: string): Promise<Family | null> {
    try {
      const family = await dynamoDBService.getItem(DYNAMODB_TABLES.FAMILIES, { id: familyId });
      
      if (!family || family.userId !== userId) {
        return null;
      }
      
      return family;
    } catch (error) {
      logger.error('Get family by ID error:', error);
      throw error;
    }
  }

  async getFamiliesByUserId(userId: string): Promise<Family[]> {
    try {
      const families = await dynamoDBService.query(
        DYNAMODB_TABLES.FAMILIES,
        'userId = :userId',
        { ':userId': userId },
        'userId-index'  // 使用 GSI 索引
      );
      return families;
    } catch (error) {
      logger.error('Get families by user ID error:', error);
      throw error;
    }
  }

  async updateFamily(familyId: string, userId: string, updates: UpdateFamilyRequest): Promise<Family> {
    try {
      // 首先验证family是否属于该用户
      const existingFamily = await this.getFamilyById(familyId, userId);
      if (!existingFamily) {
        throw new Error('Family not found or access denied');
      }

      let updateExpression = 'SET updatedAt = :updatedAt';
      const expressionAttributeValues: Record<string, any> = {
        ':updatedAt': new Date().toISOString()
      };

      // 动态构建更新表达式
      const updateFields = Object.keys(updates).filter(key => key !== 'id' && key !== 'userId' && key !== 'createdAt');
      
      updateFields.forEach(field => {
        const value = updates[field as keyof UpdateFamilyRequest];
        if (value !== undefined) {
          if (field === 'members') {
            // 为members生成新的ID
            const membersWithIds = (value as Omit<FamilyMember, 'id'>[]).map(member => ({
              id: uuidv4(),
              ...member
            }));
            updateExpression += `, ${field} = :${field}`;
            expressionAttributeValues[`:${field}`] = membersWithIds;
          } else {
            updateExpression += `, ${field} = :${field}`;
            expressionAttributeValues[`:${field}`] = value;
          }
        }
      });

      await dynamoDBService.updateItem(
        DYNAMODB_TABLES.FAMILIES,
        { id: familyId },
        updateExpression,
        expressionAttributeValues
      );

      const updatedFamily = await this.getFamilyById(familyId, userId);
      if (!updatedFamily) {
        throw new Error('Family not found after update');
      }

      return updatedFamily;
    } catch (error) {
      logger.error('Update family error:', error);
      throw error;
    }
  }

  async deleteFamily(familyId: string, userId: string): Promise<void> {
    try {
      // 首先验证family是否属于该用户
      const family = await this.getFamilyById(familyId, userId);
      if (!family) {
        throw new Error('Family not found or access denied');
      }

      await dynamoDBService.deleteItem(DYNAMODB_TABLES.FAMILIES, { id: familyId });
    } catch (error) {
      logger.error('Delete family error:', error);
      throw error;
    }
  }

  async addFamilyMember(familyId: string, userId: string, member: Omit<FamilyMember, 'id'>): Promise<Family> {
    try {
      const family = await this.getFamilyById(familyId, userId);
      if (!family) {
        throw new Error('Family not found or access denied');
      }

      const newMember: FamilyMember = {
        id: uuidv4(),
        ...member
      };

      const updatedMembers = [...family.members, newMember];

      await dynamoDBService.updateItem(
        DYNAMODB_TABLES.FAMILIES,
        { id: familyId },
        'SET members = :members, updatedAt = :updatedAt',
        {
          ':members': updatedMembers,
          ':updatedAt': new Date().toISOString()
        }
      );

      const updatedFamily = await this.getFamilyById(familyId, userId);
      if (!updatedFamily) {
        throw new Error('Family not found after adding member');
      }

      return updatedFamily;
    } catch (error) {
      logger.error('Add family member error:', error);
      throw error;
    }
  }

  async removeFamilyMember(familyId: string, userId: string, memberId: string): Promise<Family> {
    try {
      const family = await this.getFamilyById(familyId, userId);
      if (!family) {
        throw new Error('Family not found or access denied');
      }

      const updatedMembers = family.members.filter(member => member.id !== memberId);

      await dynamoDBService.updateItem(
        DYNAMODB_TABLES.FAMILIES,
        { id: familyId },
        'SET members = :members, updatedAt = :updatedAt',
        {
          ':members': updatedMembers,
          ':updatedAt': new Date().toISOString()
        }
      );

      const updatedFamily = await this.getFamilyById(familyId, userId);
      if (!updatedFamily) {
        throw new Error('Family not found after removing member');
      }

      return updatedFamily;
    } catch (error) {
      logger.error('Remove family member error:', error);
      throw error;
    }
  }
}

export const familyService = new FamilyService();
