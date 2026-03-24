-- ================================================
-- AI Chatbot SaaS - Complete MySQL Database Schema with Sample Data
-- ================================================

-- Core tenant management and multi-tenancy support
CREATE TABLE tenants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE,
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#007bff',
    secondary_color VARCHAR(7) DEFAULT '#6c757d',
    custom_css TEXT,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    subscription_plan ENUM('free', 'basic', 'pro', 'enterprise') DEFAULT 'free',
    max_users INT DEFAULT 5,
    max_chat_sessions INT DEFAULT 100,
    max_storage_mb INT DEFAULT 500,
    billing_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_slug (slug),
    INDEX idx_tenant_status (status)
);

-- User management with multi-tenant support
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('super_admin', 'tenant_admin', 'support', 'customer') NOT NULL,
    status ENUM('active', 'inactive', 'pending', 'suspended') DEFAULT 'pending',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tenant_email (tenant_id, email),
    INDEX idx_user_email (email),
    INDEX idx_user_role (role),
    INDEX idx_user_status (status)
);

-- User sessions and authentication
CREATE TABLE user_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    tenant_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_session_user (user_id),
    INDEX idx_session_expires (expires_at)
);

-- Permission system
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    module VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions mapping
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role ENUM('super_admin', 'tenant_admin', 'support', 'customer') NOT NULL,
    permission_id INT NOT NULL,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role, permission_id)
);

-- Document categories for knowledge base organization
CREATE TABLE document_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INT NULL,
    sort_order INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES document_categories(id) ON DELETE SET NULL,
    INDEX idx_category_tenant (tenant_id),
    INDEX idx_category_parent (parent_id)
);

-- Documents/PDFs management
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    category_id INT NULL,
    uploaded_by INT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    file_hash VARCHAR(64),
    title VARCHAR(255),
    description TEXT,
    tags TEXT,
    status ENUM('uploading', 'processing', 'processed', 'failed', 'archived') DEFAULT 'uploading',
    processing_status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
    error_message TEXT,
    chunk_count INT DEFAULT 0,
    embedding_count INT DEFAULT 0,
    version INT DEFAULT 1,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES document_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_document_tenant (tenant_id),
    INDEX idx_document_status (status),
    INDEX idx_document_hash (file_hash),
    INDEX idx_document_category (category_id)
);

-- Document versions for version history
CREATE TABLE document_versions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    version_number INT NOT NULL,
    uploaded_by INT NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    change_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_document_version (document_id, version_number)
);

-- Document chunks for vector processing
CREATE TABLE document_chunks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    tenant_id INT NOT NULL,
    chunk_index INT NOT NULL,
    content MEDIUMTEXT NOT NULL,
    content_hash VARCHAR(64),
    token_count INT,
    weaviate_id VARCHAR(255),
    embedding_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_chunk_document (document_id),
    INDEX idx_chunk_tenant (tenant_id),
    INDEX idx_chunk_weaviate (weaviate_id),
    INDEX idx_chunk_status (embedding_status)
);

-- Chat sessions
CREATE TABLE chat_sessions (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id INT NOT NULL,
    user_id INT NULL,
    session_name VARCHAR(255),
    context_documents JSON,
    session_metadata JSON,
    status ENUM('active', 'ended', 'archived') DEFAULT 'active',
    ip_address VARCHAR(45),
    user_agent TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_session_tenant (tenant_id),
    INDEX idx_session_user (user_id),
    INDEX idx_session_status (status),
    INDEX idx_session_activity (last_activity)
);

-- Chat messages
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(36) NOT NULL,
    tenant_id INT NOT NULL,
    message_type ENUM('user', 'assistant', 'system') NOT NULL,
    content MEDIUMTEXT NOT NULL,
    content_hash VARCHAR(64),
    token_count INT,
    model_used VARCHAR(100),
    context_chunks JSON,
    processing_time_ms INT,
    cost_estimate DECIMAL(10, 6),
    feedback_rating TINYINT,
    feedback_comment TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_message_session (session_id),
    INDEX idx_message_tenant (tenant_id),
    INDEX idx_message_type (message_type),
    INDEX idx_message_created (created_at)
);

-- System configurations per tenant
CREATE TABLE tenant_configurations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    config_type ENUM('string', 'integer', 'float', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_tenant_config (tenant_id, config_key),
    INDEX idx_config_tenant (tenant_id)
);

-- API usage tracking
CREATE TABLE api_usage_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    user_id INT NULL,
    session_id VARCHAR(36) NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_size INT,
    response_size INT,
    response_time_ms INT,
    status_code INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE SET NULL,
    INDEX idx_usage_tenant (tenant_id),
    INDEX idx_usage_endpoint (endpoint),
    INDEX idx_usage_created (created_at)
);

-- Analytics and metrics
CREATE TABLE tenant_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    metric_date DATE NOT NULL,
    active_users INT DEFAULT 0,
    new_users INT DEFAULT 0,
    chat_sessions INT DEFAULT 0,
    messages_sent INT DEFAULT 0,
    messages_received INT DEFAULT 0,
    documents_uploaded INT DEFAULT 0,
    storage_used_mb DECIMAL(10, 2) DEFAULT 0,
    api_calls INT DEFAULT 0,
    processing_time_avg_ms INT DEFAULT 0,
    cost_estimate DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tenant_date (tenant_id, metric_date),
    INDEX idx_analytics_tenant (tenant_id),
    INDEX idx_analytics_date (metric_date)
);

-- Subscription and billing
CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    plan_id VARCHAR(255) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    subscription_status ENUM('active', 'cancelled', 'expired', 'past_due', 'created', 'authenticated', 'paused', 'halted', 'completed') DEFAULT 'active',
    billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_type ENUM('razorpay', 'stripe') NULL,
    subscription_id VARCHAR(255) NULL,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    trial_end TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    payment_id VARCHAR(255),
    invoice_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_subscription_tenant (tenant_id),
    INDEX idx_subscription_status (subscription_status),
    INDEX idx_subscription_stripe (stripe_subscription_id)
);

-- Billing invoices
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    subscription_id INT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    amount_due DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    stripe_invoice_id VARCHAR(255),
    due_date DATE,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
    INDEX idx_invoice_tenant (tenant_id),
    INDEX idx_invoice_status (status),
    INDEX idx_invoice_number (invoice_number)
);

-- Notifications system
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    user_id INT NULL,
    type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_tenant (tenant_id),
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_read (is_read),
    INDEX idx_notification_created (created_at)
);

-- Audit logs for compliance and security
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(50),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_tenant (tenant_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at),
    INDEX idx_audit_resource (resource_type, resource_id)
);

-- System health monitoring
CREATE TABLE system_health_checks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(100) NOT NULL,
    status ENUM('healthy', 'degraded', 'unhealthy') NOT NULL,
    response_time_ms INT,
    error_message TEXT,
    metadata JSON,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_health_service (service_name),
    INDEX idx_health_status (status),
    INDEX idx_health_checked (checked_at)
);

-- Subscription plans (admin-managed pricing tiers)
CREATE TABLE subscription_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
    concurrent_users INT DEFAULT 1,
    document_collections INT DEFAULT 5,
    max_file_upload_mb INT DEFAULT 10,
    storage_limit_gb INT DEFAULT 1,
    card_color VARCHAR(20) DEFAULT '#ffffff',
    icon_color VARCHAR(20) DEFAULT '#000000',
    icon_bg_color VARCHAR(20) DEFAULT '#f0f0f0',
    description TEXT,
    features JSON,
    is_active TINYINT DEFAULT 1,
    razorpay_plan_id VARCHAR(255),
    stripepay_price_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tenant chatbot widget configuration
CREATE TABLE tenant_chatbot_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    chatbot_name VARCHAR(255) DEFAULT 'AI Assistant',
    welcome_message TEXT,
    placeholder_text VARCHAR(500) DEFAULT 'Type your message here...',
    widget_position VARCHAR(50) DEFAULT 'bottom-right',
    primary_color VARCHAR(20) DEFAULT '#007bff',
    secondary_color VARCHAR(20) DEFAULT '#6c757d',
    text_color VARCHAR(20) DEFAULT '#333333',
    background_color VARCHAR(20) DEFAULT '#ffffff',
    widget_size VARCHAR(20) DEFAULT 'medium',
    auto_open TINYINT DEFAULT 0,
    show_agent_avatar TINYINT DEFAULT 1,
    collect_user_info TINYINT DEFAULT 0,
    require_email TINYINT DEFAULT 0,
    enable_file_upload TINYINT DEFAULT 0,
    max_message_length INT DEFAULT 2000,
    custom_css TEXT,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tenant_chatbot_config (tenant_id)
);

-- Additional composite indexes for performance optimization
CREATE INDEX idx_chat_messages_session_created ON chat_messages(session_id, created_at);
CREATE INDEX idx_documents_tenant_status ON documents(tenant_id, status);
CREATE INDEX idx_chat_sessions_tenant_activity ON chat_sessions(tenant_id, last_activity);
CREATE INDEX idx_api_usage_tenant_created ON api_usage_logs(tenant_id, created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at);

