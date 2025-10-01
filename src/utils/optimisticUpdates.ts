// Optimistic updates utility for better UX

export interface OptimisticUpdate<T> {
  id: string;
  type: 'add' | 'update' | 'delete';
  data: T;
  originalData?: T;
  timestamp: number;
}

class OptimisticUpdatesManager<T> {
  private pendingUpdates: Map<string, OptimisticUpdate<T>> = new Map();
  private rollbackCallbacks: Map<string, () => void> = new Map();

  // Add an optimistic update
  add(
    id: string,
    type: OptimisticUpdate<T>['type'],
    data: T,
    originalData?: T,
    rollbackCallback?: () => void
  ): void {
    const update: OptimisticUpdate<T> = {
      id,
      type,
      data,
      originalData,
      timestamp: Date.now(),
    };

    this.pendingUpdates.set(id, update);
    
    if (rollbackCallback) {
      this.rollbackCallbacks.set(id, rollbackCallback);
    }
  }

  // Confirm an optimistic update (remove from pending)
  confirm(id: string): void {
    this.pendingUpdates.delete(id);
    this.rollbackCallbacks.delete(id);
  }

  // Rollback an optimistic update
  rollback(id: string): void {
    const rollbackCallback = this.rollbackCallbacks.get(id);
    if (rollbackCallback) {
      rollbackCallback();
    }
    
    this.pendingUpdates.delete(id);
    this.rollbackCallbacks.delete(id);
  }

  // Rollback all pending updates
  rollbackAll(): void {
    for (const [id] of this.pendingUpdates) {
      this.rollback(id);
    }
  }

  // Get all pending updates
  getPendingUpdates(): OptimisticUpdate<T>[] {
    return Array.from(this.pendingUpdates.values());
  }

  // Check if there are pending updates
  hasPendingUpdates(): boolean {
    return this.pendingUpdates.size > 0;
  }

  // Clear all updates without rollback
  clear(): void {
    this.pendingUpdates.clear();
    this.rollbackCallbacks.clear();
  }
}

// Create managers for different data types
export const habitUpdatesManager = new OptimisticUpdatesManager();
export const challengeUpdatesManager = new OptimisticUpdatesManager();
export const userUpdatesManager = new OptimisticUpdatesManager();

// Helper function to generate unique IDs for optimistic updates
export const generateOptimisticId = (): string => {
  return `optimistic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to apply optimistic updates to a list
export const applyOptimisticUpdates = <T extends { id: number | string }>(
  originalList: T[],
  updates: OptimisticUpdate<T>[]
): T[] => {
  let updatedList = [...originalList];

  for (const update of updates) {
    switch (update.type) {
      case 'add':
        updatedList.push(update.data);
        break;
      
      case 'update': {
        const updateIndex = updatedList.findIndex(item => item.id === update.data.id);
        if (updateIndex !== -1) {
          updatedList[updateIndex] = { ...updatedList[updateIndex], ...update.data };
        }
        break;
      }
      
      case 'delete':
        updatedList = updatedList.filter(item => item.id !== update.data.id);
        break;
    }
  }

  return updatedList;
};