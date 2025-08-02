import { performIntelligentDrawing, getCurrentDrawing } from '../data/lottery';

interface AutoDrawingConfig {
  enabled: boolean;
  nextScheduledTime: Date | null;
  dayOfWeek: number; // 5 = Friday
  hour: number; // 21 = 9 PM
  minute: number; // 0
}

class AutoDrawingService {
  private config: AutoDrawingConfig = {
    enabled: true,
    nextScheduledTime: null,
    dayOfWeek: 5, // Friday
    hour: 21, // 9 PM
    minute: 0
  };
  
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.calculateNextDrawingTime();
    this.startScheduler();
  }

  public setAutoDrawingEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`🎲 Auto-drawing ${enabled ? 'enabled' : 'disabled'}`);
    
    if (enabled) {
      this.calculateNextDrawingTime();
      this.startScheduler();
    } else {
      this.stopScheduler();
    }
  }

  public getConfig(): AutoDrawingConfig {
    return { ...this.config };
  }

  public getNextDrawingTime(): Date | null {
    return this.config.nextScheduledTime;
  }

  public triggerManualDrawing(): boolean {
    if (!getCurrentDrawing()) {
      console.log('❌ No current drawing available for manual trigger');
      return false;
    }

    console.log('🎲 Manual drawing triggered by admin');
    this.performDrawing();
    return true;
  }

  private calculateNextDrawingTime(): void {
    const now = new Date();
    const nextDrawing = new Date();
    
    // Set to next Friday at 21:00
    const daysUntilFriday = (this.config.dayOfWeek - now.getDay() + 7) % 7;
    const isToday = daysUntilFriday === 0;
    const hasPassedToday = isToday && (now.getHours() > this.config.hour || 
      (now.getHours() === this.config.hour && now.getMinutes() >= this.config.minute));

    if (hasPassedToday) {
      // If it's Friday and past 21:00, schedule for next Friday
      nextDrawing.setDate(now.getDate() + 7);
    } else if (daysUntilFriday === 0) {
      // If it's Friday but before 21:00, schedule for today
      nextDrawing.setDate(now.getDate());
    } else {
      // Schedule for next Friday
      nextDrawing.setDate(now.getDate() + daysUntilFriday);
    }

    nextDrawing.setHours(this.config.hour, this.config.minute, 0, 0);
    this.config.nextScheduledTime = nextDrawing;

    console.log(`🎲 Next automatic drawing scheduled for: ${nextDrawing.toLocaleString('de-DE')}`);
  }

  private startScheduler(): void {
    this.stopScheduler(); // Clear any existing interval
    
    if (!this.config.enabled) return;

    // Check every minute if it's time for a drawing
    this.intervalId = setInterval(() => {
      this.checkForScheduledDrawing();
    }, 60000); // Check every minute

    console.log('🎲 Auto-drawing scheduler started');
  }

  private stopScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🎲 Auto-drawing scheduler stopped');
    }
  }

  private checkForScheduledDrawing(): void {
    if (!this.config.enabled || !this.config.nextScheduledTime) return;

    const now = new Date();
    
    // Check if it's time for the scheduled drawing (within 1 minute window)
    if (now >= this.config.nextScheduledTime) {
      console.log('🎲 Scheduled drawing time reached!');
      this.performDrawing();
      this.calculateNextDrawingTime(); // Schedule next drawing
    }
  }

  private async performDrawing(): Promise<void> {
    try {
      console.log('🎲 Starting automatic drawing...');
      
      const result = performIntelligentDrawing();
      
      if (result) {
        console.log('🎲 Automatic drawing completed successfully');
        console.log(`🎲 Drawn numbers - Main: ${result.mainNumbers}, World: ${result.worldNumbers}`);
      } else {
        console.log('❌ Automatic drawing failed - no current drawing available');
      }
    } catch (error) {
      console.error('❌ Error during automatic drawing:', error);
    }
  }

  public getTimeUntilNextDrawing(): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  } {
    if (!this.config.nextScheduledTime) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    }

    const now = new Date();
    const diff = this.config.nextScheduledTime.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, totalMs: diff };
  }
}

// Export singleton instance
export const autoDrawingService = new AutoDrawingService();
