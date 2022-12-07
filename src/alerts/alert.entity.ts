import { 
  Entity,
  Column,
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Arrow } from 'src/arrows/arrow.entity';
import { Lead } from 'src/leads/lead.entity';
import { Role } from 'src/roles/role.entity';
import { AlertReason } from 'src/enums';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  user: User;

  
  @Column({nullable: true})
  sourceId: string;

  @ManyToOne(() => Arrow, {nullable: true})
  @JoinColumn({ referencedColumnName: 'id' })
  source: Arrow;

    
  @Column({nullable: true})
  linkId: string;

  @ManyToOne(() => Arrow, {nullable: true})
  @JoinColumn({ referencedColumnName: 'id' })
  link: Arrow;


    
  @Column({nullable: true})
  targetId: string;

  @ManyToOne(() => Arrow, {nullable: true})
  @JoinColumn({ referencedColumnName: 'id' })
  target: Arrow;



  @Column({nullable: true})
  leadId: string;

  @ManyToOne(() => Lead, {nullable: true})
  @JoinColumn({ referencedColumnName: 'id' })
  lead: Lead;


  @Column({nullable: true})
  roleId: string;

  @ManyToOne(() => Role, {nullable: true})
  @JoinColumn({ referencedColumnName: 'id' })
  role: Role;


  @Column({nullable: true})
  abstractRoleId: string;

  @ManyToOne(() => Role, {nullable: true})
  @JoinColumn({ referencedColumnName: 'id' })
  abstractRole: Role;

  @Column({
    type: 'enum',
    enum: AlertReason,
    default: AlertReason.OTHER,
  })
  reason: AlertReason;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}