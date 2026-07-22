import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * RBAC 三层模型 + 审计日志表迁移
 * 规范依据：架构项2「用户-角色-权限三层模型」+ 架构项3「区分基础表/业务主表/关联中间表/操作审计日志表」
 *
 * 生产仅 MySQL（runtime-validation 强制）；DDL 与 deploy/db/grant-crud.sql 一致。
 */
export class AddRbacAndAudit1730000000000 implements MigrationInterface {
  name = 'AddRbacAndAudit1730000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // ---- 权限表（基础表）----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS rbac_permission (
        id BIGINT NOT NULL AUTO_INCREMENT,
        code VARCHAR(128) NOT NULL,
        name VARCHAR(64) NOT NULL,
        level VARCHAR(20) NOT NULL COMMENT 'interface/button/data',
        resource VARCHAR(64) NOT NULL,
        action VARCHAR(32) NOT NULL,
        description VARCHAR(255) NULL,
        created_by BIGINT NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_by BIGINT NULL,
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        is_deleted TINYINT NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        UNIQUE KEY uk_permission_code (code),
        KEY idx_permission_resource (resource)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限项';
    `);

    // ---- 角色表（基础表）----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS rbac_role (
        id BIGINT NOT NULL AUTO_INCREMENT,
        code VARCHAR(64) NOT NULL,
        name VARCHAR(64) NOT NULL,
        description VARCHAR(255) NULL,
        is_system TINYINT NOT NULL DEFAULT 0 COMMENT '系统内置禁止删除',
        is_active TINYINT NOT NULL DEFAULT 1,
        created_by BIGINT NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_by BIGINT NULL,
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        is_deleted TINYINT NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        UNIQUE KEY uk_role_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色';
    `);

    // ---- 角色-权限关联表（中间表）----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS rbac_role_permission (
        id BIGINT NOT NULL AUTO_INCREMENT,
        role_id BIGINT NOT NULL,
        permission_id BIGINT NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uk_role_permission (role_id, permission_id),
        KEY idx_rp_role (role_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色-权限关联';
    `);

    // ---- 用户-角色关联表（中间表）----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS rbac_user_role (
        id BIGINT NOT NULL AUTO_INCREMENT,
        user_type VARCHAR(16) NOT NULL,
        user_id BIGINT NOT NULL,
        role_id BIGINT NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uk_user_role (user_type, user_id, role_id),
        KEY idx_ur_user (user_type, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-角色关联';
    `);

    // ---- 审计日志表（操作审计日志表）----
    // 关键：该表仅允许 INSERT + SELECT，由 DB 账号 grant-crud.sql 收回 UPDATE/DELETE，
    // 实现「日志不可删除、不可篡改」。
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id BIGINT NOT NULL AUTO_INCREMENT,
        request_id VARCHAR(64) NULL,
        operator_type VARCHAR(16) NOT NULL COMMENT 'admin/user/system',
        operator_id BIGINT NULL,
        operator_name VARCHAR(64) NULL,
        ip VARCHAR(64) NULL,
        method VARCHAR(10) NULL,
        path VARCHAR(255) NULL,
        action VARCHAR(64) NOT NULL COMMENT 'login/logout/permission_change/data_delete/batch_export/admin_config/...',
        resource VARCHAR(64) NULL,
        resource_id VARCHAR(64) NULL,
        detail TEXT NULL COMMENT '操作内容 JSON',
        status VARCHAR(16) NULL COMMENT 'success/failure',
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        KEY idx_audit_operator (operator_type, operator_id),
        KEY idx_audit_action (action),
        KEY idx_audit_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作审计日志';
    `);

    // ---- 存量表补齐审计字段（架构项3：所有表统一携带创建人/更新人/逻辑删除）----
    // 仅追加列，不改既有数据；新增列默认 NULL，新写入由应用填充
    await this.addColumnIfNotExists(queryRunner, 'admins', 'created_by', 'BIGINT NULL');
    await this.addColumnIfNotExists(queryRunner, 'admins', 'updated_by', 'BIGINT NULL');
    await this.addColumnIfNotExists(queryRunner, 'admins', 'is_deleted', 'TINYINT NOT NULL DEFAULT 0');
    await this.addColumnIfNotExists(queryRunner, 'users', 'is_deleted', 'TINYINT NOT NULL DEFAULT 0');

    // ---- MFA 因子表 ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mfa_factor (
        id BIGINT NOT NULL AUTO_INCREMENT,
        user_type VARCHAR(16) NOT NULL,
        user_id BIGINT NOT NULL,
        secret_encrypted VARCHAR(512) NOT NULL,
        enabled TINYINT NOT NULL DEFAULT 0,
        backup_codes_hash VARCHAR(2000) NULL,
        created_by BIGINT NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_by BIGINT NULL,
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        is_deleted TINYINT NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        UNIQUE KEY uk_mfa_user (user_type, user_id),
        KEY idx_mfa_user (user_type, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='MFA 二次验证因子';
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS mfa_factor');
    await queryRunner.query('DROP TABLE IF EXISTS audit_log');
    await queryRunner.query('DROP TABLE IF EXISTS rbac_user_role');
    await queryRunner.query('DROP TABLE IF EXISTS rbac_role_permission');
    await queryRunner.query('DROP TABLE IF EXISTS rbac_role');
    await queryRunner.query('DROP TABLE IF EXISTS rbac_permission');
  }

  private async addColumnIfNotExists(
    queryRunner: QueryRunner,
    table: string,
    column: string,
    definition: string,
  ): Promise<void> {
    const rows = (await queryRunner.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column],
    )) as Array<{ COLUMN_NAME: string }>;
    if (rows.length === 0) {
      await queryRunner.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    }
  }
}
