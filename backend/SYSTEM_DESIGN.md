# Backdrop Trading Strategy Platform - System Architecture Design

## Executive Summary

Backdrop is a financial trading strategy backtesting platform that allows users to write, test, and analyze custom trading strategies using historical market data. The system provides a secure sandbox environment for code execution and comprehensive backtesting capabilities.

## System Overview

### Key Features
- **Strategy Development**: Users can create and manage trading strategies using Python
- **Secure Code Execution**: Sandboxed environment for running user-submitted code
- **Backtesting Engine**: Historical data backtesting with configurable parameters
- **Market Data Integration**: Access to historical stock and ETF data
- **User Authentication**: Google OAuth integration with session management
- **Performance Analytics**: Strategy performance metrics and visualization

## Architecture Components

### 1. Core Infrastructure

#### 1.1 Process Management
- **Supervisord**: Manages Django web application and Celery worker processes
- **Location**: `/home/steakystick/backdrop/backend/`
- **Configuration**: `supervisord.conf` and `supervisor.d/myapp.conf`
- **Services Managed**:
  - `backdrop-web`: Django web application
  - `backdrop-celery`: Celery worker processes

#### 1.2 Containerized Services (Docker Compose)
Docker Compose is used **exclusively** for:
- **PostgreSQL Database**: Persistent data storage
- **Redis**: Message broker and caching
- **Sandbox Image Building**: Pre-built code execution environment

**Note**: Django and Celery run natively on the host system via Supervisord, NOT in containers.

### 2. Application Layer

#### 2.1 Django Web Framework
- **Framework**: Django 5.1.4
- **Location**: `/home/steakystick/backdrop/backend/`
- **Execution**: Managed by Supervisord via `scripts/run_web.sh`
- **Key Features**:
  - REST API endpoints
  - User authentication and authorization
  - Strategy management
  - Market data access

#### 2.2 Django Applications

##### Authorization (`apps/authorization/`)
- Custom user model with Google OAuth integration
- Session-based authentication
- JWT token support for API access

##### Strategy Management (`apps/strategy/`)
- **UserStrategy**: User-created trading strategies
- **TemplateStrategy**: Pre-built strategy templates
- CRUD operations for strategy management
- Code validation and serialization

##### Market Data (`apps/market_data/`)
- **StockData Model**: Metadata for available financial instruments
- Full-text search capabilities using PostgreSQL GIN indexes
- Support for stocks and ETFs
- Data source file tracking

##### Engine (`apps/engine/`)
- Core backtesting execution engine
- Container pool management for sandboxed execution
- Task queuing and result processing

### 3. Task Processing Layer

