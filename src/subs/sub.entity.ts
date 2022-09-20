import { 
  Entity,
  Column,
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Arrow } from 'src/arrows/arrow.entity';

@Entity()
export class Sub {
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
  
  @CreateDateColumn()
  createDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}