-- Active tenant summary view
CREATE VIEW v_tenant_summary AS
SELECT 
    t.id,
    t.name,
    t.slug,
    t.status,
    t.subscription_plan,
    COUNT(DISTINCT u.id) as user_count,
    COUNT(DISTINCT d.id) as document_count,
    COUNT(DISTINCT cs.id) as active_sessions,
    COALESCE(SUM(d.file_size), 0) / (1024 * 1024) as storage_used_mb,
    t.created_at
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id AND u.status = 'active'
LEFT JOIN documents d ON t.id = d.tenant_id AND d.status = 'processed'
LEFT JOIN chat_sessions cs ON t.id = cs.tenant_id AND cs.status = 'active'
WHERE t.status = 'active'
GROUP BY t.id, t.name, t.slug, t.status, t.subscription_plan, t.created_at;

-- ================================================
-- SAMPLE DATA INSERTS
-- ================================================

-- Insert Default Permissions
INSERT INTO permissions (name, description, module) VALUES
('users.create', 'Create new users', 'user_management'),
('users.read', 'View user information', 'user_management'),
('users.update', 'Update user information', 'user_management'),
('users.delete', 'Delete users', 'user_management'),
('documents.create', 'Upload documents', 'document_management'),
('documents.read', 'View documents', 'document_management'),
('documents.update', 'Update documents', 'document_management'),
('documents.delete', 'Delete documents', 'document_management'),
('chat.create', 'Start chat sessions', 'chat'),
('chat.read', 'View chat history', 'chat'),
('analytics.read', 'View analytics', 'analytics'),
('settings.read', 'View tenant settings', 'settings'),
('settings.update', 'Update tenant settings', 'settings'),
('billing.read', 'View billing information', 'billing'),
('billing.update', 'Update billing information', 'billing'),
('admin.full', 'Full administrative access', 'admin'),
('support.tickets', 'Manage support tickets', 'support'),
('api.access', 'Access API endpoints', 'api'),
('reports.generate', 'Generate reports', 'reports'),
('system.monitor', 'Monitor system health', 'system');

-- Insert Default Role Permissions
INSERT INTO role_permissions (role, permission_id) 
SELECT 'super_admin', id FROM permissions;

INSERT INTO role_permissions (role, permission_id) 
SELECT 'tenant_admin', id FROM permissions WHERE module IN ('user_management', 'document_management', 'chat', 'analytics', 'settings', 'reports') OR name LIKE 'billing.read';

INSERT INTO role_permissions (role, permission_id) 
SELECT 'support', id FROM permissions WHERE name IN ('documents.read', 'chat.create', 'chat.read', 'support.tickets', 'users.read');

INSERT INTO role_permissions (role, permission_id) 
SELECT 'customer', id FROM permissions WHERE name IN ('chat.create', 'chat.read', 'documents.read');

-- Sample Tenants
INSERT INTO tenants (name, slug, domain, logo_url, primary_color, secondary_color, status, subscription_plan, max_users, max_chat_sessions, max_storage_mb, billing_email) VALUES
('TechCorp Solutions', 'techcorp', 'chat.techcorp.com', 'https://cdn.example.com/logos/techcorp.png', '#1f2937', '#3b82f6', 'active', 'enterprise', 100, 10000, 5000, 'billing@techcorp.com'),
('StartupHub', 'startuphub', 'support.startuphub.io', 'https://cdn.example.com/logos/startuphub.png', '#059669', '#10b981', 'active', 'pro', 25, 2500, 2000, 'finance@startuphub.io'),
('LocalBiz Inc', 'localbiz', 'help.localbiz.com', 'https://cdn.example.com/logos/localbiz.png', '#dc2626', '#ef4444', 'active', 'basic', 10, 500, 1000, 'admin@localbiz.com'),
('FreeTier Demo', 'freetier', NULL, NULL, '#6366f1', '#8b5cf6', 'active', 'free', 5, 100, 500, 'demo@example.com'),
('Suspended Corp', 'suspended', 'old.suspended.com', NULL, '#374151', '#6b7280', 'suspended', 'basic', 10, 500, 1000, 'contact@suspended.com'),
('Global Enterprise', 'globalent', 'ai.globalenterprise.com', 'https://cdn.example.com/logos/global.png', '#7c3aed', '#a855f7', 'active', 'enterprise', 500, 50000, 10000, 'billing@globalenterprise.com'),
('MediumCorp', 'mediumcorp', 'support.mediumcorp.com', NULL, '#f59e0b', '#fbbf24', 'active', 'pro', 50, 5000, 3000, 'accounts@mediumcorp.com'),
('NonProfit Org', 'nonprofit', NULL, NULL, '#10b981', '#34d399', 'active', 'basic', 15, 750, 1500, 'admin@nonprofit.org');

