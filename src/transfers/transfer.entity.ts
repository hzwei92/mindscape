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
import { Vote } from 'src/votes/vote.entity';
import { Arrow } from 'src/arrows/arrow.entity';

@Entity()
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  sender: User;

  @Column()
  receiverId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  receiver: User;
  
  @Column()
  points: number;

  @Column()
  reason: string;

  @Column()
  voteId: string;
  
  @ManyToOne(() => Vote)
  @JoinColumn({ referencedColumnName: 'id' })
  vote: Vote;

  @Column()
  arrowId: string;

  @ManyToOne(() => Arrow)
  @JoinColumn({ referencedColumnName: 'id' })
  arrow: Arrow;

  @CreateDateColumn()
  createDate: Date;
  
  @UpdateDateColumn()
  updateDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}