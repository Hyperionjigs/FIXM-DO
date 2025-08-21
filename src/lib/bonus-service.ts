import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  runTransaction, 
  Firestore,
  Timestamp 
} from 'firebase/firestore';
import type { PotMoney, Bonus, PaymentBreakdown } from '@/types';
import { getPHPSymbol } from './currency-utils';

export class BonusService {
  private static readonly POT_MONEY_COLLECTION = 'potMoney';
  private static readonly BONUSES_COLLECTION = 'bonuses';
  private static readonly PAYMENT_BREAKDOWNS_COLLECTION = 'paymentBreakdowns';

  /**
   * Get current pot money status
   */
  static async getPotMoney(): Promise<PotMoney | null> {
    try {
      if (!db) {
        console.log('Firebase not available - returning demo pot money');
        // Return demo pot money for testing
        return {
          id: 'demo-pot-money',
          totalAmount: 5000,
          currency: 'PHP',
          lastUpdated: Timestamp.now(),
          isActive: true,
          distributionRate: 5,
          minTaskAmount: 100,
          maxBonusAmount: 500,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
      }

      // Try the complex query first
      try {
        const potMoneyQuery = query(
          collection(db as Firestore, this.POT_MONEY_COLLECTION),
          where('isActive', '==', true),
          orderBy('lastUpdated', 'desc'),
          limit(1)
        );
        
        const snapshot = await getDocs(potMoneyQuery);
        if (snapshot.empty) {
          return null;
        }
        
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as PotMoney;
      } catch (indexError: any) {
        // If index error, try a simpler query
        if (indexError.code === 'failed-precondition' && indexError.message.includes('index')) {
          console.warn('Index not ready, using fallback query:', indexError.message);
          
          // Fallback: get all active pot money and sort in memory
          const simpleQuery = query(
            collection(db as Firestore, this.POT_MONEY_COLLECTION),
            where('isActive', '==', true)
          );
          
          const snapshot = await getDocs(simpleQuery);
          if (snapshot.empty) {
            return null;
          }
          
          // Sort by lastUpdated in memory
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PotMoney));
          docs.sort((a, b) => b.lastUpdated.toMillis() - a.lastUpdated.toMillis());
          
          return docs[0];
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error fetching pot money:', error);
      return null;
    }
  }

  /**
   * Add donation to pot money
   */
  static async addDonation(amount: number, currency: string = 'PHP'): Promise<boolean> {
    try {
      if (!db) {
        console.log('Firebase not available - donation simulated');
        return true; // Simulate success in demo mode
      }

      const potMoney = await this.getPotMoney();
      const now = Timestamp.now();
      
      if (potMoney) {
        // Update existing pot money
        await updateDoc(doc(db, this.POT_MONEY_COLLECTION, potMoney.id!), {
          totalAmount: potMoney.totalAmount + amount,
          lastUpdated: now,
          updatedAt: now
        });
      } else {
        // Create new pot money entry
        const newPotMoney: Omit<PotMoney, 'id'> = {
          totalAmount: amount,
          currency,
          lastUpdated: now,
          isActive: true,
          distributionRate: 5, // 5% of pot money per task
          minTaskAmount: 100, // Minimum ${getPHPSymbol()}100 task to be eligible
          maxBonusAmount: 500, // Maximum ${getPHPSymbol()}500 bonus per task
          createdAt: now,
          updatedAt: now
        };
        
        await addDoc(collection(db as Firestore, this.POT_MONEY_COLLECTION), newPotMoney);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding donation:', error);
      return false;
    }
  }

  /**
   * Calculate bonus for a completed task
   */
  static async calculateBonus(
    taskId: string,
    taskerId: string,
    taskerName: string,
    clientId: string,
    clientName: string,
    baseTaskAmount: number,
    tipAmount: number = 0
  ): Promise<Bonus | null> {
    try {
      if (!db) {
        console.log('Firebase not available - returning demo bonus');
        // Return demo bonus for testing
        const bonusAmount = Math.min(baseTaskAmount * 0.05, 500); // 5% of task amount, max ${getPHPSymbol()}500
        return {
          id: `demo-bonus-${taskId}`,
          taskId,
          taskerId,
          taskerName,
          clientId,
          clientName,
          baseTaskAmount,
          tipAmount,
          bonusAmount,
          totalAmount: baseTaskAmount + tipAmount + bonusAmount,
          finalAmount: baseTaskAmount + tipAmount + bonusAmount,
          potMoneyAvailable: 5000, // Demo pot money
          bonusPercentage: 0.05, // Demo percentage
          isRandomlyTriggered: true,
          description: `Bonus for completing task: Demo Task`,
          metadata: {
            taskTitle: 'Demo Task',
            potMoneyId: 'demo-pot-money',
            calculationMethod: 'random_percentage'
          },
          status: 'pending',
          createdAt: Timestamp.now()
        };
      }

      const potMoney = await this.getPotMoney();
      
      // Check if bonus system is active and task meets minimum requirements
      if (!potMoney || !potMoney.isActive || baseTaskAmount < potMoney.minTaskAmount) {
        return null;
      }

      // Random chance to trigger bonus (30% chance)
      const shouldTriggerBonus = Math.random() < 0.3;
      
      if (!shouldTriggerBonus) {
        return null;
      }

      // Calculate random bonus percentage (1% to 10% of pot money)
      const bonusPercentage = Math.random() * 0.09 + 0.01; // 1% to 10%
      
      // Calculate bonus amount
      let bonusAmount = potMoney.totalAmount * bonusPercentage;
      
      // Cap bonus at maximum amount
      bonusAmount = Math.min(bonusAmount, potMoney.maxBonusAmount);
      
      // Ensure bonus doesn't exceed available pot money
      bonusAmount = Math.min(bonusAmount, potMoney.totalAmount);
      
      if (bonusAmount <= 0) {
        return null;
      }

      const now = Timestamp.now();
      
      const bonus: Omit<Bonus, 'id'> = {
        taskId,
        taskerId,
        taskerName,
        clientId,
        clientName,
        baseTaskAmount,
        bonusAmount,
        totalAmount: baseTaskAmount + bonusAmount,
        tipAmount,
        finalAmount: baseTaskAmount + bonusAmount + tipAmount,
        potMoneyAvailable: potMoney.totalAmount,
        bonusPercentage,
        isRandomlyTriggered: true,
        status: 'pending',
                  description: `Random bonus of ${getPHPSymbol()}${bonusAmount.toFixed(2)} (${(bonusPercentage * 100).toFixed(1)}% of pot money)`,
        metadata: {
          taskTitle: `Task ${taskId}`,
          potMoneyId: potMoney.id!,
          calculationMethod: 'random_percentage'
        },
        createdAt: now
      };

      return bonus;
    } catch (error) {
      console.error('Error calculating bonus:', error);
      return null;
    }
  }

  /**
   * Process bonus and create payment breakdown
   */
  static async processBonus(bonus: Bonus): Promise<PaymentBreakdown | null> {
    try {
      return await runTransaction(db as Firestore, async (transaction) => {
        // Update pot money (deduct bonus amount)
        const potMoney = await this.getPotMoney();
        if (!potMoney) {
          throw new Error('Pot money not found');
        }

        const newPotMoneyAmount = potMoney.totalAmount - bonus.bonusAmount;
        
        transaction.update(doc(db as Firestore, this.POT_MONEY_COLLECTION, potMoney.id!), {
          totalAmount: newPotMoneyAmount,
          lastUpdated: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        // Save bonus record
        const bonusRef = doc(collection(db as Firestore, this.BONUSES_COLLECTION));
        transaction.set(bonusRef, {
          ...bonus,
          id: bonusRef.id,
          status: 'processed',
          processedAt: Timestamp.now()
        });

        // Create payment breakdown
        const paymentBreakdown: Omit<PaymentBreakdown, 'id'> = {
          taskId: bonus.taskId,
          taskerId: bonus.taskerId,
          taskerName: bonus.taskerName,
          clientId: bonus.clientId,
          clientName: bonus.clientName,
          basePayment: bonus.baseTaskAmount,
          tipAmount: bonus.tipAmount || 0,
          bonusAmount: bonus.bonusAmount,
          totalAmount: bonus.finalAmount,
          currency: 'PHP',
          breakdown: {
            basePayment: {
              amount: bonus.baseTaskAmount,
              description: 'Task payment'
            },
            bonus: {
              amount: bonus.bonusAmount,
              description: `Random bonus (${(bonus.bonusPercentage * 100).toFixed(1)}% of pot money)`,
              isRandom: true
            },
            tip: {
              amount: bonus.tipAmount || 0,
              description: 'Client tip'
            }
          },
          status: 'completed',
          createdAt: Timestamp.now(),
          completedAt: Timestamp.now()
        };

        const breakdownRef = doc(collection(db as Firestore, this.PAYMENT_BREAKDOWNS_COLLECTION));
        transaction.set(breakdownRef, {
          ...paymentBreakdown,
          id: breakdownRef.id
        });

        return { id: breakdownRef.id, ...paymentBreakdown };
      });
    } catch (error) {
      console.error('Error processing bonus:', error);
      return null;
    }
  }

  /**
   * Get payment breakdown for a task
   */
  static async getPaymentBreakdown(taskId: string): Promise<PaymentBreakdown | null> {
    try {
      const breakdownQuery = query(
        collection(db as Firestore, this.PAYMENT_BREAKDOWNS_COLLECTION),
        where('taskId', '==', taskId),
        limit(1)
      );
      
      const snapshot = await getDocs(breakdownQuery);
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as unknown as PaymentBreakdown;
    } catch (error) {
      console.error('Error fetching payment breakdown:', error);
      return null;
    }
  }

  /**
   * Get all bonuses for a tasker
   */
  static async getTaskerBonuses(taskerId: string): Promise<Bonus[]> {
    try {
      const bonusesQuery = query(
        collection(db as Firestore, this.BONUSES_COLLECTION),
        where('taskerId', '==', taskerId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(bonusesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Bonus);
    } catch (error) {
      console.error('Error fetching tasker bonuses:', error);
      return [];
    }
  }

  /**
   * Get pot money statistics
   */
  static async getPotMoneyStats(): Promise<{
    totalAmount: number;
    totalDonations: number;
    totalBonusesPaid: number;
    activeBonuses: number;
  }> {
    try {
      const potMoney = await this.getPotMoney();
      if (!potMoney) {
        return {
          totalAmount: 0,
          totalDonations: 0,
          totalBonusesPaid: 0,
          activeBonuses: 0
        };
      }

      let totalBonusesPaid = 0;
      let activeBonuses = 0;

      // Get total bonuses paid with error handling
      try {
        const bonusesQuery = query(
          collection(db as Firestore, this.BONUSES_COLLECTION),
          where('status', '==', 'processed')
        );
        
        const bonusesSnapshot = await getDocs(bonusesQuery);
        totalBonusesPaid = bonusesSnapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().bonusAmount || 0), 
          0
        );
      } catch (bonusError: any) {
        console.warn('Error fetching processed bonuses:', bonusError);
        // Continue with 0 value
      }

      // Get active bonuses (pending) with error handling
      try {
        const activeBonusesQuery = query(
          collection(db as Firestore, this.BONUSES_COLLECTION),
          where('status', '==', 'pending')
        );
        
        const activeBonusesSnapshot = await getDocs(activeBonusesQuery);
        activeBonuses = activeBonusesSnapshot.size;
      } catch (activeBonusError: any) {
        console.warn('Error fetching pending bonuses:', activeBonusError);
        // Continue with 0 value
      }

      return {
        totalAmount: potMoney.totalAmount,
        totalDonations: potMoney.totalAmount + totalBonusesPaid, // Approximate
        totalBonusesPaid,
        activeBonuses
      };
    } catch (error) {
      console.error('Error fetching pot money stats:', error);
      return {
        totalAmount: 0,
        totalDonations: 0,
        totalBonusesPaid: 0,
        activeBonuses: 0
      };
    }
  }
} 