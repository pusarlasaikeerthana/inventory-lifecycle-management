CREATE DATABASE IF NOT EXISTS inventory_lifecycle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inventory_lifecycle;

CREATE TABLE users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(120) NOT NULL,
 username VARCHAR(80) NOT NULL UNIQUE,
 email VARCHAR(180) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL,
 role ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER',
 active TINYINT(1) NOT NULL DEFAULT 1,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE assets (
 id INT AUTO_INCREMENT PRIMARY KEY,
 serial_number VARCHAR(100) NOT NULL UNIQUE,
 asset_type VARCHAR(80) NOT NULL,
 make VARCHAR(100),
 asset_model VARCHAR(120),
 status ENUM('Active','Transfer Pending','Removal Pending','Removed') NOT NULL DEFAULT 'Active',
 owner_id INT NOT NULL,
 custodian_id INT NULL,
 transfer_to_id INT NULL,
 team VARCHAR(150),
 location VARCHAR(120),
 pending_team VARCHAR(150),
 pending_location VARCHAR(120),
 device_category VARCHAR(100),
 imei VARCHAR(100),
 mobile_number VARCHAR(40),
 sim_managed_by VARCHAR(100),
 sim_country VARCHAR(100),
 reason VARCHAR(255),
 comments TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 CONSTRAINT fk_asset_owner FOREIGN KEY(owner_id) REFERENCES users(id),
 CONSTRAINT fk_asset_custodian FOREIGN KEY(custodian_id) REFERENCES users(id),
 CONSTRAINT fk_asset_transfer FOREIGN KEY(transfer_to_id) REFERENCES users(id),
 INDEX idx_asset_status(status), INDEX idx_asset_owner(owner_id), INDEX idx_asset_type(asset_type), INDEX idx_asset_updated(updated_at)
);
CREATE TABLE asset_transactions (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 asset_id INT NOT NULL,
 actor_id INT NOT NULL,
 action_type VARCHAR(60) NOT NULL,
 details JSON,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(asset_id) REFERENCES assets(id), FOREIGN KEY(actor_id) REFERENCES users(id),
 INDEX idx_tx_asset(asset_id), INDEX idx_tx_created(created_at)
);
CREATE TABLE tickets (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 ticket_code VARCHAR(40) UNIQUE,
 requester_id INT NOT NULL,
 asset_id INT NOT NULL,
 title VARCHAR(255) NOT NULL,
 description TEXT,
 status ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(requester_id) REFERENCES users(id), FOREIGN KEY(asset_id) REFERENCES assets(id),
 INDEX idx_ticket_status(status), INDEX idx_ticket_asset(asset_id)
);
CREATE TABLE email_notifications (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 ticket_id BIGINT NULL,
 recipient VARCHAR(180) NOT NULL,
 subject VARCHAR(255) NOT NULL,
 status VARCHAR(40) DEFAULT 'SIMULATED',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(ticket_id) REFERENCES tickets(id)
);
CREATE TABLE dropdown_config (
 id INT AUTO_INCREMENT PRIMARY KEY,
 config_group VARCHAR(60) NOT NULL,
 config_value VARCHAR(120) NOT NULL,
 sort_order INT DEFAULT 0,
 active TINYINT(1) DEFAULT 1,
 UNIQUE KEY uq_dropdown(config_group,config_value)
);
CREATE TABLE audit_logs (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 actor_id INT NOT NULL,
 entity_type VARCHAR(50) NOT NULL,
 entity_id INT NOT NULL,
 action VARCHAR(80) NOT NULL,
 details JSON,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(actor_id) REFERENCES users(id), INDEX idx_audit_entity(entity_type,entity_id), INDEX idx_audit_created(created_at)
);
