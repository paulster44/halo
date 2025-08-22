export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: any
  context?: string
  userId?: string
  sessionId?: string
}

class Logger {
  private isDevelopment = import.meta.env.DEV
  private sessionId = this.generateSessionId()
  private logs: LogEntry[] = []
  private maxLogs = 100

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      context,
      sessionId: this.sessionId
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Store critical errors in localStorage
    if (entry.level === 'error' || entry.level === 'critical') {
      this.persistCriticalLog(entry)
    }
  }

  private persistCriticalLog(entry: LogEntry) {
    try {
      const criticalLogs = JSON.parse(localStorage.getItem('critical_logs') || '[]')
      criticalLogs.push(entry)
      // Keep only last 20 critical logs
      if (criticalLogs.length > 20) {
        criticalLogs.shift()
      }
      localStorage.setItem('critical_logs', JSON.stringify(criticalLogs))
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }

  debug(message: string, data?: any, context?: string) {
    const entry = this.createLogEntry('debug', message, data, context)
    this.addLog(entry)
    
    if (this.isDevelopment) {
      console.debug(`[DEBUG${context ? ` ${context}` : ''}] ${message}`, data)
    }
  }

  info(message: string, data?: any, context?: string) {
    const entry = this.createLogEntry('info', message, data, context)
    this.addLog(entry)
    
    if (this.isDevelopment) {
      console.info(`[INFO${context ? ` ${context}` : ''}] ${message}`, data)
    }
  }

  warn(message: string, data?: any, context?: string) {
    const entry = this.createLogEntry('warn', message, data, context)
    this.addLog(entry)
    
    console.warn(`[WARN${context ? ` ${context}` : ''}] ${message}`, data)
  }

  error(message: string, data?: any, context?: string) {
    const entry = this.createLogEntry('error', message, data, context)
    this.addLog(entry)
    
    console.error(`[ERROR${context ? ` ${context}` : ''}] ${message}`, data)
  }

  critical(message: string, data?: any, context?: string) {
    const entry = this.createLogEntry('critical', message, data, context)
    this.addLog(entry)
    
    console.error(`[CRITICAL${context ? ` ${context}` : ''}] ${message}`, data)
    
    // Could trigger alerts or notifications for critical errors
    this.handleCriticalError(entry)
  }

  private handleCriticalError(entry: LogEntry) {
    // In production, this could send alerts to monitoring services
    if (this.isDevelopment) {
      console.group('🚨 CRITICAL ERROR DETECTED')
      console.error('Message:', entry.message)
      console.error('Data:', entry.data)
      console.error('Context:', entry.context)
      console.error('Timestamp:', entry.timestamp)
      console.groupEnd()
    }
  }

  // Get recent logs for debugging
  getRecentLogs(level?: LogLevel, limit = 50): LogEntry[] {
    let filteredLogs = this.logs
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level)
    }
    
    return filteredLogs.slice(-limit)
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // Clear logs
  clearLogs() {
    this.logs = []
  }
}

// Create singleton logger instance
export const logger = new Logger()

// Context-specific loggers
export const authLogger = {
  debug: (message: string, data?: any) => logger.debug(message, data, 'AUTH'),
  info: (message: string, data?: any) => logger.info(message, data, 'AUTH'),
  warn: (message: string, data?: any) => logger.warn(message, data, 'AUTH'),
  error: (message: string, data?: any) => logger.error(message, data, 'AUTH')
}

export const dbLogger = {
  debug: (message: string, data?: any) => logger.debug(message, data, 'DATABASE'),
  info: (message: string, data?: any) => logger.info(message, data, 'DATABASE'),
  warn: (message: string, data?: any) => logger.warn(message, data, 'DATABASE'),
  error: (message: string, data?: any) => logger.error(message, data, 'DATABASE')
}

export const apiLogger = {
  debug: (message: string, data?: any) => logger.debug(message, data, 'API'),
  info: (message: string, data?: any) => logger.info(message, data, 'API'),
  warn: (message: string, data?: any) => logger.warn(message, data, 'API'),
  error: (message: string, data?: any) => logger.error(message, data, 'API')
}