#### 3.1 Celery Distributed Task Queue
- **Execution**: Managed by Supervisord via `scripts/run_celery.sh`
- **Broker**: Redis (redis://redis:6379/0)
- **Result Backend**: Redis (redis://redis:6379/0)
- **Configuration**: `config/celery.py`
- **Key Tasks**:
  - `execute_code_task`: Secure code execution in sandbox containers
  - Async data fetching and processing
  - Result caching and persistence

#### 3.2 Task Queues
- **execution_queue**: Dedicated queue for code execution tasks
- **Worker Concurrency**: Configurable (default: 1)
- **Task Limits**: 5-minute execution timeout with soft limits

### 4. Data Layer

#### 4.1 PostgreSQL Database
- **Version**: PostgreSQL 15 Alpine
- **Connection**: Host system connects to containerized PostgreSQL
- **Configuration**: 
  - Host: `postgres` (container name)
  - Port: `5432`
  - Database: Configurable via environment variables
- **Features**:
  - Full-text search with GIN indexes
  - ACID compliance for transaction integrity
  - Connection pooling

#### 4.2 Redis Cache & Message Broker
- **Version**: Redis 7.2
- **Dual Purpose**:
  - **Celery Broker**: Database 0 (`redis://redis:6379/0`)
  - **Django Cache**: Database 1 (`redis://127.0.0.1:6379/1`)
- **Features**:
  - Data persistence with AOF
  - Connection pooling
  - Market data caching (7-day TTL)

### 5. Code Execution Environment

#### 5.1 Sandbox Architecture
- **Technology**: Docker containers with security constraints
- **Image**: `code-sandbox` (Python 3.10 slim-based)
- **Security Features**:
  - Read-only root filesystem
  - Limited memory (256MB)
  - No new privileges
  - Dropped capabilities (CAP_DROP: ALL)
  - Restricted tmpfs for temporary files

#### 5.2 Container Pool Management
- **Implementation**: `apps/engine/pool.py`
- **Pool Size**: 2 containers (configurable)
- **Features**:
  - Container reuse for performance
  - Automatic cleanup and recycling
  - Thread-safe operations
  - Async container acquisition

#### 5.3 Execution Workflow
1. **Task Reception**: Celery receives `execute_code_task`
2. **Container Acquisition**: Pool provides available sandbox container
3. **Data Preparation**: 
   - User code written to temporary file
   - Market data serialized and mounted
   - Configuration parameters passed
4. **Secure Execution**: Code runs in isolated container environment
5. **Result Collection**: stdout/stderr captured and returned
6. **Cleanup**: Container resources cleaned and returned to pool

### 6. Security Architecture

#### 6.1 Authentication & Authorization
- **Primary**: Google OAuth 2.0 integration
- **Session Management**: Django sessions with Redis backing
- **API Authentication**: Custom `SessionTokenAuthentication`
- **CORS**: Configured for specific origins only

#### 6.2 Code Execution Security
- **Sandboxing**: Isolated Docker containers
- **Resource Limits**: CPU and memory constraints
- **Filesystem Protection**: Read-only mounts
- **Network Isolation**: Dedicated Docker network
- **Allowed Builtins**: Restricted Python builtin functions

#### 6.3 Rate Limiting
- **API Throttling**: REST framework throttling
  - Anonymous: 100/hour
  - Authenticated: 1000/hour
  - Code execution: 5/minute
- **Database Protection**: Connection pooling and limits

### 7. Data Flow Architecture

#### 7.1 Strategy Execution Flow
```
User Request → Django API → Celery Task → Container Pool → 
Sandbox Execution → Result Processing → Cache Storage → 
API Response
```

#### 7.2 Market Data Flow
```
External Data Source → Cache Check → Async HTTP Fetch → 
Data Processing → Redis Cache → DataFrame Serialization → 
Container Mount
```

### 8. Deployment Architecture

#### 8.1 Host System Components
- **Operating System**: Linux
- **Process Manager**: Supervisord
- **Python Environment**: Virtual environment
- **Application Code**: `/home/steakystick/backdrop/backend/`

#### 8.2 Containerized Components
- **PostgreSQL**: Data persistence
- **Redis**: Caching and message brokering
- **Sandbox Containers**: Code execution (dynamically created)

#### 8.3 Network Architecture
- **Docker Network**: `backend_backend` (bridge mode)
- **Port Mappings**:
  - PostgreSQL: `5432:5432`
  - Redis: `127.0.0.1:6379:6379`
  - Django Web: `8000:8000`

### 9. Configuration Management

#### 9.1 Environment Variables
- Database credentials (POSTGRES_*)
- Authentication keys (GOOGLE_CLIENT_ID, NEXTAUTH_SECRET)
- Django settings (SECRET_KEY, DEBUG)
- Celery configuration (CELERY_BROKER_URL)

#### 9.2 Configuration Files
- `config/settings.py`: Django settings
- `config/celery.py`: Celery configuration
- `supervisord.conf`: Process management
- `docker-compose.yml`: Container orchestration

### 10. Monitoring & Logging

#### 10.1 Application Logging
- **Django Logs**: Console and file-based logging
- **Celery Logs**: Task execution monitoring
- **Supervisord Logs**: Process management logs
- **Log Location**: `/home/steakystick/backdrop/backend/logs/`

#### 10.2 Health Monitoring
- **Database**: Connection health checks
- **Redis**: Broker connectivity monitoring
- **Container Pool**: Active container tracking
- **Task Queue**: Worker status monitoring

### 11. Performance Considerations

#### 11.1 Caching Strategy
- **Market Data**: 7-day Redis cache
- **User Sessions**: Redis-backed sessions
- **Database Queries**: Connection pooling

#### 11.2 Scalability Design
- **Horizontal Scaling**: Multiple Celery workers
- **Container Pool**: Adjustable pool size
- **Database**: Connection pooling and indexing
- **Load Balancing**: Ready for reverse proxy integration

### 12. Development & Operations

#### 12.1 Development Workflow
- **Code Changes**: Direct file system edits
- **Process Restart**: Supervisorctl commands
- **Database Migrations**: Django management commands
- **Container Updates**: Docker Compose rebuild

#### 12.2 Operational Commands
- **Start Services**: `supervisorctl start all`
- **Restart Application**: `supervisorctl restart backdrop-web`
- **Monitor Processes**: `supervisorctl status`
- **View Logs**: `tail -f logs/backdrop-web.log`

## Technology Stack Summary

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Web Framework | Django | 5.1.4 | API and web application |
| Task Queue | Celery | Latest | Async task processing |
| Database | PostgreSQL | 15 Alpine | Data persistence |
| Cache/Broker | Redis | 7.2 | Caching and messaging |
| Process Manager | Supervisord | Latest | Service management |
| Container Runtime | Docker | Latest | Code sandboxing |
| Python Runtime | Python | 3.13 | Application runtime |

## Security Compliance

- **Data Protection**: Encrypted connections, secure sessions
- **Code Isolation**: Containerized execution environment
- **Access Control**: OAuth-based authentication
- **Resource Limits**: Constrained execution environment
- **Audit Trail**: Comprehensive logging

## Future Enhancements

- **Horizontal Scaling**: Multiple application instances
- **Advanced Monitoring**: Metrics collection and alerting
- **Enhanced Security**: Additional sandbox restrictions
- **Performance Optimization**: Query optimization and caching improvements
- **API Expansion**: Additional financial data sources