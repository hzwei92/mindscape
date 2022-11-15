import { 
  Entity,
  Column,
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { RoleType } from 'src/enums';
import { Arrow } from 'src/arrows/arrow.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  user: User;

  @Column()
  arrowId: string;

  @ManyToOne(() => Arrow)
  @JoinColumn({ referencedColumnName: 'id' })
  arrow: Arrow;
  
  @Column({
    type: 'enum',
    enum: RoleType,
    default: RoleType.OTHER,
  })
  type: RoleType;

  @Column({default: true})
  isInvited: boolean;

  @Column({default: true})
  isRequested: boolean;

  @CreateDateColumn()
  createDate: Date;
  
  @UpdateDateColumn()
  updateDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}