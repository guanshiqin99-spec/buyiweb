import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AdminRole } from '../common/enums/admin-role.enum';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 64 })
  username!: string;

  @Column({ length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 32, default: AdminRole.EDITOR })
  role!: AdminRole;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
