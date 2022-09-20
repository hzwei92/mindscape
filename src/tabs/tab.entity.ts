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
import { Arrow } from 'src/arrows/arrow.entity';

@Entity()
export class Tab {
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
  
  @Column()
  i: number;

  @Column({ default: false })
  isFrame: boolean;

  @Column({ default: false })
  isFocus: boolean;
  
  @CreateDateColumn()
  createDate: Date;
  
  @UpdateDateColumn()
  updateDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}