-- Sample Users with realistic password hash for "password123"
INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, role, status, email_verified, last_login) VALUES
-- TechCorp Users (tenant_id = 1)
(1, 'admin@techcorp.com', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'John', 'Smith', 'tenant_admin', 'active', 1, NOW() - INTERVAL 2 HOUR),
(1, 'support@techcorp.com', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Jane', 'Johnson', 'support', 'active', 1, NOW() - INTERVAL 5 HOUR),
(1, 'user1@techcorp.com', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Mike', 'Wilson', 'customer', 'active', 1, NOW() - INTERVAL 1 DAY),
(1, 'dev@techcorp.com', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Sarah', 'Developer', 'customer', 'active', 1, NOW() - INTERVAL 3 HOUR),

-- StartupHub Users (tenant_id = 2)
(2, 'founder@startuphub.io', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Alex', 'Founder', 'tenant_admin', 'active', 1, NOW() - INTERVAL 30 MINUTE),
(2, 'team@startuphub.io', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Lisa', 'Manager', 'customer', 'active', 1, NOW() - INTERVAL 3 HOUR),
(2, 'marketing@startuphub.io', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'David', 'Marketing', 'customer', 'active', 1, NOW() - INTERVAL 1 DAY),

-- LocalBiz Users (tenant_id = 3)
(3, 'owner@localbiz.com', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Robert', 'Garcia', 'tenant_admin', 'active', 1, NOW() - INTERVAL 6 HOUR),
(3, 'staff@localbiz.com', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Maria', 'Martinez', 'support', 'active', 1, NOW() - INTERVAL 2 DAY),
(3, 'employee@localbiz.com', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Carlos', 'Rodriguez', 'customer', 'active', 1, NOW() - INTERVAL 8 HOUR),

-- FreeTier Users (tenant_id = 4)
(4, 'demo@example.com', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Demo', 'User', 'tenant_admin', 'active', 1, NOW() - INTERVAL 1 HOUR),
(4, 'test@example.com', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Test', 'Account', 'customer', 'active', 1, NOW() - INTERVAL 4 HOUR),

-- Global Enterprise Users (tenant_id = 6)
(6, 'cto@globalenterprise.com', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Patricia', 'Tech', 'tenant_admin', 'active', 1, NOW() - INTERVAL 45 MINUTE),
(6, 'manager1@globalenterprise.com', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'James', 'Manager', 'support', 'active', 1, NOW() - INTERVAL 2 HOUR),
(6, 'analyst@globalenterprise.com', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Emily', 'Analyst', 'customer', 'active', 1, NOW() - INTERVAL 1 DAY),

-- MediumCorp Users (tenant_id = 7)
(7, 'admin@mediumcorp.com', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Thomas', 'Admin', 'tenant_admin', 'active', 1, NOW() - INTERVAL 3 HOUR),
(7, 'support@mediumcorp.com', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Rachel', 'Support', 'support', 'active', 1, NOW() - INTERVAL 5 HOUR),

-- NonProfit Users (tenant_id = 8)
(8, 'director@nonprofit.org', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Jennifer', 'Director', 'tenant_admin', 'active', 1, NOW() - INTERVAL 4 HOUR),
(8, 'volunteer@nonprofit.org', '$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG', 'Mark', 'Volunteer', 'customer', 'active', 1, NOW() - INTERVAL 6 HOUR);

-- Sample User Sessions
INSERT INTO user_sessions (id, user_id, tenant_id, ip_address, user_agent, expires_at) VALUES
('sess_1a2b3c4d5e6f7g8h9i0j', 1, 1, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() + INTERVAL 1 DAY),
('sess_2b3c4d5e6f7g8h9i0j1k', 5, 2, '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', NOW() + INTERVAL 1 DAY),
('sess_3c4d5e6f7g8h9i0j1k2l', 8, 3, '172.16.0.25', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', NOW() + INTERVAL 1 DAY),
('sess_4d5e6f7g8h9i0j1k2l3m', 11, 4, '203.0.113.45', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)', NOW() + INTERVAL 1 DAY),
('sess_5e6f7g8h9i0j1k2l3m4n', 13, 6, '198.51.100.78', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() + INTERVAL 1 DAY),
('sess_6f7g8h9i0j1k2l3m4n5o', 16, 7, '192.0.2.134', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', NOW() + INTERVAL 1 DAY);

-- Sample Document Categories
INSERT INTO document_categories (tenant_id, name, description, parent_id, sort_order, status) VALUES
-- TechCorp Categories (tenant_id = 1)
(1, 'Product Documentation', 'Technical product manuals and guides', NULL, 1, 'active'),
(1, 'User Guides', 'End-user documentation', 1, 1, 'active'),
(1, 'API Documentation', 'Developer API references', 1, 2, 'active'),
(1, 'HR Policies', 'Human resources policies and procedures', NULL, 2, 'active'),
(1, 'Training Materials', 'Employee training resources', NULL, 3, 'active'),

-- StartupHub Categories (tenant_id = 2)
(2, 'Business Plans', 'Strategic business documentation', NULL, 1, 'active'),
(2, 'Marketing', 'Marketing materials and campaigns', NULL, 2, 'active'),
(2, 'Financial Reports', 'Financial planning and reports', NULL, 3, 'active'),

-- LocalBiz Categories (tenant_id = 3)
(3, 'Operations', 'Daily operations procedures', NULL, 1, 'active'),
(3, 'Customer Service', 'Customer service guidelines', NULL, 2, 'active'),
(3, 'Inventory Management', 'Stock and inventory procedures', NULL, 3, 'active'),

-- Global Enterprise Categories (tenant_id = 6)
(6, 'Enterprise Policies', 'Company-wide policies and procedures', NULL, 1, 'active'),
(6, 'Technical Specifications', 'Technical documentation and specs', NULL, 2, 'active'),
(6, 'Compliance', 'Regulatory and compliance documentation', NULL, 3, 'active'),

-- MediumCorp Categories (tenant_id = 7)
(7, 'Product Manuals', 'Product documentation and manuals', NULL, 1, 'active'),
(7, 'Support Guides', 'Customer support documentation', NULL, 2, 'active'),

-- NonProfit Categories (tenant_id = 8)
(8, 'Program Guidelines', 'Program management guidelines', NULL, 1, 'active'),
(8, 'Volunteer Resources', 'Resources for volunteers', NULL, 2, 'active');

-- Sample Documents
INSERT INTO documents (tenant_id, category_id, uploaded_by, original_filename, stored_filename, file_path, file_size, mime_type, file_hash, title, description, tags, status, processing_status, chunk_count, embedding_count, version) VALUES
-- TechCorp Documents (tenant_id = 1)
(1, 2, 1, 'user-manual-v2.pdf', 'doc_1a2b3c_user-manual-v2.pdf', '/uploads/tenant_1/doc_1a2b3c_user-manual-v2.pdf', 2048576, 'application/pdf', 'sha256_hash_1a2b3c4d', 'User Manual Version 2.0', 'Complete user guide for product features', '["user-guide", "manual", "v2.0"]', 'processed', 'completed', 45, 45, 1),
(1, 3, 1, 'api-reference.pdf', 'doc_2b3c4d_api-reference.pdf', '/uploads/tenant_1/doc_2b3c4d_api-reference.pdf', 1536000, 'application/pdf', 'sha256_hash_2b3c4d5e', 'API Reference Guide', 'Complete API documentation for developers', '["api", "documentation", "reference"]', 'processed', 'completed', 32, 32, 1),
(1, 4, 2, 'employee-handbook.pdf', 'doc_3c4d5e_employee-handbook.pdf', '/uploads/tenant_1/doc_3c4d5e_employee-handbook.pdf', 3072000, 'application/pdf', 'sha256_hash_3c4d5e6f', 'Employee Handbook 2024', 'HR policies and employee guidelines', '["hr", "handbook", "policies"]', 'processed', 'completed', 67, 67, 1),
(1, 5, 3, 'training-module-1.pdf', 'doc_4d5e6f_training-module-1.pdf', '/uploads/tenant_1/doc_4d5e6f_training-module-1.pdf', 1792000, 'application/pdf', 'sha256_hash_4d5e6f7g', 'Training Module 1: Basics', 'Basic training for new employees', '["training", "basics", "onboarding"]', 'processed', 'completed', 28, 28, 1),

-- StartupHub Documents (tenant_id = 2)
(2, 6, 5, 'business-plan-2024.pdf', 'doc_5e6f7g_business-plan-2024.pdf', '/uploads/tenant_2/doc_5e6f7g_business-plan-2024.pdf', 4096000, 'application/pdf', 'sha256_hash_5e6f7g8h', 'Business Plan 2024', 'Strategic business plan for 2024', '["business-plan", "strategy", "2024"]', 'processed', 'completed', 89, 89, 1),
(2, 7, 6, 'marketing-strategy.pdf', 'doc_6f7g8h_marketing-strategy.pdf', '/uploads/tenant_2/doc_6f7g8h_marketing-strategy.pdf', 1792000, 'application/pdf', 'sha256_hash_6f7g8h9i', 'Marketing Strategy Q1', 'Q1 marketing campaign strategy', '["marketing", "strategy", "q1"]', 'processed', 'completed', 38, 38, 1),
(2, 8, 5, 'financial-projections.pdf', 'doc_7g8h9i_financial-projections.pdf', '/uploads/tenant_2/doc_7g8h9i_financial-projections.pdf', 2304000, 'application/pdf', 'sha256_hash_7g8h9i0j', 'Financial Projections 2024-2026', 'Three-year financial forecasting', '["finance", "projections", "forecast"]', 'processed', 'completed', 52, 52, 1),

-- LocalBiz Documents (tenant_id = 3)
(3, 9, 8, 'operations-manual.pdf', 'doc_8h9i0j_operations-manual.pdf', '/uploads/tenant_3/doc_8h9i0j_operations-manual.pdf', 2560000, 'application/pdf', 'sha256_hash_8h9i0j1k', 'Operations Manual', 'Daily operations procedures and guidelines', '["operations", "manual", "procedures"]', 'processed', 'completed', 56, 56, 1),
(3, 10, 9, 'customer-service-guide.pdf', 'doc_9i0j1k_customer-service-guide.pdf', '/uploads/tenant_3/doc_9i0j1k_customer-service-guide.pdf', 1280000, 'application/pdf', 'sha256_hash_9i0j1k2l', 'Customer Service Excellence', 'Guidelines for exceptional customer service', '["customer-service", "guidelines", "excellence"]', 'processed', 'completed', 34, 34, 1),
(3, 11, 10, 'inventory-procedures.pdf', 'doc_10j1k2l_inventory-procedures.pdf', '/uploads/tenant_3/doc_10j1k2l_inventory-procedures.pdf', 1536000, 'application/pdf', 'sha256_hash_10j1k2l3m', 'Inventory Management Procedures', 'Stock management and inventory tracking', '["inventory", "management", "tracking"]', 'processed', 'completed', 41, 41, 1),

-- Global Enterprise Documents (tenant_id = 6)
(6, 12, 13, 'enterprise-security-policy.pdf', 'doc_11k2l3m_enterprise-security-policy.pdf', '/uploads/tenant_6/doc_11k2l3m_enterprise-security-policy.pdf', 3584000, 'application/pdf', 'sha256_hash_11k2l3m4n', 'Enterprise Security Policy', 'Comprehensive security policies and procedures', '["security", "policy", "enterprise"]', 'processed', 'completed', 78, 78, 1),
(6, 13, 14, 'technical-architecture.pdf', 'doc_12l3m4n_technical-architecture.pdf', '/uploads/tenant_6/doc_12l3m4n_technical-architecture.pdf', 4608000, 'application/pdf', 'sha256_hash_12l3m4n5o', 'Technical Architecture Guide', 'System architecture and technical specifications', '["architecture", "technical", "specifications"]', 'processed', 'completed', 95, 95, 1),

-- MediumCorp Documents (tenant_id = 7)
(7, 15, 16, 'product-specifications.pdf', 'doc_13m4n5o_product-specifications.pdf', '/uploads/tenant_7/doc_13m4n5o_product-specifications.pdf', 2816000, 'application/pdf', 'sha256_hash_13m4n5o6p', 'Product Specifications v3.2', 'Detailed product specifications and features', '["product", "specifications", "features"]', 'processed', 'completed', 63, 63, 1),

-- NonProfit Documents (tenant_id = 8)
(8, 17, 18, 'program-guidelines.pdf', 'doc_14n5o6p_program-guidelines.pdf', '/uploads/tenant_8/doc_14n5o6p_program-guidelines.pdf', 1920000, 'application/pdf', 'sha256_hash_14n5o6p7q', 'Community Program Guidelines', 'Guidelines for community outreach programs', '["program", "guidelines", "community"]', 'processed', 'completed', 47, 47, 1);

-- Sample Document Versions
INSERT INTO document_versions (document_id, version_number, uploaded_by, stored_filename, file_path, file_size, change_notes) VALUES
(1, 1, 1, 'doc_1a2b3c_user-manual-v1.pdf', '/uploads/tenant_1/versions/doc_1a2b3c_user-manual-v1.pdf', 1948576, 'Initial version'),
(1, 2, 1, 'doc_1a2b3c_user-manual-v2.pdf', '/uploads/tenant_1/doc_1a2b3c_user-manual-v2.pdf', 2048576, 'Updated with new features and bug fixes'),
(2, 1, 1, 'doc_2b3c4d_api-reference-v1.pdf', '/uploads/tenant_1/versions/doc_2b3c4d_api-reference-v1.pdf', 1436000, 'Initial API documentation'),
(5, 1, 5, 'doc_5e6f7g_business-plan-v1.pdf', '/uploads/tenant_2/versions/doc_5e6f7g_business-plan-v1.pdf', 3896000, 'Draft business plan'),
(11, 1, 13, 'doc_11k2l3m_security-policy-v1.pdf', '/uploads/tenant_6/versions/doc_11k2l3m_security-policy-v1.pdf', 3384000, 'Initial security policy draft');

-- Sample Document Chunks
INSERT INTO document_chunks (document_id, tenant_id, chunk_index, content, content_hash, token_count, weaviate_id, embedding_status, metadata) VALUES
(1, 1, 0, 'Welcome to our product! This user manual will guide you through all the features and functionalities available in version 2.0. Our product is designed to be intuitive and user-friendly, making it easy for both beginners and advanced users to get the most out of their experience.', 'chunk_hash_001', 52, 'weaviate_id_001', 'completed', '{"page": 1, "section": "introduction", "chapter": "welcome"}'),
(1, 1, 1, 'Getting Started: To begin using our product, first ensure you have the necessary system requirements. You will need a modern web browser (Chrome, Firefox, Safari, or Edge), a stable internet connection with at least 5 Mbps speed, and JavaScript enabled in your browser settings.', 'chunk_hash_002', 48, 'weaviate_id_002', 'completed', '{"page": 2, "section": "getting-started", "chapter": "requirements"}'),
(1, 1, 2, 'Account Setup: Creating your account is simple. Navigate to the registration page, provide your email address, create a secure password, and verify your email. Once verified, you can access all basic features immediately.', 'chunk_hash_003', 38, 'weaviate_id_003', 'completed', '{"page": 3, "section": "account-setup", "chapter": "registration"}'),

(2, 1, 0, 'API Overview: Our RESTful API provides programmatic access to all core features of our platform. Authentication is required for all API calls using JWT tokens. The API follows standard HTTP methods and returns JSON responses.', 'chunk_hash_004', 37, 'weaviate_id_004', 'completed', '{"page": 1, "section": "overview", "chapter": "introduction"}'),
(2, 1, 1, 'Authentication: To authenticate with our API, you must include a valid JWT token in the Authorization header of each request. Tokens can be obtained by making a POST request to /api/auth/login with valid credentials.', 'chunk_hash_005', 40, 'weaviate_id_005', 'completed', '{"page": 2, "section": "authentication", "chapter": "jwt-tokens"}'),

(5, 2, 0, 'Executive Summary: This business plan outlines our strategy for aggressive growth in 2024. We project 300% revenue growth through strategic market expansion, innovative product launches, and enhanced customer acquisition strategies.', 'chunk_hash_006', 34, 'weaviate_id_006', 'completed', '{"page": 1, "section": "executive-summary", "chapter": "overview"}'),
(5, 2, 1, 'Market Analysis: Our target market shows strong demand for AI-powered solutions. The total addressable market is estimated at $50 billion, with our serviceable addressable market representing $5 billion opportunity.', 'chunk_hash_007', 33, 'weaviate_id_007', 'completed', '{"page": 5, "section": "market-analysis", "chapter": "opportunity"}'),

(8, 3, 0, 'Daily Operations Checklist: Start each day by reviewing the task queue, checking inventory levels, and ensuring all systems are operational. This systematic approach helps maintain consistent service quality and operational efficiency.', 'chunk_hash_008', 35, 'weaviate_id_008', 'completed', '{"page": 1, "section": "daily-checklist", "chapter": "morning-routine"}'),
(8, 3, 1, 'Customer Interaction Guidelines: Always greet customers warmly, listen actively to their needs, and provide solutions that exceed their expectations. Follow up on all interactions to ensure satisfaction and build long-term relationships.', 'chunk_hash_009', 36, 'weaviate_id_009', 'completed', '{"page": 15, "section": "customer-service", "chapter": "interactions"}'),

(11, 6, 0, 'Security Framework: Our enterprise security framework is built on zero-trust principles, implementing multi-layered security controls across all systems and data. This comprehensive approach ensures robust protection against evolving threats.', 'chunk_hash_010', 35, 'weaviate_id_010', 'completed', '{"page": 1, "section": "framework", "chapter": "overview"}'),
(11, 6, 1, 'Access Control: All system access must be authenticated and authorized through our centralized identity management system. Role-based access controls ensure users have appropriate permissions for their responsibilities.', 'chunk_hash_011', 32, 'weaviate_id_011', 'completed', '{"page": 8, "section": "access-control", "chapter": "rbac"}');

-- Sample Chat Sessions
INSERT INTO chat_sessions (id, tenant_id, user_id, session_name, context_documents, session_metadata, status, ip_address, user_agent, started_at, last_activity) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1, 3, 'Product Help Session', '[1, 2]', '{"browser": "chrome", "device": "desktop", "referrer": "dashboard"}', 'active', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 5 MINUTE),
('550e8400-e29b-41d4-a716-446655440002', 2, 6, 'Business Strategy Discussion', '[5, 7]', '{"browser": "firefox", "device": "laptop", "referrer": "direct"}', 'ended', '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 20 HOUR),
('550e8400-e29b-41d4-a716-446655440003', 3, NULL, 'Anonymous Support', '[8, 9]', '{"browser": "safari", "device": "mobile", "referrer": "google"}', 'active', '172.16.0.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)', NOW() - INTERVAL 30 MINUTE, NOW() - INTERVAL 2 MINUTE),
('550e8400-e29b-41d4-a716-446655440004', 1, 1, 'API Documentation Query', '[2]', '{"browser": "chrome", "device": "desktop", "referrer": "documentation"}', 'ended', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),
('550e8400-e29b-41d4-a716-446655440005', 6, 15, 'Enterprise Security Inquiry', '[11, 12]', '{"browser": "edge", "device": "desktop", "referrer": "intranet"}', 'active', '198.51.100.78', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 10 MINUTE),
('550e8400-e29b-41d4-a716-446655440006', 7, 16, 'Product Specification Help', '[13]', '{"browser": "chrome", "device": "tablet", "referrer": "support_portal"}', 'ended', '192.0.2.134', 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)', NOW() - INTERVAL 4 HOUR, NOW() - INTERVAL 3 HOUR),
('550e8400-e29b-41d4-a716-446655440007', 8, 19, 'Program Guidelines Question', '[14]', '{"browser": "firefox", "device": "desktop", "referrer": "email"}', 'active', '203.0.113.156', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', NOW() - INTERVAL 45 MINUTE, NOW() - INTERVAL 15 MINUTE),
('550e8400-e29b-41d4-a716-446655440008', 2, 5, 'Marketing Campaign Planning', '[6]', '{"browser": "safari", "device": "desktop", "referrer": "bookmark"}', 'ended', '10.0.0.51', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 1 DAY);

-- Sample Chat Messages
INSERT INTO chat_messages (session_id, tenant_id, message_type, content, content_hash, token_count, model_used, context_chunks, processing_time_ms, cost_estimate, feedback_rating, feedback_comment, metadata) VALUES
-- Session 1 Messages (TechCorp Product Help)
('550e8400-e29b-41d4-a716-446655440001', 1, 'user', 'How do I reset my password?', 'msg_hash_001', 8, NULL, NULL, NULL, NULL, NULL, NULL, '{"timestamp": "2024-01-15T10:30:00Z", "user_agent": "chrome"}'),
('550e8400-e29b-41d4-a716-446655440001', 1, 'assistant', 'To reset your password, you can follow these steps from our user manual: 1) Go to the login page, 2) Click "Forgot Password", 3) Enter your email address, 4) Check your email for reset instructions. The reset link will be valid for 24 hours.', 'msg_hash_002', 52, 'gpt-3.5-turbo', '[1]', 1250, 0.002500, 5, 'Very helpful and clear!', '{"timestamp": "2024-01-15T10:30:05Z", "context_used": true}'),
('550e8400-e29b-41d4-a716-446655440001', 1, 'user', 'What are the system requirements?', 'msg_hash_003', 7, NULL, NULL, NULL, NULL, NULL, NULL, '{"timestamp": "2024-01-15T10:32:00Z", "user_agent": "chrome"}'),
('550e8400-e29b-41d4-a716-446655440001', 1, 'assistant', 'According to our documentation, the system requirements are: Modern web browser (Chrome, Firefox, Safari, Edge), stable internet connection with at least 5 Mbps speed, and JavaScript enabled. No additional software installation is required.', 'msg_hash_004', 42, 'gpt-3.5-turbo', '[1]', 980, 0.001960, 4, 'Good information', '{"timestamp": "2024-01-15T10:32:03Z", "context_used": true}'),

-- Session 2 Messages (StartupHub Business Strategy)
('550e8400-e29b-41d4-a716-446655440002', 2, 'user', 'What is our projected revenue growth for 2024?', 'msg_hash_005', 10, NULL, NULL, NULL, NULL, NULL, NULL, '{"timestamp": "2024-01-14T15:20:00Z", "user_agent": "firefox"}'),
('550e8400-e29b-41d4-a716-446655440002', 2, 'assistant', 'Based on our business plan, we are projecting 300% revenue growth for 2024 through strategic market expansion and innovative product launches. This ambitious target is supported by our comprehensive market analysis and strategic initiatives.', 'msg_hash_006', 38, 'gpt-4', '[5]', 1800, 0.008400, 5, 'Exactly what I needed', '{"timestamp": "2024-01-14T15:20:04Z", "context_used": true}'),
('550e8400-e29b-41d4-a716-446655440002', 2, 'user', 'What marketing strategies are we implementing?', 'msg_hash_007', 8, NULL, NULL, NULL, NULL, NULL, NULL, '{"timestamp": "2024-01-14T15:22:00Z", "user_agent": "firefox"}'),
('550e8400-e29b-41d4-a716-446655440002', 2, 'assistant', 'Our Q1 marketing strategy focuses on digital marketing campaigns, content marketing, and strategic partnerships. We are implementing multi-channel approaches to reach our target audience effectively and maximize customer acquisition.', 'msg_hash_008', 35, 'gpt-4', '[6]', 1650, 0.007350, 4, NULL, '{"timestamp": "2024-01-14T15:22:03Z", "context_used": true}'),

-- Session 3 Messages (LocalBiz Anonymous Support)
('550e8400-e29b-41d4-a716-446655440003', 3, 'user', 'What should I do first when I start my shift?', 'msg_hash_009', 12, NULL, NULL, NULL, NULL, NULL, NULL, '{"timestamp": "2024-01-15T14:30:00Z", "user_agent": "safari"}'),
('550e8400-e29b-41d4-a716-446655440003', 3, 'assistant', 'According to our operations manual, when starting your shift you should: 1) Review the task queue, 2) Check inventory levels, 3) Ensure all systems are operational. This systematic approach helps maintain consistent service quality.', 'msg_hash_010', 38, 'gpt-3.5-turbo', '[8]', 1100, 0.002200, NULL, NULL, '{"timestamp": "2024-01-15T14:30:03Z", "context_used": true}'),
('550e8400-e29b-41d4-a716-446655440003', 3, 'user', 'How should I handle difficult customers?', 'msg_hash_011', 8, NULL, NULL, NULL, NULL, NULL, NULL, '{"timestamp": "2024-01-15T14:32:00Z", "user_agent": "safari"}'),
('550e8400-e29b-41d4-a716-446655440003', 3, 'assistant', 'When dealing with difficult customers, always remain calm and professional. Listen actively to their concerns, acknowledge their feelings, and work together to find a solution. Follow up to ensure their satisfaction and build trust.', 'msg_hash_012', 39, 'gpt-3.5-turbo', '[9]', 1150, 0.002300, NULL, NULL, '{"timestamp": "2024-01-15T14:32:04Z", "context_used": true}'),

-- Session 4 Messages (TechCorp API Documentation)
('550e8400-e29b-41d4-a716-446655440004', 1, 'user', 'How do I authenticate with the API?', 'msg_hash_013', 9, NULL, NULL, NULL, NULL, NULL, NULL, '{"timestamp": "2024-01-12T09:15:00Z", "user_agent": "chrome"}'),
('550e8400-e29b-41d4-a716-446655440004', 1, 'assistant', 'To authenticate with our API, you need to include a valid JWT token in the Authorization header of each request. You can obtain tokens by making a POST request to /api/auth/login with your valid credentials.', 'msg_hash_014', 41, 'gpt-3.5-turbo', '[2]', 1350, 0.002700, 5, 'Perfect explanation', '{"timestamp": "2024-01-12T09:15:04Z", "context_used": true}'),

-- Session 5 Messages (Global Enterprise Security)
('550e8400-e29b-41d4-a716-446655440005', 6, 'user', 'What security framework does the company use?', 'msg_hash_015', 9, NULL, NULL, NULL, NULL, NULL, NULL, '{"timestamp": "2024-01-15T16:10:00Z", "user_agent": "edge"}'),
('550e8400-e29b-41d4-a716-446655440005', 6, 'assistant', 'Our enterprise security framework is built on zero-trust principles, implementing multi-layered security controls across all systems and data. This comprehensive approach ensures robust protection against evolving cyber threats.', 'msg_hash_016', 34, 'gpt-4', '[11]', 1920, 0.009600, 5, 'Comprehensive answer', '{"timestamp": "2024-01-15T16:10:05Z", "context_used": true}'),

-- Session 6 Messages (MediumCorp Product Specs)
('550e8400-e29b-41d4-a716-446655440006', 7, 'user', 'What are the key features in version 3.2?', 'msg_hash_017', 10, NULL, NULL, NULL, NULL, NULL, NULL, '{"timestamp": "2024-01-15T13:20:00Z", "user_agent": "chrome"}'),
('550e8400-e29b-41d4-a716-446655440006', 7, 'assistant', 'Version 3.2 includes several key enhancements: improved performance optimization, enhanced user interface, advanced analytics dashboard, and new integration capabilities. These updates provide better user experience and functionality.', 'msg_hash_018', 33, 'gpt-3.5-turbo', '[13]', 1080, 0.002160, 4, NULL, '{"timestamp": "2024-01-15T13:20:03Z", "context_used": true}'),

-- Session 8 Messages (StartupHub Marketing Campaign)
('550e8400-e29b-41d4-a716-446655440008', 2, 'user', 'What channels should we focus on for our Q1 campaign?', 'msg_hash_021', 12, NULL, NULL, NULL, NULL, NULL, NULL, '{"timestamp": "2024-01-13T11:30:00Z", "user_agent": "safari"}'),
('550e8400-e29b-41d4-a716-446655440008', 2, 'assistant', 'For Q1, our marketing strategy recommends focusing on digital channels including social media marketing, content marketing, email campaigns, and strategic partnerships. These channels offer the best ROI and reach for our target audience.', 'msg_hash_022', 39, 'gpt-4', '[6]', 1750, 0.008750, 5, 'Strategic insight', '{"timestamp": "2024-01-13T11:30:04Z", "context_used": true}');

-- Sample Tenant Configurations
INSERT INTO tenant_configurations (tenant_id, config_key, config_value, config_type, description, is_encrypted, updated_by) VALUES
-- TechCorp Configurations (tenant_id = 1)
(1, 'openai_api_key', 'sk-encrypted-api-key-techcorp-xxxxx', 'string', 'OpenAI API key for AI services', 1, 1),
(1, 'max_file_size_mb', '50', 'integer', 'Maximum file upload size in MB', 0, 1),
(1, 'enable_analytics', 'true', 'boolean', 'Enable analytics tracking', 0, 1),
(1, 'chat_session_timeout', '3600', 'integer', 'Chat session timeout in seconds', 0, 1),
(1, 'welcome_message', 'Welcome to TechCorp Support! How can I help you today?', 'string', 'Default chat welcome message', 0, 1),
(1, 'max_context_chunks', '10', 'integer', 'Maximum context chunks per response', 0, 1),
(1, 'enable_feedback', 'true', 'boolean', 'Enable user feedback collection', 0, 1),

-- StartupHub Configurations (tenant_id = 2)
(2, 'openai_api_key', 'sk-encrypted-api-key-startuphub-xxxxx', 'string', 'OpenAI API key for AI services', 1, 5),
(2, 'max_file_size_mb', '25', 'integer', 'Maximum file upload size in MB', 0, 5),
(2, 'enable_analytics', 'true', 'boolean', 'Enable analytics tracking', 0, 5),
(2, 'chat_theme', '{"primaryColor": "#059669", "accentColor": "#10b981", "fontFamily": "Inter"}', 'json', 'Chat interface theme settings', 0, 5),
(2, 'business_hours', '{"start": "08:00", "end": "18:00", "timezone": "EST"}', 'json', 'Business operating hours', 0, 5),
(2, 'enable_anonymous_chat', 'true', 'boolean', 'Allow anonymous chat sessions', 0, 5),

-- LocalBiz Configurations (tenant_id = 3)
(3, 'openai_api_key', 'sk-encrypted-api-key-localbiz-xxxxx', 'string', 'OpenAI API key for AI services', 1, 8),
(3, 'max_file_size_mb', '10', 'integer', 'Maximum file upload size in MB', 0, 8),
(3, 'enable_analytics', 'false', 'boolean', 'Enable analytics tracking', 0, 8),
(3, 'business_hours', '{"start": "09:00", "end": "17:00", "timezone": "PST"}', 'json', 'Business operating hours', 0, 8),
(3, 'welcome_message', 'Hello! Welcome to LocalBiz support. How may we assist you?', 'string', 'Default chat welcome message', 0, 8),

-- FreeTier Configurations (tenant_id = 4)
(4, 'max_file_size_mb', '5', 'integer', 'Maximum file upload size in MB', 0, 11),
(4, 'enable_analytics', 'false', 'boolean', 'Enable analytics tracking', 0, 11),
(4, 'chat_session_limit', '10', 'integer', 'Maximum chat sessions per day', 0, 11),
(4, 'welcome_message', 'Welcome to our demo! Try out our AI chatbot features.', 'string', 'Default chat welcome message', 0, 11),

-- Global Enterprise Configurations (tenant_id = 6)
(6, 'openai_api_key', 'sk-encrypted-api-key-globalent-xxxxx', 'string', 'OpenAI API key for AI services', 1, 13),
(6, 'max_file_size_mb', '100', 'integer', 'Maximum file upload size in MB', 0, 13),
(6, 'enable_analytics', 'true', 'boolean', 'Enable analytics tracking', 0, 13),
(6, 'enable_audit_logging', 'true', 'boolean', 'Enable comprehensive audit logging', 0, 13),
(6, 'security_level', 'enterprise', 'string', 'Security compliance level', 0, 13),
(6, 'sso_enabled', 'true', 'boolean', 'Single Sign-On integration enabled', 0, 13),

-- MediumCorp Configurations (tenant_id = 7)
(7, 'openai_api_key', 'sk-encrypted-api-key-mediumcorp-xxxxx', 'string', 'OpenAI API key for AI services', 1, 16),
(7, 'max_file_size_mb', '30', 'integer', 'Maximum file upload size in MB', 0, 16),
(7, 'enable_analytics', 'true', 'boolean', 'Enable analytics tracking', 0, 16),
(7, 'chat_theme', '{"primaryColor": "#f59e0b", "accentColor": "#fbbf24"}', 'json', 'Chat interface theme settings', 0, 16),

-- NonProfit Configurations (tenant_id = 8)
(8, 'openai_api_key', 'sk-encrypted-api-key-nonprofit-xxxxx', 'string', 'OpenAI API key for AI services', 1, 18),
(8, 'max_file_size_mb', '15', 'integer', 'Maximum file upload size in MB', 0, 18),
(8, 'enable_analytics', 'true', 'boolean', 'Enable analytics tracking', 0, 18),
(8, 'volunteer_access', 'true', 'boolean', 'Allow volunteer access to chat system', 0, 18);

-- Sample API Usage Logs
INSERT INTO api_usage_logs (tenant_id, user_id, session_id, endpoint, method, request_size, response_size, response_time_ms, status_code, ip_address, user_agent, created_at) VALUES
-- TechCorp API Usage
(1, 3, '550e8400-e29b-41d4-a716-446655440001', '/api/chat', 'POST', 256, 1024, 1250, 200, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 2 HOUR),
(1, 3, '550e8400-e29b-41d4-a716-446655440001', '/api/chat', 'POST', 198, 856, 980, 200, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 2 HOUR + INTERVAL 2 MINUTE),
(1, 1, NULL, '/api/upload-pdfs', 'POST', 2048576, 512, 5600, 200, '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 3 DAY),
(1, 1, '550e8400-e29b-41d4-a716-446655440004', '/api/chat', 'POST', 287, 1123, 1350, 200, '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 3 DAY),
(1, 2, NULL, '/api/reindex', 'POST', 128, 256, 15000, 200, '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 1 DAY),

-- StartupHub API Usage
(2, 6, '550e8400-e29b-41d4-a716-446655440002', '/api/chat', 'POST', 312, 1456, 1800, 200, '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL 1 DAY),
(2, 6, '550e8400-e29b-41d4-a716-446655440002', '/api/chat', 'POST', 245, 1234, 1650, 200, '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL 1 DAY + INTERVAL 2 MINUTE),
(2, 5, NULL, '/api/stats', 'GET', 0, 2048, 320, 200, '10.0.0.51', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL 4 HOUR),
(2, 5, '550e8400-e29b-41d4-a716-446655440008', '/api/chat', 'POST', 298, 1367, 1750, 200, '10.0.0.51', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL 2 DAY),

-- LocalBiz API Usage
(3, NULL, '550e8400-e29b-41d4-a716-446655440003', '/api/chat', 'POST', 287, 1123, 1100, 200, '172.16.0.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)', NOW() - INTERVAL 28 MINUTE),
(3, NULL, '550e8400-e29b-41d4-a716-446655440003', '/api/chat', 'POST', 234, 1089, 1150, 200, '172.16.0.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)', NOW() - INTERVAL 26 MINUTE),
(3, 8, NULL, '/api/upload-pdfs', 'POST', 2560000, 456, 8900, 200, '172.16.0.26', 'Mozilla/5.0 (X11; Linux x86_64)', NOW() - INTERVAL 5 DAY),

-- Global Enterprise API Usage
(6, 15, '550e8400-e29b-41d4-a716-446655440005', '/api/chat', 'POST', 289, 1245, 1920, 200, '198.51.100.78', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 50 MINUTE),
(6, 13, NULL, '/api/health', 'GET', 0, 512, 145, 200, '198.51.100.79', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 2 HOUR),
(6, 14, NULL, '/api/upload-pdfs', 'POST', 4608000, 678, 12300, 200, '198.51.100.80', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 1 DAY),

-- MediumCorp API Usage
(7, 16, '550e8400-e29b-41d4-a716-446655440006', '/api/chat', 'POST', 298, 1145, 1080, 200, '192.0.2.134', 'Mozilla/5.0 (iPad; CPU OS 14_7_1)', NOW() - INTERVAL 3 HOUR),
(7, 17, NULL, '/api/stats', 'GET', 0, 1876, 245, 200, '192.0.2.135', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 6 HOUR),

-- NonProfit API Usage
(8, 19, '550e8400-e29b-41d4-a716-446655440007', '/api/chat', 'POST', 267, 1198, 1180, 200, '203.0.113.156', 'Mozilla/5.0 (X11; Linux x86_64)', NOW() - INTERVAL 20 MINUTE),
(8, 18, NULL, '/api/upload-pdfs', 'POST', 1920000, 423, 7800, 200, '203.0.113.157', 'Mozilla/5.0 (X11; Linux x86_64)', NOW() - INTERVAL 2 DAY);

-- Sample Tenant Analytics (Last 30 days for active tenants)
INSERT INTO tenant_analytics (tenant_id, metric_date, active_users, new_users, chat_sessions, messages_sent, messages_received, documents_uploaded, storage_used_mb, api_calls, processing_time_avg_ms, cost_estimate) VALUES
-- TechCorp Analytics (Last 7 days)
(1, CURDATE() - INTERVAL 7 DAY, 25, 3, 45, 156, 156, 2, 150.5, 312, 1250, 15.75),
(1, CURDATE() - INTERVAL 6 DAY, 28, 1, 52, 189, 189, 1, 175.2, 378, 1180, 18.90),
(1, CURDATE() - INTERVAL 5 DAY, 32, 2, 61, 234, 234, 0, 175.2, 468, 1320, 23.40),
(1, CURDATE() - INTERVAL 4 DAY, 29, 0, 38, 145, 145, 1, 198.7, 290, 1150, 14.50),
(1, CURDATE() - INTERVAL 3 DAY, 31, 1, 47, 178, 178, 3, 245.3, 356, 1280, 17.80),
(1, CURDATE() - INTERVAL 2 DAY, 35, 2, 58, 221, 221, 0, 245.3, 442, 1190, 22.10),
(1, CURDATE() - INTERVAL 1 DAY, 33, 0, 41, 167, 167, 1, 267.8, 334, 1230, 16.70),

-- StartupHub Analytics (Last 7 days)
(2, CURDATE() - INTERVAL 7 DAY, 12, 1, 18, 65, 65, 1, 95.3, 130, 1680, 13.00),
(2, CURDATE() - INTERVAL 6 DAY, 15, 2, 23, 89, 89, 0, 95.3, 178, 1520, 17.80),
(2, CURDATE() - INTERVAL 5 DAY, 14, 0, 19, 72, 72, 1, 112.7, 144, 1590, 14.40),
(2, CURDATE() - INTERVAL 4 DAY, 16, 1, 25, 98, 98, 0, 112.7, 196, 1650, 19.60),
(2, CURDATE() - INTERVAL 3 DAY, 18, 0, 28, 115, 115, 2, 148.9, 230, 1720, 23.00),
(2, CURDATE() - INTERVAL 2 DAY, 17, 1, 24, 94, 94, 0, 148.9, 188, 1580, 18.80),
(2, CURDATE() - INTERVAL 1 DAY, 19, 0, 31, 127, 127, 1, 165.4, 254, 1640, 25.40),

-- LocalBiz Analytics (Last 7 days)
(3, CURDATE() - INTERVAL 7 DAY, 5, 0, 8, 24, 24, 0, 45.2, 48, 1100, 2.40),
(3, CURDATE() - INTERVAL 6 DAY, 6, 1, 12, 38, 38, 1, 67.8, 76, 1080, 3.80),
(3, CURDATE() - INTERVAL 5 DAY, 7, 0, 15, 47, 47, 0, 67.8, 94, 1150, 4.70),
(3, CURDATE() - INTERVAL 4 DAY, 5, 0, 9, 28, 28, 0, 67.8, 56, 1120, 2.80),
(3, CURDATE() - INTERVAL 3 DAY, 8, 1, 18, 56, 56, 1, 89.1, 112, 1090, 5.60),
(3, CURDATE() - INTERVAL 2 DAY, 6, 0, 11, 34, 34, 0, 89.1, 68, 1110, 3.40),
(3, CURDATE() - INTERVAL 1 DAY, 7, 0, 14, 43, 43, 0, 89.1, 86, 1130, 4.30),

-- FreeTier Analytics (Last 7 days)
(4, CURDATE() - INTERVAL 7 DAY, 2, 0, 3, 8, 8, 0, 12.5, 16, 1200, 0.80),
(4, CURDATE() - INTERVAL 6 DAY, 3, 1, 5, 14, 14, 0, 12.5, 28, 1150, 1.40),
(4, CURDATE() - INTERVAL 5 DAY, 2, 0, 4, 12, 12, 0, 12.5, 24, 1180, 1.20),
(4, CURDATE() - INTERVAL 4 DAY, 4, 1, 6, 18, 18, 0, 12.5, 36, 1220, 1.80),
(4, CURDATE() - INTERVAL 3 DAY, 3, 0, 4, 11, 11, 0, 12.5, 22, 1190, 1.10),
(4, CURDATE() - INTERVAL 2 DAY, 2, 0, 3, 9, 9, 0, 12.5, 18, 1160, 0.90),
(4, CURDATE() - INTERVAL 1 DAY, 3, 0, 5, 15, 15, 0, 12.5, 30, 1200, 1.50),

-- Global Enterprise Analytics (Last 7 days)
(6, CURDATE() - INTERVAL 7 DAY, 89, 5, 156, 567, 567, 8, 1245.7, 1134, 1580, 113.40),
(6, CURDATE() - INTERVAL 6 DAY, 92, 3, 178, 645, 645, 6, 1378.2, 1290, 1520, 129.00),
(6, CURDATE() - INTERVAL 5 DAY, 95, 4, 189, 689, 689, 9, 1567.8, 1378, 1610, 137.80),
(6, CURDATE() - INTERVAL 4 DAY, 88, 2, 167, 598, 598, 5, 1645.3, 1196, 1550, 119.60),
(6, CURDATE() - INTERVAL 3 DAY, 94, 6, 201, 734, 734, 12, 1832.9, 1468, 1620, 146.80),
(6, CURDATE() - INTERVAL 2 DAY, 97, 3, 215, 789, 789, 7, 1945.6, 1578, 1590, 157.80),
(6, CURDATE() - INTERVAL 1 DAY, 91, 1, 198, 723, 723, 4, 2012.4, 1446, 1600, 144.60),

-- MediumCorp Analytics (Last 7 days)
(7, CURDATE() - INTERVAL 7 DAY, 34, 2, 45, 167, 167, 3, 287.9, 334, 1420, 33.40),
(7, CURDATE() - INTERVAL 6 DAY, 38, 4, 52, 189, 189, 2, 323.4, 378, 1380, 37.80),
(7, CURDATE() - INTERVAL 5 DAY, 35, 1, 48, 175, 175, 1, 345.7, 350, 1450, 35.00),
(7, CURDATE() - INTERVAL 4 DAY, 41, 3, 58, 203, 203, 4, 398.2, 406, 1390, 40.60),
(7, CURDATE() - INTERVAL 3 DAY, 39, 0, 54, 198, 198, 2, 434.8, 396, 1410, 39.60),
(7, CURDATE() - INTERVAL 2 DAY, 42, 2, 61, 223, 223, 3, 478.3, 446, 1370, 44.60),
(7, CURDATE() - INTERVAL 1 DAY, 40, 1, 56, 207, 207, 1, 501.7, 414, 1400, 41.40),

-- NonProfit Analytics (Last 7 days)
(8, CURDATE() - INTERVAL 7 DAY, 8, 1, 12, 34, 34, 1, 67.3, 68, 1250, 3.40),
(8, CURDATE() - INTERVAL 6 DAY, 9, 0, 15, 42, 42, 0, 67.3, 84, 1200, 4.20),
(8, CURDATE() - INTERVAL 5 DAY, 11, 2, 18, 51, 51, 1, 89.7, 102, 1280, 5.10),
(8, CURDATE() - INTERVAL 4 DAY, 7, 0, 11, 31, 31, 0, 89.7, 62, 1220, 3.10),
(8, CURDATE() - INTERVAL 3 DAY, 10, 1, 16, 46, 46, 2, 123.4, 92, 1260, 4.60),
(8, CURDATE() - INTERVAL 2 DAY, 9, 0, 14, 39, 39, 0, 123.4, 78, 1240, 3.90),
(8, CURDATE() - INTERVAL 1 DAY, 12, 1, 19, 54, 54, 1, 145.8, 108, 1270, 5.40);

-- Sample Subscriptions
INSERT INTO subscriptions (tenant_id, plan_name, status, billing_cycle, amount, currency, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, trial_end) VALUES
(1, 'Enterprise', 'active', 'yearly', 2999.00, 'USD', 'sub_1abc123enterprise', 'cus_techcorp123', NOW() - INTERVAL 30 DAY, NOW() + INTERVAL 335 DAY, NULL),
(2, 'Pro', 'active', 'monthly', 99.00, 'USD', 'sub_2def456pro', 'cus_startuphub456', NOW() - INTERVAL 15 DAY, NOW() + INTERVAL 15 DAY, NULL),
(3, 'Basic', 'active', 'monthly', 29.00, 'USD', 'sub_3ghi789basic', 'cus_localbiz789', NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 20 DAY, NULL),
(4, 'Free', 'active', 'monthly', 0.00, 'USD', NULL, NULL, NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 25 DAY, NOW() + INTERVAL 25 DAY),
(5, 'Basic', 'cancelled', 'monthly', 29.00, 'USD', 'sub_4jkl012cancelled', 'cus_suspended012', NOW() - INTERVAL 60 DAY, NOW() - INTERVAL 30 DAY, NULL),
(6, 'Enterprise', 'active', 'yearly', 4999.00, 'USD', 'sub_5mno345enterprise', 'cus_globalent345', NOW() - INTERVAL 45 DAY, NOW() + INTERVAL 320 DAY, NULL),
(7, 'Pro', 'active', 'monthly', 149.00, 'USD', 'sub_6pqr678pro', 'cus_mediumcorp678', NOW() - INTERVAL 20 DAY, NOW() + INTERVAL 10 DAY, NULL),
(8, 'Basic', 'active', 'yearly', 199.00, 'USD', 'sub_7stu901basic', 'cus_nonprofit901', NOW() - INTERVAL 60 DAY, NOW() + INTERVAL 305 DAY, NULL);

-- Sample Invoices
INSERT INTO invoices (tenant_id, subscription_id, invoice_number, status, amount_due, amount_paid, currency, stripe_invoice_id, due_date, paid_at) VALUES
-- TechCorp Invoices
(1, 1, 'INV-2024-001', 'paid', 2999.00, 2999.00, 'USD', 'in_1abc123invoice', CURDATE() - INTERVAL 30 DAY, NOW() - INTERVAL 29 DAY),
(1, 1, 'INV-2024-015', 'paid', 2999.00, 2999.00, 'USD', 'in_15abc456invoice', CURDATE() + INTERVAL 335 DAY, NULL),

-- StartupHub Invoices
(2, 2, 'INV-2024-002', 'paid', 99.00, 99.00, 'USD', 'in_2def456invoice', CURDATE() - INTERVAL 15 DAY, NOW() - INTERVAL 14 DAY),
(2, 2, 'INV-2024-003', 'sent', 99.00, 0.00, 'USD', 'in_3ghi789invoice', CURDATE() + INTERVAL 15 DAY, NULL),

-- LocalBiz Invoices
(3, 3, 'INV-2024-004', 'paid', 29.00, 29.00, 'USD', 'in_4jkl012invoice', CURDATE() - INTERVAL 10 DAY, NOW() - INTERVAL 9 DAY),
(3, 3, 'INV-2024-005', 'overdue', 29.00, 0.00, 'USD', 'in_5mno345invoice', CURDATE() - INTERVAL 5 DAY, NULL),

-- Global Enterprise Invoices
(6, 6, 'INV-2024-006', 'paid', 4999.00, 4999.00, 'USD', 'in_6pqr678invoice', CURDATE() - INTERVAL 45 DAY, NOW() - INTERVAL 44 DAY),
(6, 6, 'INV-2024-016', 'draft', 4999.00, 0.00, 'USD', 'in_16def789invoice', CURDATE() + INTERVAL 320 DAY, NULL),

-- MediumCorp Invoices
(7, 7, 'INV-2024-007', 'paid', 149.00, 149.00, 'USD', 'in_7stu901invoice', CURDATE() - INTERVAL 20 DAY, NOW() - INTERVAL 19 DAY),
(7, 7, 'INV-2024-008', 'sent', 149.00, 0.00, 'USD', 'in_8vwx234invoice', CURDATE() + INTERVAL 10 DAY, NULL),

-- NonProfit Invoices
(8, 8, 'INV-2024-009', 'paid', 199.00, 199.00, 'USD', 'in_9yza567invoice', CURDATE() - INTERVAL 60 DAY, NOW() - INTERVAL 59 DAY),
(8, 8, 'INV-2024-017', 'draft', 199.00, 0.00, 'USD', 'in_17ghi012invoice', CURDATE() + INTERVAL 305 DAY, NULL);

-- Sample Notifications
INSERT INTO notifications (tenant_id, user_id, type, title, message, action_url, is_read, is_system, priority, expires_at) VALUES
-- TechCorp Notifications
(1, 1, 'info', 'New Document Processed', 'Your uploaded document "API Reference Guide" has been successfully processed and is now available for chat queries.', '/documents/2', 1, 1, 'normal', NOW() + INTERVAL 7 DAY),
(1, NULL, 'success', 'Monthly Limit Reset', 'Your monthly API usage limits have been reset. You now have full access to all features for the new billing period.', NULL, 0, 1, 'low', NOW() + INTERVAL 30 DAY),
(1, 2, 'warning', 'Storage Almost Full', 'You are using 90% of your storage quota. Consider upgrading your plan or removing old documents to free up space.', '/settings/billing', 0, 1, 'high', NOW() + INTERVAL 3 DAY),
(1, 3, 'info', 'Feature Update', 'We have released new chat analytics features. Check out the enhanced reporting dashboard for detailed insights.', '/analytics', 0, 0, 'normal', NOW() + INTERVAL 14 DAY),

-- StartupHub Notifications
(2, 5, 'success', 'Welcome to Pro Plan', 'Congratulations! Your account has been upgraded to the Pro plan. Enjoy increased limits and advanced features.', '/dashboard', 1, 0, 'normal', NOW() + INTERVAL 14 DAY),
(2, NULL, 'info', 'System Maintenance', 'Scheduled maintenance will occur tonight from 2-4 AM EST. Some features may be temporarily unavailable.', NULL, 0, 1, 'normal', NOW() + INTERVAL 1 DAY),
(2, 6, 'success', 'Document Upload Complete', 'Your business plan document has been processed and indexed. It is now available for AI chat queries.', '/documents/5', 1, 1, 'normal', NOW() + INTERVAL 5 DAY),

-- LocalBiz Notifications
(3, 8, 'error', 'Payment Failed', 'Your recent payment attempt failed. Please update your payment method to continue using our services without interruption.', '/settings/billing', 0, 1, 'urgent', NOW() + INTERVAL 2 DAY),
(3, 9, 'info', 'New Feature Available', 'We have added new analytics features to your dashboard. Check them out to get insights into your chat performance.', '/analytics', 0, 0, 'low', NOW() + INTERVAL 10 DAY),
(3, 10, 'warning', 'Session Limit Approaching', 'You have used 85% of your monthly chat session limit. Consider upgrading to avoid service interruption.', '/settings/billing', 0, 1, 'normal', NOW() + INTERVAL 5 DAY),

-- FreeTier Notifications
(4, 11, 'info', 'Welcome to Free Tier', 'Welcome to our platform! You are currently on the free tier. Explore our features and upgrade when ready.', '/pricing', 1, 1, 'low', NOW() + INTERVAL 30 DAY),
(4, 12, 'warning', 'Usage Limit Reached', 'You have reached your daily chat limit. Upgrade to Pro for unlimited conversations.', '/pricing', 0, 1, 'normal', NOW() + INTERVAL 1 DAY),

-- Global Enterprise Notifications
(6, 13, 'info', 'Security Audit Complete', 'Your quarterly security audit has been completed. All systems are compliant with enterprise security standards.', '/security/audit', 1, 1, 'normal', NOW() + INTERVAL 90 DAY),
(6, 14, 'success', 'Backup Successful', 'Daily backup completed successfully. All data is securely backed up and encrypted.', NULL, 1, 1, 'low', NOW() + INTERVAL 1 DAY),
(6, 15, 'warning', 'High API Usage', 'Your API usage is 95% of monthly limit. Monitor usage or consider upgrading your plan.', '/analytics/api', 0, 1, 'high', NOW() + INTERVAL 7 DAY),

-- MediumCorp Notifications
(7, 16, 'info', 'Monthly Report Available', 'Your monthly usage report is now available. Review your teams chat performance and insights.', '/reports/monthly', 0, 1, 'normal', NOW() + INTERVAL 30 DAY),
(7, 17, 'success', 'Integration Complete', 'Slack integration has been successfully configured. Your team can now access chat features directly from Slack.', '/integrations', 1, 0, 'normal', NOW() + INTERVAL 7 DAY),

-- NonProfit Notifications
(8, 18, 'info', 'Volunteer Training', 'New volunteer training materials have been uploaded. All volunteers should review the updated guidelines.', '/documents/14', 0, 0, 'normal', NOW() + INTERVAL 21 DAY),
(8, 19, 'success', 'Grant Application', 'Great news! Your application for the technology grant has been approved. Funds will be available next month.', NULL, 1, 0, 'high', NOW() + INTERVAL 60 DAY);

-- Sample Audit Logs
INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, success) VALUES
-- TechCorp Audit Logs
(1, 1, 'document.upload', 'document', '2', NULL, '{"filename": "api-reference.pdf", "size": 1536000, "category": "API Documentation"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1),
(1, 1, 'user.login', 'user', '1', NULL, '{"login_time": "2024-01-15T08:30:00Z", "ip": "192.168.1.100"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1),
(1, 2, 'user.profile.update', 'user', '2', '{"first_name": "Jane", "last_name": "Johnson"}', '{"first_name": "Jane", "last_name": "Johnson-Smith"}', '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1),
(1, 3, 'chat.session.start', 'chat_session', '550e8400-e29b-41d4-a716-446655440001', NULL, '{"documents": [1, 2], "started_at": "2024-01-15T08:30:00Z"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1),

-- StartupHub Audit Logs
(2, 5, 'subscription.upgrade', 'subscription', '2', '{"plan": "basic", "amount": 29.00}', '{"plan": "pro", "amount": 99.00}', '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 1),
(2, 6, 'document.delete', 'document', '7', '{"filename": "old-marketing.pdf", "size": 1024000}', NULL, '10.0.0.51', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 1),
(2, 5, 'settings.update', 'tenant_configuration', '10', '{"enable_analytics": "false"}', '{"enable_analytics": "true"}', '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 1),

-- LocalBiz Audit Logs
(3, 8, 'settings.update', 'tenant_configuration', '15', '{"enable_analytics": "true"}', '{"enable_analytics": "false"}', '172.16.0.25', 'Mozilla/5.0 (X11; Linux x86_64)', 1),
(3, 9, 'password.reset.attempt', 'user', '9', NULL, '{"timestamp": "2024-01-14T15:20:00Z", "success": false}', '172.16.0.26', 'Mozilla/5.0 (X11; Linux x86_64)', 0),
(3, 10, 'document.view', 'document', '8', NULL, '{"viewed_at": "2024-01-15T10:15:00Z", "session": "550e8400-e29b-41d4-a716-446655440003"}', '172.16.0.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)', 1),

-- Global Enterprise Audit Logs
(6, 13, 'user.create', 'user', '15', NULL, '{"email": "analyst@globalenterprise.com", "role": "customer", "created_by": 13}', '198.51.100.79', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1),
(6, 14, 'security.policy.update', 'tenant_configuration', '22', '{"security_level": "standard"}', '{"security_level": "enterprise"}', '198.51.100.80', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1),
(6, 15, 'api.key.rotation', 'tenant_configuration', '20', '{"last_rotated": "2024-01-01T00:00:00Z"}', '{"last_rotated": "2024-01-15T10:00:00Z"}', '198.51.100.78', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1),

-- MediumCorp Audit Logs
(7, 16, 'integration.setup', 'tenant_configuration', '28', NULL, '{"slack_webhook": "https://hooks.slack.com/xxx", "enabled": true}', '192.0.2.134', 'Mozilla/5.0 (iPad; CPU OS 14_7_1)', 1),
(7, 17, 'billing.update', 'subscription', '7', '{"amount": 99.00}', '{"amount": 149.00}', '192.0.2.135', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1),

-- NonProfit Audit Logs
(8, 18, 'volunteer.access.granted', 'user', '19', '{"role": "customer"}', '{"role": "customer", "volunteer_access": true}', '203.0.113.157', 'Mozilla/5.0 (X11; Linux x86_64)', 1),
(8, 19, 'program.guideline.update', 'document', '14', '{"version": 1}', '{"version": 2, "updated_sections": ["eligibility", "requirements"]}', '203.0.113.156', 'Mozilla/5.0 (X11; Linux x86_64)', 1);

-- Sample System Health Checks
INSERT INTO system_health_checks (service_name, status, response_time_ms, error_message, metadata, checked_at) VALUES
-- Current Health Checks
('mysql_database', 'healthy', 45, NULL, '{"connections": 12, "max_connections": 100, "queries_per_second": 156}', NOW() - INTERVAL 5 MINUTE),
('weaviate_vector_db', 'healthy', 120, NULL, '{"vectors_count": 1247, "memory_usage": "2.1GB", "disk_usage": "15.7GB"}', NOW() - INTERVAL 5 MINUTE),
('openai_api', 'healthy', 890, NULL, '{"rate_limit_remaining": 4500, "rate_limit_reset": 3600, "model": "gpt-3.5-turbo"}', NOW() - INTERVAL 5 MINUTE),
('redis_cache', 'healthy', 12, NULL, '{"memory_usage": "256MB", "hit_ratio": 0.95, "connected_clients": 23}', NOW() - INTERVAL 5 MINUTE),
('file_storage', 'degraded', 2300, 'Slow response times detected', '{"disk_usage": "78%", "available_space": "2.2TB", "io_wait": "15%"}', NOW() - INTERVAL 5 MINUTE),
('email_service', 'healthy', 340, NULL, '{"queue_size": 23, "sent_today": 1567, "delivery_rate": 98.5}', NOW() - INTERVAL 5 MINUTE),
('nginx_load_balancer', 'healthy', 8, NULL, '{"active_connections": 234, "requests_per_second": 89, "error_rate": 0.02}', NOW() - INTERVAL 5 MINUTE),
('elasticsearch_logs', 'healthy', 156, NULL, '{"indices": 45, "documents": 2456789, "storage": "12.3GB"}', NOW() - INTERVAL 5 MINUTE),

-- Historical Health Checks (last hour)
('mysql_database', 'healthy', 52, NULL, '{"connections": 15, "max_connections": 100, "queries_per_second": 178}', NOW() - INTERVAL 1 HOUR),
('weaviate_vector_db', 'healthy', 134, NULL, '{"vectors_count": 1245, "memory_usage": "2.0GB", "disk_usage": "15.6GB"}', NOW() - INTERVAL 1 HOUR),
('openai_api', 'degraded', 1520, 'Rate limit approaching', '{"rate_limit_remaining": 450, "rate_limit_reset": 1800, "model": "gpt-3.5-turbo"}', NOW() - INTERVAL 1 HOUR),
('redis_cache', 'healthy', 15, NULL, '{"memory_usage": "248MB", "hit_ratio": 0.94, "connected_clients": 19}', NOW() - INTERVAL 1 HOUR),
('file_storage', 'unhealthy', 5600, 'Disk I/O errors detected', '{"disk_usage": "78%", "available_space": "2.2TB", "io_errors": 12}', NOW() - INTERVAL 1 HOUR),
('email_service', 'healthy', 298, NULL, '{"queue_size": 18, "sent_today": 1234, "delivery_rate": 98.8}', NOW() - INTERVAL 1 HOUR);

